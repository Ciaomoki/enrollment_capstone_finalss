// controllers/admindataim-be.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const ExcelJS = require("exceljs");
const { parse } = require("csv-parse/sync");
const pdfParse = require("pdf-parse");
const { pool, insertUpload, findBySha } = require("../db");

const router = express.Router();

// ===== LIST UPLOADS BY TYPE =====
router.get("/uploads/:type", async (req, res) => {
  try {
    const type = String(req.params.type || "").toLowerCase();
    if (!["grades", "schedules"].includes(type)) {
      return res.status(400).json({ success: false, error: "Invalid type" });
    }

    if (type === "grades") {
      // For grades, scan the shared directory since it's synchronized with studentlist
      const uploadDir = path.join(__dirname, "..", "uploads", "studentlist_imports");
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
      res.json({ success: true, uploads });
    } else {
      // For schedules, use database
      const [rows] = await pool.query(
        `SELECT id, original_name, stored_name, size, sha256, created_at
         FROM uploads
         WHERE type = ? AND deleted = 0
         ORDER BY created_at DESC`,
        [type]
      );

      const uploads = rows.map(row => ({
        id: row.id,
        originalName: row.original_name,
        storedName: row.stored_name,
        size: row.size,
        sha256: row.sha256,
        createdAt: row.created_at,
        relPath: `/uploads/admin_imports/${type}/${row.stored_name}`,
      }));

      res.json({ success: true, uploads });
    }
  } catch (e) {
    console.error("[admindataim:uploads] error", e);
    res.status(500).json({ success: false, error: "Failed to fetch uploads" });
  }
});

// ===== DELETE UPLOAD =====
router.delete("/uploads/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    if (/^\d+$/.test(id)) {
      // Database ID - schedules
      const [rows] = await pool.query(
        `SELECT * FROM uploads WHERE id = ? AND deleted = 0`,
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({ success: false, error: "Upload not found" });
      }

      const upload = rows[0];

      // Delete file from filesystem
      const filePath = path.join(__dirname, "..", "uploads", "admin_imports", upload.type, upload.stored_name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Mark as deleted in DB
      await pool.query(`UPDATE uploads SET deleted = 1 WHERE id = ?`, [id]);

      console.log(`[admindataim:delete] Deleted upload ${id}: ${upload.original_name}`);
    } else {
      // Filename - grades from shared directory
      const filePath = path.join(__dirname, "..", "uploads", "studentlist_imports", id);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`[admindataim:delete] Deleted file: ${filePath}`);
      }

      // Mark as deleted in DB if record exists
      const existing = await findByOriginalNameType(id, 'grades');
      if (existing) {
        await pool.query('UPDATE uploads SET deleted = 1 WHERE id = ?', [existing.id]);
        console.log(`[admindataim:delete] Marked DB record as deleted: ${existing.id}`);
      }
    }

    res.json({ success: true, deleted: true, id });
  } catch (e) {
    console.error("[admindataim:delete] error", e);
    res.status(500).json({ success: false, error: "Failed to delete upload" });
  }
});

const MAX_MB = Number(process.env.MAX_UPLOAD_MB || 10);
const MAX_BYTES = MAX_MB * 1024 * 1024;
const VALID_TYPES = new Set(["grades", "schedules"]);
const ACCEPTED_EXTS = new Set([".xlsx", ".csv", ".pdf"]);
const ACCEPTED_MIME = new Set([
  // xlsx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/octet-stream",
  // csv
  "text/csv",
  "application/csv",
  "text/plain", // some browsers send this for csv
  // pdf
  "application/pdf",
]);

// in-memory dedupe for double-clicks
const recentHashes = new Map();
const DEDUPE_WINDOW_MS = 10_000;

// ---- storage per type (preserve extension) ----
function storageForType(type) {
  // For grades, use the same directory as studentlist to synchronize
  const base = type === "grades"
    ? path.join(__dirname, "..", "uploads", "studentlist_imports")
    : path.join(__dirname, "..", "uploads", "admin_imports", type);
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
      const ext = (path.extname(file.originalname) || ".xlsx").toLowerCase();
      cb(null, `${type}_${stamp}_${id}${ext}`);
    },
  });
}

