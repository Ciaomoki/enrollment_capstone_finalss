"use strict";

const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const ExcelJS = require("exceljs");
const { parse: parseCsvSync } = require("csv-parse/sync");
const pdfParse = require("pdf-parse");
const { v4: uuidv4 } = require("uuid");
const { pool, insertUpload, findBySha, findByOriginalNameType } = require("../db"); // Keep for upload tracking if needed

const router = express.Router();

/* =========================================================================
   LIST UPLOADS - SCAN DIRECTORY FOR REAL-TIME PROJECT FILES
   ========================================================================= */
router.get('/uploads', async (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'studentlist_imports');
    let uploads = [];
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir).filter((f) =>
        ACCEPTED_EXTS.has(path.extname(f).toLowerCase())
      );
      uploads = files.map((file) => {
        const stats = fs.statSync(path.join(uploadDir, file));
        return {
          id: file, // Use filename as ID for file-based
          originalName: file,
          storedName: file,
          size: stats.size,
          createdAt: stats.birthtime,
          relPath: `/uploads/studentlist_imports/${file}`,
        };
      }).sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
    }

    res.json({
      success: true,
      uploads,
    });
  } catch (e) {
    console.error("[adminstudlist:uploads] error", e);
    res.status(500).json({ success: false, error: "Failed to fetch uploads" });
  }
});

/* =========================================================================
   DELETE UPLOAD
   ========================================================================= */
