// server.js - Merged Version
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ===== Core imports
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const multer = require("multer");

// Database initialization
const { initDB } = require("./config/connectiondb");
require("./db"); // Legacy DB initialization

// Route imports
const authRoutes = require("./routes/authRoute");
const studentRoutes = require("./routes/studentRoute");
const evaluatorRoutes = require("./routes/evaluatorRoute");
const adminRoutes = require("./routes/adminRoute");

// Legacy route imports
const adminDataImportRouter = require("./controllers/admindataim-be");
const adminStudListRouter = require("./controllers/adminstudlist-be");

// ===== App & basic config
const app = express();
const PORT = process.env.PORT || 4000;

// Log environment variables (from old file)
console.log("[ENV] PORT:", process.env.PORT);
console.log("[ENV] MYSQL_HOST:", process.env.MYSQL_HOST);
console.log("[ENV] MYSQL_USER:", process.env.MYSQL_USER);
console.log("[ENV] MYSQL_DB:", process.env.MYSQL_DB);
// DO NOT log full password in real life:
console.log("[ENV] MYSQL_PASSWORD set?", !!process.env.MYSQL_PASSWORD);

// ===== Security & performance middleware
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());

// CORS configuration (merged from both)
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true); // same-origin tools & curl
      const ok = allowed.some((a) => origin.startsWith(a));
      cb(ok ? null : new Error("CORS blocked"), ok);
    },
    credentials: true,
  })
);

// ===== Body parsers
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== Ensure upload directories exist (from old file)
const ensureDirs = [
  path.join(__dirname, "uploads"),
  path.join(__dirname, "uploads/admin_imports"),
  path.join(__dirname, "uploads/admin_imports/grades"),
  path.join(__dirname, "uploads/admin_imports/schedules"),
  path.join(__dirname, "uploads/studentlist_imports"),
  path.join(__dirname, "uploads/studentlist_imports/grades"),
];
ensureDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ===== Database initialization
initDB(); // New DB initialization

// ===== Health endpoints (merged)
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) =>
  res.json({ status: "ok", at: new Date().toISOString() })
);

// ===== API Routes (merged from both files)

// New routes
app.use("/api", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/evaluator", evaluatorRoutes);
app.use("/api/admin", adminRoutes);

// Legacy routes
app.use("/api/import", adminDataImportRouter);
app.use("/api/students", adminStudListRouter);

// Static serving of uploads (from old file)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ===== Error handler (from new file)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

// ===== Server startup
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Allowed origins:`, allowed);
  console.log(`Health check available at: http://localhost:${PORT}/health`);
});