function makeUploader(type) {
  return multer({
    storage: storageForType(type),
    limits: { fileSize: MAX_BYTES, files: 1 },
    fileFilter(_req, file, cb) {
      const ext = (path.extname(file.originalname) || "").toLowerCase();
      const extOk = ACCEPTED_EXTS.has(ext);
      const mimeOk = ACCEPTED_MIME.has(file.mimetype) || extOk;
      if (!extOk) return cb(new Error("Only .xlsx, .csv, or .pdf files are allowed"));
      if (!mimeOk) return cb(new Error("Invalid mime type for spreadsheet"));
      cb(null, true);
    },
  }).single("file");
}

function sha256File(p) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash("sha256");
    fs.createReadStream(p)
      .on("error", reject)
      .on("data", (d) => h.update(d))
      .on("end", () => resolve(h.digest("hex")));
  });
}

/* ---------- XLSX parser (grades layout you showed) ---------- */
function numify(v) {
  if (v == null) return null;
  const s = String(v)
    .replace(/[^0-9.\-]/g, "")
    .trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

async function parseGradesXlsx(filePath) {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];

  const student_no = String(ws.getCell("A2").text || "").trim();
  const student_name = String(ws.getCell("B2").text || "").trim();
  const program = String(ws.getCell("C2").text || "").trim();
  const level = String(ws.getCell("D2").text || "").trim();

  let headerRow = 5;
  for (let r = 3; r <= 8; r++) {
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
  for (let r = headerRow + 1; r <= headerRow + 60; r++) {
    const code = String(ws.getCell(r, 1).text || "").trim();
    const title = String(ws.getCell(r, 2).text || "").trim();
    const units = numify(ws.getCell(r, 3).text);
    const finalGrade = numify(ws.getCell(r, 4).text);
    const empty = !code && !title && !units && !finalGrade;
    if (empty) break;
    if (!code) continue;
    courses.push({ code, title, units, finalGrade });
  }

  let gwa = null,
    cumulative_gwa = null;
  for (let r = 12; r <= 16; r++) {
    const a = (ws.getCell(r, 1).text || "").toLowerCase();
    if (a.includes("gwa")) {
      gwa = numify(ws.getCell(r + 1, 2).text);
      cumulative_gwa = numify(ws.getCell(r + 1, 3).text);
      break;
    }
  }

  return {
    student: { student_no, student_name, program, level },
    courses,
    summary: { gwa, cumulative_gwa },
  };
}

/* ---------- CSV parser (expects headered rows) ----------
   Required headers (case-insensitive):
   student_no,student_name,program,level,course_code,course_title,units,final_grade
-------------------------------------------------------- */
function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function headersOk(headers) {
  const need = [
    "student_no",
    "student_name",
    "program",
    "level",
    "course_code",
    "course_title",
    "units",
    "final_grade",
  ];
  const set = new Set(headers.map(normalizeHeader));
  return need.every((k) => set.has(k));
}

async function parseGradesCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const rows = parse(raw, { columns: true, skip_empty_lines: true, bom: true });
  if (!rows.length) throw new Error("Empty CSV");

  const headers = Object.keys(rows[0]).map(normalizeHeader);
  if (!headersOk(headers)) {
    throw new Error(
      "CSV headers must include: student_no,student_name,program,level,course_code,course_title,units,final_grade"
    );
  }

  // assume all rows belong to one student (or repeated meta)
  const first = rows[0];
  const student = {
    student_no: String(first.student_no ?? first["student no"] ?? "").trim(),
    student_name: String(
      first.student_name ?? first["student name"] ?? ""
    ).trim(),
    program: String(first.program ?? "").trim(),
    level: String(first.level ?? "").trim(),
  };

  const courses = rows
    .map((r) => ({
      code: String(r.course_code ?? r["course code"] ?? "").trim(),
      title: String(r.course_title ?? r["course title"] ?? "").trim(),
      units: numify(r.units),
      finalGrade: numify(r.final_grade ?? r["final grade"]),
    }))
    .filter((c) => c.code);

  // GWA not typically in row-form CSV; leave null
  const summary = { gwa: null, cumulative_gwa: null };
  return { student, courses, summary };
}