router.delete('/uploads/:id', async (req, res) => {
  const filename = req.params.id;
  if (!filename) {
    return res.status(400).json({ success: false, error: "Invalid filename" });
  }

  try {
    const filePath = path.join(__dirname, "..", "uploads", "studentlist_imports", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[adminstudlist:delete-upload] Deleted file: ${filePath}`);
    }

    // Mark as deleted in DB if record exists
    const existing = await findByOriginalNameType(filename, 'grades');
    if (existing) {
      await pool.query('UPDATE uploads SET deleted = 1 WHERE id = ?', [existing.id]);
      console.log(`[adminstudlist:delete-upload] Marked DB record as deleted: ${existing.id}`);
    }

    res.json({
      success: true,
      deleted: true,
      id: filename,
      message: "File deleted and record marked as deleted successfully",
    });
  } catch (e) {
    console.error("[adminstudlist:delete-upload] error", e);
    res.status(500).json({ success: false, error: "Failed to delete file" });
  }
});

/* =========================================================================
   UTILITIES
   ========================================================================= */
const ACCEPTED_EXTS = new Set([".pdf", ".xlsx", ".csv"]);
const ACCEPTED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream",
  "text/csv",
  "application/csv",
  "text/plain",
]);
const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 10);
const MAX_BYTES = MAX_MB * 1024 * 1024;

const DEPTS = ["BAOM", "BSIT", "BSTM", "BAPSYCH", "BSCS"];

function toArr(v) {
  if (v == null) return [];
  if (Array.isArray(v)) {
    return v
      .flatMap((x) => String(x).split(","))
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const normUpper = (xs) => toArr(xs).map((s) => s.toUpperCase());

function sha256File(p) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash("sha256");
    fs.createReadStream(p)
      .on("error", reject)
      .on("data", (d) => h.update(d))
      .on("end", () => resolve(h.digest("hex")));
  });
}

function detectDept(s) {
  if (!s) return null;
  const up = s.toUpperCase();
  // Check for exact matches first
  if (DEPTS.includes(up)) return up;
  // Then check for inclusions, prioritizing longer matches
  const matches = DEPTS.filter(d => up.includes(d)).sort((a, b) => b.length - a.length);
  return matches[0] || null;
}

function numify(v) {
  if (v == null) return null;
  const s = String(v)
    .replace(/[^0-9.\-]/g, "")
    .trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function cleanName(name) {
  if (!name) return null;
  let s = String(name).replace(/\s+/g, " ").trim();

  // Strategy 1: Extract name from certify phrase pattern (most reliable) - Improved regex
  const certifyMatch = s.match(/I CERTIFY TO THE VERACITY OF THE ABOVE RECORDS OF\s+([A-Z][A-Z\s,.'-]+?)(?=\s*(?:COPY OF GRADES|JR\.?|SR\.?|DE LA|DE LOS|\d{4}|\n|$))/i);
  if (certifyMatch && certifyMatch[1]) {
    s = certifyMatch[1].trim();
  }

  // Strategy 2: Remove common PDF boilerplate prefixes
  s = s.replace(/^STUDENT NAME[:\s\-]*\s*/i, "");
  s = s.replace(/^Name[:\s\-]*\s*/i, "");
  s = s.replace(/^STI\s+BUILDING.*$/i, "");
  s = s.replace(/^STI COLLEGE.*$/i, "");
  s = s.replace(/^COPY OF GRADES.*$/i, "");
  
  // Strategy 3: Remove trailing boilerplate and metadata
  s = s.replace(/COPY OF GRADES FOR THE PERIOD.*$/i, "");
  s = s.replace(/\s*—.*$/, ""); // Remove em-dash and everything after
  s = s.replace(/\s*\(.*?\)\s*$/, ""); // Remove parenthetical info at end
  s = s.replace(/\s*,?\s*\d{4}-\d{4}.*$/i, ""); // Remove year ranges like ", 2024-2025"
  s = s.replace(/\s*,?\s*\d{1,2}[YT]\d{1,2}T.*$/i, ""); // Remove term indicators like "1Y2T"
  s = s.replace(/\s*,?\s*SY\s*\d{4}-\d{4}.*$/i, ""); // Remove school year indicators
  
  // Strategy 4: Clean up academic year/semester patterns
  s = s.replace(/\s*,?\s*(FIRST|SECOND|THIRD|FOURTH)\s+(YEAR|SEMESTER).*$/i, "");
  s = s.replace(/\s*,?\s*\d+(ST|ND|RD|TH)\s+(YEAR|SEMESTER).*$/i, "");
  s = s.replace(/\s*,?\s*(1ST|2ND|3RD|4TH)\s+(YEAR|SEMESTER).*$/i, "");
  
  // Strategy 5: Remove program/department codes at the end
  s = s.replace(/\s*,?\s*(BSIT|BAOM|BSTM|BAPSYCH|BSCS).*$/i, "");
  s = s.replace(/\s*,?\s*(BS|BA|MA|MS)\s+[A-Z\s]+$/i, "");
  
  // Strategy 6: Remove common trailing patterns
  s = s.replace(/\s*,?\s*BACHELOR.*$/i, "");
  s = s.replace(/\s*,?\s*INFORMATION\s+TECHNOLOGY.*$/i, "");
  s = s.replace(/\s*,?\s*BUSINESS\s+ADMINISTRATION.*$/i, "");
  
  // Trim again after all replacements
  s = s.trim();
  
  // Remove leading/trailing commas or dashes
  s = s.replace(/^[,\-\s]+|[,\-\s]+$/g, "");

  // Uppercase consistent with UI
  s = s.toUpperCase();

  // Clean periods after JR/SR but keep them as part of the name
  s = s.replace(/\b(JR|SR)\.\b/g, "$1");
  
  // Remove extra spaces
  s = s.replace(/\s+/g, " ").trim();

  // Validate - must have at least one letter and reasonable length
  if (!/[A-Z]/.test(s) || s.length < 2 || s.length > 100) return null;
  
  // Additional validation - reject if it looks like metadata rather than a name
  if (/^\d+$/.test(s)) return null; // Just numbers
  if (/^[^A-Z]*$/.test(s)) return null; // No letters
  if (/^(COPY|GRADES|PERIOD|STUDENT|NAME|STI|COLLEGE|BUILDING)$/i.test(s)) return null; // Common boilerplate words
  
  return s;
}

function parseLevelAndTerm(raw) {
  if (!raw) return { level: null, term: null };
  const m = String(raw)
    .toUpperCase()
    .match(/([1-4])\s*Y\s*([1-2])/);
  if (m) {
    const level = m[1];
    const term = m[2] === "2" ? "2nd" : "1st";
    return { level, term };
  }
  const m2 = String(raw).match(/\b([1-4])\b/);
  return { level: m2 ? m2[1] : null, term: null };
}

function detectTermFromTextOrName(text = "", fname = "") {
  const t = `${text}\n${fname}`.toLowerCase();
  if (/2(nd)?\s*(sem(ester)?|term)|\b2t\b/.test(t)) return "2nd";
  if (/1(st)?\s*(sem(ester)?|term)|\b1t\b/.test(t)) return "1st";
  return null;
}

// Generate student_no if missing
function generateStudentNo(name, program, level) {
  if (!name) return `STU${Date.now()}`;

  const nameInitials = name
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0))
    .join("")
    .substring(0, 3);

  const year = new Date().getFullYear().toString().slice(-2);
  const prog = program ? program.substring(0, 2) : "XX";
  const lvl = level || "1";
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `${year}${prog}${nameInitials}${lvl}${random}`.toUpperCase();
}

/* =========================================================================
   MULTER STORAGE
   ========================================================================= */
function storageForGrades() {
  const base = path.join(__dirname, "..", "uploads", "studentlist_imports");
  return multer.diskStorage({
    destination(_req, _file, cb) {
      if (!fs.existsSync(base)) fs.mkdirSync(base, { recursive: true });
      cb(null, base);
    },
    filename(_req, file, cb) {
      const stamp = new Date()
        .toISOString()
        .replace(/[-:.TZ]/g, "")
        .slice(0, 14);
      const id = uuidv4().slice(0, 8);
      const ext = (path.extname(file.originalname) || ".pdf").toLowerCase();
      cb(null, `studentlist_${stamp}_${id}${ext}`);
    },
  });
}

const uploadGrades = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter(_req, file, cb) {
    const ext = (path.extname(file.originalname) || "").toLowerCase();
    const extOk = ACCEPTED_EXTS.has(ext);
    const mimeOk = ACCEPTED_MIME.has(file.mimetype) || extOk;
    if (!extOk) return cb(new Error("Only .pdf, .xlsx or .csv are allowed"));
    if (!mimeOk) return cb(new Error("Invalid mime type"));
    cb(null, true);
  },
}).single("file");

/* =========================================================================
   ENHANCED PARSERS WITH BETTER ERROR HANDLING
   ========================================================================= */
async function parseGradesXlsx(filePath, originalName) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error("No worksheet found in Excel file");

  let student_no = String(ws.getCell("A2").text || "").trim();
  const rawStudentName = String(ws.getCell("B2").text || "").trim();
  const programCell = String(ws.getCell("C2").text || "").trim();
  const levelCell = String(ws.getCell("D2").text || "").trim();

  const student_name = cleanName(rawStudentName);
  if (!student_name && !student_no) {
    throw new Error("Cannot identify student from Excel file");
  }

  const program =
    detectDept(programCell) || detectDept(originalName) || programCell || null;
  const { level } = parseLevelAndTerm(levelCell);

  // Generate student_no if missing
  if (!student_no) {
    student_no = generateStudentNo(student_name, program, level);
  }

  let headerRow = 5;
  for (let r = 3; r <= 10; r++) {
    const a = (ws.getCell(r, 1).text || "").toLowerCase();
    const b = (ws.getCell(r, 2).text || "").toLowerCase();
    const c = (ws.getCell(r, 3).text || "").toLowerCase();
    const d = (ws.getCell(r, 4).text || "").toLowerCase();
    if (
      a.includes("course") &&
      b.includes("course") &&
      c.includes("unit") &&
      (d.includes("final") || d.includes("grade"))
    ) {
      headerRow = r;
      break;
    }
  }

  const courses = [];
  for (let r = headerRow + 1; r <= headerRow + 100; r++) {
    const code = String(ws.getCell(r, 1).text || "").trim();
    const title = String(ws.getCell(r, 2).text || "").trim();
    const units = numify(ws.getCell(r, 3).text);
    const fgText = String(ws.getCell(r, 4).text || "").trim();
    const finalGrade = numify(fgText);
    const gradeText = finalGrade == null && fgText ? fgText : null;
    const empty = !code && !title && !units && !fgText;
    if (empty) break;
    if (!code) continue;
    courses.push({ code, title, units, finalGrade, gradeText });
  }

  // Scan for GWA section
  let gwa = null,
    cumulative_gwa = null,
    term = null;
  for (let r = 8; r <= 24; r++) {
    const a = (ws.getCell(r, 1).text || "").toLowerCase();
    const txt = `${ws.getCell(r, 1).text} ${ws.getCell(r, 2).text} ${ws.getCell(r, 3).text}`.toLowerCase();
    if (a.includes("gwa")) {
      gwa = numify(ws.getCell(r + 1, 2).text);
      cumulative_gwa = numify(ws.getCell(r + 1, 3).text);
    }
    if (!term && /1st|2nd/.test(txt)) {
      term = /2nd/.test(txt) ? "2nd" : "1st";
    }
  }

  return {
    student: { student_no, student_name, program, level },
    courses,
    summary: { gwa, cumulative_gwa, term },
  };
}

async function parseGradesCsv(filePath, originalName) {
  const raw = fs.readFileSync(filePath, "utf8");
  const rows = parseCsvSync(raw, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });
  if (!rows.length) throw new Error("Empty CSV");

  // Check if batch: look for varying student_no across rows
  const studentNos = [...new Set(rows.map(r => String(r.student_no ?? r["student no"] ?? "").trim()).filter(Boolean))];
  const isBatch = studentNos.length > 1;

  if (isBatch) {
    console.log("[CSV Parser] Detected batch CSV format");
    const students = [];
    const seen = new Set();

    // Group rows by student_no
    const groups = {};
    rows.forEach(row => {
      const sno = String(row.student_no ?? row["student no"] ?? "").trim();
      if (sno && /^\d{8,}$/.test(sno)) {
        if (!groups[sno]) groups[sno] = [];
        groups[sno].push(row);
      }
    });

    for (const [sno, groupRows] of Object.entries(groups)) {
      if (seen.has(sno)) continue;
      seen.add(sno);

      const firstRow = groupRows[0];
      const rawName = String(firstRow.student_name ?? firstRow["student name"] ?? "").trim();
      const student_name = cleanName(rawName);
      if (!student_name) continue;

      const program = detectDept(String(firstRow.program || "")) || detectDept(originalName) || String(firstRow.program || "").trim();
      const level = String(firstRow.level || "").replace(/\D/g, "") || null;
      const term = detectTermFromTextOrName("", originalName);

      // Courses for this student
      const courses = groupRows
        .map((r) => {
          const fgText = String(r.final_grade ?? r["final grade"] ?? "").trim();
          const finalGrade = numify(fgText);
          const gradeText = finalGrade == null && fgText ? fgText : null;
          return {
            code: String(r.course_code ?? r["course code"] ?? "").trim(),
            title: String(r.course_title ?? r["course title"] ?? "").trim(),
            units: numify(r.units),
            finalGrade,
            gradeText,
          };
        })
        .filter((c) => c.code);

      // Simple GWA calculation for summary (average of numeric grades)
      const numericGrades = courses.map(c => c.finalGrade).filter(Boolean);
      const gwa = numericGrades.length > 0 ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : null;

      students.push({
        student_no: sno,
        student_name,
        program,
        level,
        term,
        courses,
        summary: { gwa, cumulative_gwa: null, term }
      });
    }

    if (students.length === 0) {
      throw new Error("Could not extract any student data from batch CSV");
    }

    console.log(`[CSV Parser] Extracted ${students.length} students from batch CSV`);

    // Return first for compatibility, but include batchData
    const firstStudent = students[0];
    return {
      student: {
        student_no: firstStudent.student_no,
        student_name: firstStudent.student_name,
        program: firstStudent.program,
        level: firstStudent.level
      },
      courses: firstStudent.courses,
      summary: firstStudent.summary,
      batchData: students,
      isBatchList: true
    };
  } else {
    // Single student fallback
    const first = rows[0];
    let student_no = String(first.student_no ?? first["student no"] ?? "").trim();
    const rawName = String(
      first.student_name ?? first["student name"] ?? ""
    ).trim();
    const student_name = cleanName(rawName);

    if (!student_name && !student_no) {
      throw new Error("Cannot identify student from CSV file");
    }

    const program =
      detectDept(String(first.program || "")) ||
      detectDept(originalName) ||
      String(first.program || "").trim();
    const level = String(first.level || "").replace(/\D/g, "") || null;

    // Generate student_no if missing
    if (!student_no) {
      student_no = generateStudentNo(student_name, program, level);
    }

    const courses = rows
      .map((r) => {
        const fgText = String(r.final_grade ?? r["final grade"] ?? "").trim();
        const finalGrade = numify(fgText);
        const gradeText = finalGrade == null && fgText ? fgText : null;
        return {
          code: String(r.course_code ?? r["course code"] ?? "").trim(),
          title: String(r.course_title ?? r["course title"] ?? "").trim(),
          units: numify(r.units),
          finalGrade,
          gradeText,
        };
      })
      .filter((c) => c.code);

    const term = detectTermFromTextOrName("", originalName);

    // Simple GWA
    const numericGrades = courses.map(c => c.finalGrade).filter(Boolean);
    const gwa = numericGrades.length > 0 ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(2) : null;

    return {
      student: { student_no, student_name, program, level },
      courses,
      summary: { gwa, cumulative_gwa: null, term },
    };
  }
}

async function parseGradesPdf(filePath, originalName) {
  const buf = fs.readFileSync(filePath);
  const { text } = await pdfParse(buf);

  if (!text || text.trim().length < 50) {
    throw new Error("PDF appears to be empty or unreadable");
  }

  // Check if this is a batch student list or individual grade report
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Look for patterns that indicate a batch student list
  const hasBatchIndicators = /\b(STUDENT|ENROLLEE|NAME)\b/i.test(text) &&
                            /\b(DEPARTMENT|PROGRAM|COURSE)\b/i.test(text) &&
                            lines.length > 10;

  if (hasBatchIndicators) {
    return await parseBatchStudentList(text, lines, originalName);
  }

  // Fall back to individual student parsing
  return await parseIndividualStudentPdf(text, lines, originalName);
}

async function parseBatchStudentList(text, lines, originalName) {
  console.log("[PDF Parser] Detected batch student list format");

  // Detect program from filename or text
  const program = detectDept(originalName) || detectDept(text);

  const students = [];
  const seen = new Set(); // For deduplication by student_no

  // Split text into student blocks based on "Student No" occurrences
  const studentBlocks = text.split(/Student No[:\s]*/i).slice(1); // Skip the first empty part

  for (const block of studentBlocks) {
    const blockText = "Student No" + block; // Re-add the "Student No" prefix
    const blockLines = blockText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // Extract student number
    const studentNoMatch = blockText.match(/Student No[:\s]*(\d{8,})/i);
    if (!studentNoMatch) continue;
    const student_no = studentNoMatch[1];

    if (seen.has(student_no)) continue;
    seen.add(student_no);

    // Extract name
    const nameMatch = blockText.match(/Name[:\s]*([^\n]+)/i);
    const rawName = nameMatch ? nameMatch[1].trim() : null;
    const student_name = cleanName(rawName);

    if (!student_name) continue;

    // Extract level and term from "Year/Level" or similar
    const levelTermMatch = blockText.match(/([1-4])\s*Y\s*([1-2])/i);
    let level = null;
    let term = null;
    if (levelTermMatch) {
      level = levelTermMatch[1];
      term = levelTermMatch[2] === "2" ? "2nd" : "1st";
    }

    // Extract cumulative GWA
    const cumulativeGwaMatch = blockText.match(/Cumulative GWA[:\s]*(\d+\.?\d*)/i);
    const cumulative_gwa = cumulativeGwaMatch ? numify(cumulativeGwaMatch[1]) : null;

    students.push({
      student_no,
      student_name,
      program, // Use the detected program for all students
      level,
      term,
      cumulative_gwa
    });
  }

  if (students.length === 0) {
    throw new Error("Could not extract any student data from batch PDF");
  }

  // Fallback: assign common level/term if not set per student
  const { level: fallbackLevel, term: fallbackTerm } = parseLevelAndTerm(text);
  students.forEach(s => {
    if (!s.level) s.level = fallbackLevel;
    if (!s.term) s.term = fallbackTerm;
  });

  console.log(`[PDF Parser] Extracted ${students.length} students from batch list with program: ${program}`);

  // For batch student lists, we need to handle multiple students
  // Return the first student for the main parsing flow, but store all students
  const firstStudent = students[0];
  console.log(`[PDF Parser] Using first student: ${firstStudent.student_name} (${firstStudent.student_no})`);

  return {
    student: {
      student_no: firstStudent.student_no,
      student_name: firstStudent.student_name,
      program: firstStudent.program,
      level: firstStudent.level
    },
    courses: [], // No course data in batch list
    summary: { gwa: null, cumulative_gwa: firstStudent.cumulative_gwa, term: firstStudent.term },
    batchData: students, // Include all students for batch processing
    isBatchList: true // Flag to indicate this is a batch list
  };
}

async function parseIndividualStudentPdf(text, lines, originalName) {
  console.log("[PDF Parser] Using individual student parsing");

  // Enhanced extraction with better patterns
  const getLabel = (label) => {
    const patterns = [
      new RegExp(`${label}\\s*[:\\-]\\s*([^\\n]+)`, "i"),
      new RegExp(`${label}\\s+([^\\n]+)`, "i"),
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim()) {
        return match[1].trim();
      }
    }
    return null;
  };

  let student_no =
    getLabel("Student\\s*(?:No|Number|ID)") ||
    (text.match(/\b(?:ID|Student\s*No)[:\s\-]*([A-Za-z0-9\-]+)/i) || [])[1] ||
    null;

  // Improved student name extraction with multiple strategies
  let rawName = null;
  
  // Strategy 1: Look for explicit "Student Name:" or "Name:" label
  rawName = getLabel("Student\\s*Name|Name");
  
  // Strategy 2: Look for the certify phrase pattern
  if (!rawName) {
    const certifyMatch = text.match(/I CERTIFY TO THE VERACITY OF THE ABOVE RECORDS OF\s+([A-Z\s,.'-]+?)(?:\s*COPY OF GRADES|\s*\n|\s*$)/i);
    if (certifyMatch && certifyMatch[1]) {
      rawName = certifyMatch[1].trim();
    }
  }
  
  // Strategy 3: Look for name pattern after Student No
  if (!rawName) {
    const studentNoNameMatch = text.match(/Student\s*No[:\s]*\d{8,}\s+([A-Z\s,.'-]+?)(?:\s*\n|\s*Copy of Grades)/i);
    if (studentNoNameMatch && studentNoNameMatch[1]) {
      rawName = studentNoNameMatch[1].trim();
    }
  }
  
  // Strategy 4: Look for line starting with student number and name
  if (!rawName) {
    for (const line of lines) {
      const m = line.match(/^\s*\d{8,}\s+([A-Z ,.'-]+)/i);
      if (m) {
        rawName = m[1].trim();
        break;
      }
    }
  }
  
  // Strategy 5: Look for name between Student No and Copy of Grades
  if (!rawName) {
    const blockMatch = text.match(/Student\s*No[:\s]*\d{8,}[^\n]*\n([^\n]+?)(?:\n.*Copy of Grades)/si);
    if (blockMatch && blockMatch[1]) {
      rawName = blockMatch[1].trim();
    }
  }

  const student_name = cleanName(rawName);
  
  // Log for debugging
  console.log("[PDF Parser] Raw name extracted:", rawName);
  console.log("[PDF Parser] Cleaned name:", student_name);

  if (!student_name && !student_no) {
    throw new Error("Cannot identify student from PDF - no name or ID found");
  }

  const program =
    detectDept(text) || detectDept(originalName) || getLabel("Program") || null;

  const lvlToken =
    getLabel("Level") ||
    (text.match(/\b([1-4]\s*Y\s*[1-2])\b/i) || [])[1] ||
    null;
  const { level, term: termFromLvl } = parseLevelAndTerm(lvlToken);

  // Generate student_no if missing
  if (!student_no) {
    student_no = generateStudentNo(student_name, program, level);
  }

  const gwa =
    numify(
      (text.match(/\bGWA\s*[:\-]?\s*([0-9.]+)/i) || [])[1] ||
        (text.match(/Weighted\s*Average\s*[:\-]?\s*([0-9.]+)/i) || [])[1]
    ) || null;

  const cumulative_gwa =
    numify(
      (text.match(/Cumulative(?:\s*GWA)?\s*[:\-]?\s*([0-9.]+)/i) || [])[1]
    ) || null;

  const term = termFromLvl || detectTermFromTextOrName(text, originalName);

  // Enhanced course parsing
  const startIdx = lines.findIndex((l) => /copy of grades.*period/i.test(l));
  const endIdx = lines.findIndex((l) => /\bGWA\b/i.test(l));
  const slice = lines.slice(
    startIdx > -1 ? startIdx : 0,
    endIdx > -1 ? endIdx : lines.length
  );

  const codeRe = /^[A-Z]{2,}\d{3,4}$/;
  const courses = [];

  for (let i = 0; i < slice.length; i++) {
    const row = slice[i];

    // Enhanced pattern for course rows
    const patterns = [
      /^([A-Z]{2,}\d{3,4})\s+(.+?)\s+([0-9.]+)\s+([0-9.]+|P|p|INC|INC\.|W|F)$/i,
      /^([A-Z]{2,}\d{3,4})\s+(.+?)\s+([0-9.]+)\s+([0-9.]+)$/i,
    ];

    let matched = false;
    for (const pattern of patterns) {
      const m = row.match(pattern);
      if (m) {
        const code = m[1].trim();
        const title = m[2].trim();
        const units = numify(m[3]);
        const fgToken = m[4].trim().toUpperCase();
        const finalGrade = numify(fgToken);
        const gradeText = finalGrade == null && fgToken ? fgToken : null;
        courses.push({ code, title, units, finalGrade, gradeText });
        matched = true;
        break;
      }
    }

    if (matched) continue;

    // Handle split rows
    if (codeRe.test(row) && slice[i + 1]) {
      const code = row;
      const nextLine = slice[i + 1];
      const m2 = nextLine.match(
        /^(.+?)\s+([0-9.]+)\s+([0-9.]+|P|p|INC|INC\.|W|F)$/
      );
      if (m2) {
        const title = m2[1].trim();
        const units = numify(m2[2]);
        const fgToken = m2[3].trim().toUpperCase();
        const finalGrade = numify(fgToken);
        const gradeText = finalGrade == null && fgToken ? fgToken : null;
        courses.push({ code, title, units, finalGrade, gradeText });
        i++; // Skip next line
      }
    }
  }

  return {
    student: { student_no, student_name, program, level },
    courses,
    summary: { gwa, cumulative_gwa, term },
  };
}


/* =========================================================================
   REMOVE STUDENTS
   ========================================================================= */
const REMOVE_FILE = path.join(__dirname, "..", "uploads", "studentlist_imports", "removed_students.json");

function loadRemovedStudents() {
  if (!fs.existsSync(REMOVE_FILE)) {
    return new Set();
  }
  try {
    const data = fs.readFileSync(REMOVE_FILE, "utf8");
    const removed = JSON.parse(data);
    return new Set(removed);
  } catch (e) {
    console.error("[adminstudlist:remove] Failed to load removed students:", e);
    return new Set();
  }
}

function saveRemovedStudents(removedSet) {
  try {
    const data = JSON.stringify(Array.from(removedSet), null, 2);
    fs.writeFileSync(REMOVE_FILE, data);
    console.log(`[adminstudlist:remove] Saved ${removedSet.size} removed students`);
  } catch (e) {
    console.error("[adminstudlist:remove] Failed to save removed students:", e);
    throw e;
  }
}

const uploadRemove = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(__dirname, "..", "uploads", "studentlist_imports");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      cb(null, `remove_${Date.now()}_${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() !== ".csv") {
      return cb(new Error("Only CSV files are allowed"));
    }
    cb(null, true);
  },
}).single("file");

router.post("/remove", (req, res) => {
  uploadRemove(req, res, async (err) => {
    if (err) {
      console.error("[adminstudlist:remove] Upload error:", err.message);
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, error: `File too large (max ${MAX_MB} MB)` });
      }
      return res.status(400).json({ success: false, error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const { path: filePath } = req.file;
    let removedCount = 0;

    try {
      const raw = fs.readFileSync(filePath, "utf8");
      const rows = parseCsvSync(raw, { columns: true, skip_empty_lines: true, bom: true });

      if (!rows.length) {
        return res.status(400).json({ success: false, error: "Empty CSV file" });
      }

      const removedSet = loadRemovedStudents();
      const newRemoved = new Set();

      for (const row of rows) {
        const studentNo = String(row.student_no || row["student no"] || "").trim();
        if (studentNo && /^\d{8,}$/.test(studentNo)) {
          if (!removedSet.has(studentNo)) {
            removedSet.add(studentNo);
            newRemoved.add(studentNo);
            removedCount++;
          }
        }
      }

      if (newRemoved.size > 0) {
        saveRemovedStudents(removedSet);
      }

      // Clean up temp file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        removed: removedCount,
        total_removed: removedSet.size,
        message: `Successfully removed ${removedCount} students`,
      });
    } catch (e) {
      console.error("[adminstudlist:remove] Error processing CSV:", e);
      fs.unlinkSync(filePath);
      res.status(500).json({ success: false, error: "Failed to process removal file" });
    }
  });
});

async function ensureColumn(conn, table, column, defSql) {
  try {
    const [rows] = await conn.query(
      `SELECT COUNT(*) AS cnt
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table, column]
    );
    if (!rows[0] || rows[0].cnt === 0) {
      const alter = `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${defSql}`;
      await conn.query(alter);
      console.log(`[adminstudlist] Added ${table}.${column}`);
    }
  } catch (err) {
    console.error(
      `[adminstudlist] Failed to add column ${table}.${column}:`,
      err.message
    );
  }
}

async function ensureStudentsTable() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_no VARCHAR(20) UNIQUE NOT NULL,
        student_name VARCHAR(255) NOT NULL,
        program VARCHAR(50),
        level VARCHAR(10),
        term VARCHAR(10),
        cumulative_gwa DECIMAL(3,2),
        assessment_status ENUM('PENDING', 'COMPLETE') DEFAULT 'PENDING',
        upload_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE
      )
    `);

    // Ensure all required columns exist (in case table was created by legacy code)
    await ensureColumn(conn, "students", "student_name", "VARCHAR(255) NOT NULL");
    await ensureColumn(conn, "students", "program", "VARCHAR(50)");
    await ensureColumn(conn, "students", "level", "VARCHAR(10)");
    await ensureColumn(conn, "students", "term", "VARCHAR(10)");
    await ensureColumn(conn, "students", "cumulative_gwa", "DECIMAL(3,2)");
    await ensureColumn(conn, "students", "assessment_status", "ENUM('PENDING', 'COMPLETE') DEFAULT 'PENDING'");
    await ensureColumn(conn, "students", "upload_id", "INT");

    console.log('[adminstudlist] Students table ensured');
  } catch (e) {
    console.error('[adminstudlist] Failed to create/ensure students table:', e);
  } finally {
    if (conn) conn.release();
  }
}