/* ---------- PDF parser for grades ---------- */
async function parseGradesPdf(filePath, originalName) {
  const buf = fs.readFileSync(filePath);
  const { text } = await pdfParse(buf);

  if (!text || text.trim().length < 50) {
    throw new Error("PDF appears to be empty or unreadable");
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

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
    const studentNoNameMatch = text.match(/Student\s*No[:\s]*\d{8,}[^\n]*\n([^\n]+?)(?:\n.*Copy of Grades)/si);
    if (studentNoNameMatch && studentNoNameMatch[1]) {
      rawName = studentNoNameMatch[1].trim();
    }
  }

  // Strategy 4: Look for line starting with student number and name
  if (!rawName) {
    for (const line of lines) {
      const m = line.match(/^\s*\d{8,}\s+([A-Z\s,.'-]+)/i);
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

  const student_name = rawName ? rawName.toUpperCase().trim() : null;

  // Log for debugging
  console.log("[PDF Parser] Raw name extracted:", rawName);
  console.log("[PDF Parser] Cleaned name:", student_name);

  if (!student_name && !student_no) {
    throw new Error("Cannot identify student from PDF - no name or ID found");
  }

  const program =
    (text.match(/\b(BSIT|BAOM|BSTM|BAPSYCH|BSCS)\b/i) || [])[1] ||
    getLabel("Program") ||
    null;

  const lvlToken =
    getLabel("Level") ||
    (text.match(/\b([1-4]\s*Y\s*[1-2])\b/i) || [])[1] ||
    null;
  const { level } = lvlToken ? { level: lvlToken.match(/([1-4])/)[1] } : { level: null };

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

  const term = (text.match(/\b(1st|2nd)\s*Semester/i) || [])[1] || null;

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

/* ---------- main route ---------- */
router.post("/:type", async (req, res) => {
  try {
    const type = String(req.params.type || "").toLowerCase();
    if (!VALID_TYPES.has(type)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid import type" });
    }

    const upload = makeUploader(type);
    upload(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            error: `File too large (max ${MAX_MB} MB)`,
          });
        }
        return res.status(400).json({ success: false, error: err.message });
      }
      if (!req.file)
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });

      const { originalname, filename, size, path: savedPath } = req.file;

      // hash for dedupe
      let sha;
      try {
        sha = await sha256File(savedPath);
      } catch (e) {
        console.error("Hash error:", e);
        try {
          fs.unlinkSync(savedPath);
        } catch {}
        return res
          .status(500)
          .json({ success: false, error: "Failed to process file" });
      }

      // memory dedupe
      const now = Date.now();
      const last = recentHashes.get(sha);
      if (last && now - last < DEDUPE_WINDOW_MS) {
        try {
          fs.unlinkSync(savedPath);
        } catch {}
        return res.json({
          success: true,
          duplicate: true,
          type,
          originalName: originalname,
          storedName: filename,
          size,
          sha256: sha,
          note: "Duplicate within dedupe window—ignored new save.",
        });
      }
      recentHashes.set(sha, now);

      // DB dedupe
      const existing = await findBySha(sha);
      if (existing) {
        try {
          fs.unlinkSync(savedPath);
        } catch {}
        return res.json({
          success: true,
          duplicate: true,
          id: existing.id,
          type,
          originalName: originalname,
          storedName: existing.stored_name,
          size,
          sha256: sha,
          relPath: `/uploads/admin_imports/${type}/${existing.stored_name}`,
          note: "Duplicate file detected—reusing existing record.",
        });
      }

      // Insert upload metadata
      const info = await insertUpload({
        type,
        original_name: originalname,
        stored_name: filename,
        size,
        sha256: sha,
      });

      console.log(
        "[UPLOAD]",
        type,
        savedPath,
        "←",
        originalname,
        size,
        "bytes",
        sha
      );

      // Optional: parse → insert rows (grades only)
      if (type === "grades") {
        const ext = (path.extname(savedPath) || "").toLowerCase();
        try {
          let parsed;
          if (ext === ".csv") {
            parsed = await parseGradesCsv(savedPath);
          } else if (ext === ".xlsx") {
            parsed = await parseGradesXlsx(savedPath);
          } else if (ext === ".pdf") {
            parsed = await parseGradesPdf(savedPath, originalname);
          } else {
            throw new Error("Unsupported file type for grades parsing");
          }

          const conn = await pool.getConnection();
          try {
            await conn.beginTransaction();

            await conn.query(
              `INSERT INTO students (student_no, student_name, program, level, term, cumulative_gwa, assessment_status, upload_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE
               student_name = VALUES(student_name),
               program = VALUES(program),
               level = VALUES(level),
               term = VALUES(term),
               cumulative_gwa = VALUES(cumulative_gwa),
               assessment_status = VALUES(assessment_status)`,
              [
                parsed.student.student_no,
                parsed.student.student_name,
                parsed.student.program,
                parsed.student.level,
                parsed.summary.term,
                parsed.summary.cumulative_gwa,
                parsed.courses && parsed.courses.length > 0 ? 'COMPLETE' : 'PENDING',
                info.lastInsertRowid,
              ]
            );

            if (parsed.courses.length) {
              const rows = parsed.courses.map((c) => [
                info.lastInsertRowid,
                parsed.student.student_no,
                c.code,
                c.title,
                c.units,
                c.finalGrade,
                c.gradeText,
              ]);
              await conn.query(
                `INSERT INTO grades (upload_id, student_no, course_code, course_title, units, final_grade, grade_text)
                 VALUES ?`,
                [rows]
              );
            }

            await conn.query(
              `INSERT INTO grade_summaries (upload_id, student_no, gwa, cumulative_gwa, term)
               VALUES (?, ?, ?, ?, ?)`,
              [
                info.lastInsertRowid,
                parsed.student.student_no,
                parsed.summary.gwa,
                parsed.summary.cumulative_gwa,
                parsed.summary.term,
              ]
            );

            await conn.commit();
          } catch (e) {
            await conn.rollback();
            console.error("Parse/insert error:", e);
          } finally {
            conn.release();
          }
        } catch (e) {
          console.warn("Grades parse skipped:", e.message);
        }
      }

      return res.json({
        success: true,
        duplicate: false,
        id: info.lastInsertRowid,
        type,
        originalName: originalname,
        storedName: filename,
        size,
        sha256: sha,
        relPath: `/uploads/admin_imports/${type}/${filename}`,
      });
    });
  } catch (e) {
    console.error("Upload route error:", e);
    res.status(500).json({ success: false, error: "Unexpected server error" });
  }
});