/* =========================================================================
   FALLBACK PARSING FROM FILES (RESTORED FROM BACKUP)
   ========================================================================= */
async function getAllStudentsFromFiles() {
  const uploadDir = path.join(__dirname, "..", "uploads", "studentlist_imports");
  let allStudents = [];
  if (fs.existsSync(uploadDir)) {
    const files = fs.readdirSync(uploadDir).filter((f) =>
      ACCEPTED_EXTS.has(path.extname(f).toLowerCase())
    );
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      try {
        let parsed;
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') {
          parsed = await parseGradesPdf(filePath, file);
        } else if (ext === '.xlsx') {
          parsed = await parseGradesXlsx(filePath, file);
        } else if (ext === '.csv') {
          parsed = await parseGradesCsv(filePath, file);
        }
        if (parsed) {
          if (parsed.isBatchList && parsed.batchData) {
            allStudents.push(
              ...parsed.batchData.map((s) => ({
                student_no: s.student_no,
                name: s.student_name,
                program: s.program,
                level: s.level,
                term: s.term,
                cumulative_gwa: s.summary?.gwa || s.cumulative_gwa,
                assessment_status: s.courses && s.courses.length > 0 ? "COMPLETE" : "PENDING",
              }))
            );
          } else {
            allStudents.push({
              student_no: parsed.student.student_no,
              name: parsed.student.student_name,
              program: parsed.student.program,
              level: parsed.student.level,
              term: parsed.summary.term,
              cumulative_gwa: parsed.summary.cumulative_gwa || parsed.summary.gwa,
              assessment_status: parsed.courses && parsed.courses.length > 0 ? "COMPLETE" : "PENDING",
            });
          }
        }
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    }
  }
  return allStudents;
}

router.get("/", async (req, res) => {
  try {
    console.log("[DEBUG] GET /api/students called");
    const q = req.query || {};
    const initial = (q.initial || "").toUpperCase();
    const nameQ = (q.q || "").trim();
    const programs = normUpper(q.department);
    const years = toArr(q.year).map((x) => String(parseInt(x, 10)));
    const terms = toArr(q.semester)
      .map((t) => String(t).toLowerCase())
      .filter((t) => t === "1st" || t === "2nd");
    const statuses = normUpper(q.status);

    // ONLY parse from files - never fall back to database
    console.log("[adminstudlist:list] Parsing from files only (no database fallback)");
    const fileStudents = await getAllStudentsFromFiles();
    console.log(`[DEBUG] Found ${fileStudents.length} students from files`);

    // Apply filters to file students
    let filteredStudents = fileStudents;

    if (initial && initial !== "ALL" && /^[A-Z]$/.test(initial)) {
      filteredStudents = filteredStudents.filter(s => s.name && s.name.toUpperCase().startsWith(initial));
    }
    if (nameQ) {
      filteredStudents = filteredStudents.filter(s =>
        (s.name && s.name.toUpperCase().includes(nameQ.toUpperCase())) ||
        (s.student_no && s.student_no.toUpperCase().includes(nameQ.toUpperCase()))
      );
    }
    if (programs.length) {
      filteredStudents = filteredStudents.filter(s => s.program && programs.includes(s.program.toUpperCase()));
    }
    if (years.length) {
      filteredStudents = filteredStudents.filter(s => s.level && years.includes(s.level));
    }
    if (terms.length) {
      filteredStudents = filteredStudents.filter(s => s.term && terms.includes(s.term.toLowerCase()));
    }
    if (statuses.length) {
      filteredStudents = filteredStudents.filter(s => s.assessment_status && statuses.includes(s.assessment_status.toUpperCase()));
    }

    // Sort
    const sort = q.sort || 'az';
    filteredStudents.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      return sort === 'za' ? bName.localeCompare(aName) : aName.localeCompare(bName);
    });

    // Pagination
    const page = parseInt(q.page) || 1;
    const pageSize = parseInt(q.pageSize) || 25;
    const start = (page - 1) * pageSize;
    const paginated = filteredStudents.slice(start, start + pageSize);

    function getOrdinal(n) {
      const s = ["st", "nd", "rd"][n % 10 - 1] || "th";
      return n + s;
    }

    const rows = paginated.map((r) => {
      const levelNum = parseInt(r.level, 10);
      const yearDisplay = levelNum ? `${getOrdinal(levelNum)} Year` : '';
      const semesterDisplay = r.term ? `${r.term.charAt(0).toUpperCase() + r.term.slice(1)} Semester` : '';
      return {
        student_no: r.student_no,
        name: r.name,
        department: r.program,
        year_level: yearDisplay,
        latest_gwa: r.cumulative_gwa,
        semester: semesterDisplay,
        assessment_status: r.assessment_status,
      };
    });

    res.json({
      success: true,
      total: filteredStudents.length,
      rows,
      page,
      pageSize
    });
  } catch (e) {
    console.error("[adminstudlist:list] error", e);
    res.status(500).json({ success: false, error: "Failed to load students" });
  }
});