// ===== PREVIEW FILE =====
router.get("/preview/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ success: false, error: "Invalid ID" });
    }

    let filePath, fileName, dir;

    // Check if it's a database ID (numeric) or filename
    if (/^\d+$/.test(id)) {
      // Database ID - schedules
      const [rows] = await pool.query(
        `SELECT * FROM uploads WHERE id = ? AND deleted = 0`,
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({ success: false, error: "Upload not found" });
      }

      const upload = rows[0];
      dir = `admin_imports/${upload.type}`;
      filePath = path.join(__dirname, "..", "uploads", dir, upload.stored_name);
      fileName = upload.original_name;
    } else {
      // Filename - grades from shared directory
      dir = "studentlist_imports";
      filePath = path.join(__dirname, "..", "uploads", dir, id);
      fileName = id;
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: "File not found" });
    }

    const ext = (path.extname(filePath) || "").toLowerCase();
    let data = [];

    if (ext === ".xlsx") {
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.readFile(filePath);
      const ws = wb.worksheets[0];
      ws.eachRow((row, rowNumber) => {
        const rowData = [];
        row.eachCell((cell) => {
          rowData.push(cell.text || "");
        });
        data.push(rowData);
      });
    } else if (ext === ".csv") {
      const raw = fs.readFileSync(filePath, "utf8");
      const rows = parse(raw, { skip_empty_lines: true, bom: true });
      data = rows;
    } else if (ext === ".pdf") {
      const buf = fs.readFileSync(filePath);
      const { text } = await pdfParse(buf);
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      // Convert lines to table format (single column)
      data = lines.map(line => [line]);
    } else {
      return res.status(400).json({ success: false, error: "Unsupported file type" });
    }

    res.json({
      success: true,
      fileName: fileName,
      relPath: `/uploads/${dir}/${path.basename(filePath)}`,
      data: data.slice(0, 100), // Limit to first 100 rows for preview
      totalRows: data.length,
      truncated: data.length > 100
    });
  } catch (e) {
    console.error("[admindataim:preview] error", e);
    res.status(500).json({ success: false, error: "Failed to preview file" });
  }
});

module.exports = router;