router.get("/export.csv", async (req, res) => {
  try {
    await ensureStudentsTable();
    const q = req.query || {};
    const initial = (q.initial || "").toUpperCase();
    const nameQ = (q.q || "").trim();
    const programs = normUpper(q.department);
    const years = toArr(q.year).map((x) => String(parseInt(x, 10)));
    const terms = toArr(q.semester)
      .map((t) => String(t).toLowerCase())
      .filter((t) => t === "1st" || t === "2nd");
    const statuses = normUpper(q.status);

    let where = 'WHERE 1=1';
    let params = [];

    if (initial && initial !== "ALL" && /^[A-Z]$/.test(initial)) {
      where += ' AND student_name LIKE ?';
      params.push(initial + '%');
    }
    if (nameQ) {
      where += ' AND student_name LIKE ?';
      params.push('%' + nameQ.toUpperCase() + '%');
    }
    if (programs.length) {
      where += ' AND program IN (' + programs.map(() => '?').join(',') + ')';
      params.push(...programs);
    }
    if (years.length) {
      where += ' AND level IN (' + years.map(() => '?').join(',') + ')';
      params.push(...years);
    }
    if (terms.length) {
      where += ' AND term IN (' + terms.map(() => '?').join(',') + ')';
      params.push(...terms);
    }
    if (statuses.length) {
      where += ' AND assessment_status IN (' + statuses.map(() => '?').join(',') + ')';
      params.push(...statuses);
    }

    const [dbRows] = await pool.query(`SELECT * FROM students ${where} ORDER BY student_name`, params);

    let filtered = [];

    if (dbRows.length === 0) {
      // Fallback to parsing files if no students in database
      console.log("[adminstudlist:export] No students in database, falling back to file parsing");
      const fileStudents = await getAllStudentsFromFiles();

      // Apply filters to file students
      let filteredStudents = fileStudents;

      if (initial && initial !== "ALL" && /^[A-Z]$/.test(initial)) {
        filteredStudents = filteredStudents.filter(s => s.name.startsWith(initial));
      }
      if (nameQ) {
        filteredStudents = filteredStudents.filter(s => s.name.toUpperCase().includes(nameQ.toUpperCase()));
      }
      if (programs.length) {
        filteredStudents = filteredStudents.filter(s => s.program && programs.includes(s.program.toUpperCase()));
      }
      if (years.length) {
        filteredStudents = filteredStudents.filter(s => s.level && years.includes(s.level));
      }
      if (terms.length) {
        filteredStudents = filteredStudents.filter(s => s.term && terms.includes(s.term));
      }
      if (statuses.length) {
        filteredStudents = filteredStudents.filter(s => s.assessment_status && statuses.includes(s.assessment_status));
      }

      filtered = filteredStudents.map((r) => ({
        student_no: r.student_no,
        name: r.name,
        program: r.program,
        level: r.level,
        assessment_status: r.assessment_status,
        term: r.term,
      }));
    } else {
      // Use database results
      filtered = dbRows.map((r) => ({
        student_no: r.student_no,
        name: r.student_name,
        program: r.program,
        level: r.level,
        assessment_status: r.assessment_status,
        term: r.term,
      }));
    }

    const header = [
      "Student No",
      "Name",
      "Department",
      "Year Level",
      "Assessment Status",
      "Semester",
    ];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [
          r.student_no || "",
          r.name || "",
          r.program || "",
          r.level || "",
          r.assessment_status || "",
          r.term || "",
        ]
          .map((v) => {
            const s = String(v ?? "");
            return /[,"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
    );

    const csv = lines.join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=student-list.csv"
    );
    res.send(csv);
  } catch (e) {
    console.error("[adminstudlist:export] error", e);
    res.status(500).send("Export failed");
  }
});

/* =========================================================================
   IMPORT - SAVE FILE ONLY (NO DB FOR STUDENTS)
   ========================================================================= */
router.post("/import/grades", async (req, res) => {
  let savedPath = null;

  try {
    uploadGrades(req, res, async (err) => {
      if (err) {
        console.error("[students:import] Upload error:", err.message);
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: `File too large (max ${MAX_MB} MB)`,
          });
        }
        return res.status(400).json({ success: false, error: err.message });
      }

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }

      const { originalname, size, buffer } = req.file;
      const overwrite = String(req.query.overwrite || "") === "1";

      console.log(
        `[students:import] Processing file: ${originalname} (${size} bytes)`
      );

      // Calculate hash for new file
      let sha = null;
      try {
        const h = crypto.createHash("sha256");
        h.update(buffer);
        sha = h.digest("hex");
        console.log(`[students:import] New file hash: ${sha}`);
      } catch (e) {
        console.error("[students:import] Hash calculation failed:", e);
        return res
          .status(500)
          .json({ success: false, error: "Failed to process file" });
      }

      // Check for content duplicates across all files in directory
      const uploadDir = path.join(__dirname, "..", "uploads", "studentlist_imports");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = originalname;
      const filePath = path.join(uploadDir, filename);

      // Scan all files in directory for SHA256 duplicates
      let duplicateFound = false;
      let existingFileName = null;
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir).filter(f => ACCEPTED_EXTS.has(path.extname(f).toLowerCase()));
        for (const file of files) {
          const existingPath = path.join(uploadDir, file);
          try {
            const existingSha = await sha256File(existingPath);
            if (existingSha === sha) {
              duplicateFound = true;
              existingFileName = file;
              console.log(`[students:import] Content duplicate found: ${file} (SHA256: ${existingSha})`);
              break;
            }
          } catch (e) {
            console.warn(`[students:import] Could not hash existing file ${file}:`, e.message);
          }
        }
      }

      if (duplicateFound) {
        // Same content exists, prevent upload
        return res.json({
          success: true,
          duplicate: true,
          originalName: originalname,
          storedName: existingFileName,
          size,
          sha256: sha,
          relPath: `/uploads/studentlist_imports/${existingFileName}`,
          note: "Duplicate file detected (same content). Upload prevented.",
        });
      }

      // No content duplicate found, proceed with upload
      console.log(`[students:import] No content duplicate found, proceeding with upload`);

      savedPath = filePath;

      // Save file to disk
      try {
        fs.writeFileSync(filePath, buffer);
      } catch (e) {
        console.error("[students:import] Failed to save file:", e);
        return res
          .status(500)
          .json({ success: false, error: "Failed to save file" });
      }

      // Insert upload metadata
      let uploadInfo;
      try {
        uploadInfo = await insertUpload({
          type: "grades",
          original_name: originalname,
          stored_name: filename,
          size,
          sha256: sha,
        });
        console.log(
          `[adminstudlist:import] Upload record created with ID: ${uploadInfo.lastInsertRowid}`
        );
      } catch (e) {
        console.error("[adminstudlist:import] Failed to create upload record:", e);
        try {
          fs.unlinkSync(savedPath);
        } catch {}
        return res
          .status(500)
          .json({ success: false, error: "Failed to create upload record" });
      }

      await ensureStudentsTable();

      // Parse the file to validate and log
      const fileExt = (path.extname(savedPath) || "").toLowerCase();
      let parsed;
      try {
        console.log(`[adminstudlist:import] Parsing ${fileExt} file for validation...`);
        if (fileExt === ".pdf") {
          parsed = await parseGradesPdf(savedPath, originalname);
        } else if (fileExt === ".xlsx") {
          parsed = await parseGradesXlsx(savedPath, originalname);
        } else if (fileExt === ".csv") {
          parsed = await parseGradesCsv(savedPath, originalname);
        } else {
          throw new Error("Unsupported file type");
        }

        console.log(`[adminstudlist:import] Parsed data:`, {
          student_no: parsed.student.student_no,
          student_name: parsed.student.student_name,
          program: parsed.student.program,
          level: parsed.student.level,
          courses_count: parsed.courses?.length || 0,
          gwa: parsed.summary?.gwa,
          term: parsed.summary?.term,
          isBatch: parsed.isBatchList ? `Batch of ${parsed.batchData?.length || 0}` : 'Single',
        });
      } catch (e) {
        console.error("[adminstudlist:import] Parse failed for validation:", e.message);
        // Don't fail import if parsing fails, just log
        parsed = null;
      }

      let insertedStudents = 0;
      if (parsed) {
        if (parsed.isBatchList && parsed.batchData) {
          for (const s of parsed.batchData) {
            // For batch lists, status is PENDING since no course data
            const status = 'PENDING';
            const gwa = s.cumulative_gwa || parsed.summary?.gwa || null;
            try {
              await pool.query(
                `INSERT INTO students (student_no, student_name, program, level, term, cumulative_gwa, assessment_status, upload_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE
                 student_name = VALUES(student_name),
                 program = VALUES(program),
                 level = VALUES(level),
                 term = VALUES(term),
                 cumulative_gwa = VALUES(cumulative_gwa),
                 assessment_status = VALUES(assessment_status)`,
                [s.student_no, s.student_name, s.program, s.level, s.term, gwa, status, uploadInfo.lastInsertRowid]
              );
              insertedStudents++;
            } catch (e) {
              console.error(`Failed to insert batch student ${s.student_no}:`, e);
            }
          }
        } else {
          const s = parsed.student;
          const status = parsed.courses && parsed.courses.length > 0 ? 'COMPLETE' : 'PENDING';
          const gwa = parsed.summary.cumulative_gwa || parsed.summary.gwa;
          try {
            await pool.query(
              `INSERT INTO students (student_no, student_name, program, level, term, cumulative_gwa, assessment_status, upload_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
               student_name = VALUES(student_name),
               program = VALUES(program),
               level = VALUES(level),
               term = VALUES(term),
               cumulative_gwa = VALUES(cumulative_gwa),
               assessment_status = VALUES(assessment_status)`,
              [s.student_no, s.student_name, s.program, s.level, parsed.summary.term, gwa, status, uploadInfo.lastInsertRowid]
            );
            insertedStudents = 1;
          } catch (e) {
            console.error(`Failed to insert student ${s.student_no}:`, e);
          }
        }
      }

      res.json({
        success: true,
        duplicate: false,
        id: uploadInfo.lastInsertRowid,
        originalName: originalname,
        storedName: filename,
        size,
        sha256: sha,
        relPath: `/uploads/studentlist_imports/${filename}`,
        num_students: insertedStudents,
        note: "File saved and students inserted to database.",
      });
    });
  } catch (e) {
    console.error("[students:import] Unexpected error:", e);
    if (savedPath) {
      try {
        fs.unlinkSync(savedPath);
      } catch {}
    }
    res.status(500).json({ success: false, error: "Unexpected server error" });
  }
});

/* =========================================================================
   REMOVE RECORDS - DISABLED (DB FOR STORAGE ONLY, NO DELETIONS)
   ========================================================================= */
/*
The removal functionality has been disabled as per requirements. Database is used for storage only.
If needed in the future, uncomment and adjust.
*/

module.exports = router;
module.exports.parseBatchStudentList = parseBatchStudentList;
module.exports.parseGradesPdf = parseGradesPdf;
module.exports.parseIndividualStudentPdf = parseIndividualStudentPdf;
module.exports.parseGradesXlsx = parseGradesXlsx;
module.exports.parseGradesCsv = parseGradesCsv;

