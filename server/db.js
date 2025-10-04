require("dotenv").config({ path: __dirname + "/../.env" });

console.log(
  "[LEGACY DB BOOT] Connecting:",
  process.env.MYSQL_HOST,
  process.env.MYSQL_USER,
  process.env.MYSQL_DB,
  process.env.MYSQL_PASSWORD ? "(password set)" : "(no password)"
);

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "12345",
  database: process.env.MYSQL_DB || "enrollment_db",
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: true,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 60000,
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
      console.log(`[LEGACY DDL] Added ${table}.${column}`);
    }
  } catch (err) {
    console.error(
      `[LEGACY DDL] Failed to add column ${table}.${column}:`,
      err.message
    );
  }
}

async function init() {
  const ddl = `
  CREATE TABLE IF NOT EXISTS uploads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('grades','schedules') NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name   VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    sha256 CHAR(64) NOT NULL,
    deleted TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_original_type (original_name, type),
    INDEX (sha256),
    INDEX (type, created_at),
    INDEX (original_name, type),
    INDEX (deleted)
  );

  CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_no VARCHAR(64) NULL,
    name VARCHAR(255),
    program VARCHAR(64),
    level VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_student_no (student_no),
    INDEX (student_no),
    INDEX (name),
    INDEX (program)
  );

  CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_id INT NOT NULL,
    student_no VARCHAR(64),
    course_code VARCHAR(64) NOT NULL,
    course_title VARCHAR(255),
    units DECIMAL(6,2),
    final_grade DECIMAL(6,2),
    grade_text VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
    INDEX (student_no),
    INDEX (upload_id),
    INDEX (course_code)
  );

  CREATE TABLE IF NOT EXISTS grade_summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upload_id INT NOT NULL,
    student_no VARCHAR(64),
    gwa DECIMAL(6,3),
    cumulative_gwa DECIMAL(6,3),
    term VARCHAR(16),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (upload_id) REFERENCES uploads(id) ON DELETE CASCADE,
    INDEX (student_no),
    INDEX (upload_id),
    INDEX (term)
  );
  `;

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(ddl);

    // Ensure required columns exist
    await ensureColumn(conn, "grades", "grade_text", "VARCHAR(32) NULL");
    await ensureColumn(conn, "grade_summaries", "term", "VARCHAR(16) NULL");
    await ensureColumn(
      conn,
      "students",
      "created_at",
      "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
    );
    await ensureColumn(
      conn,
      "students",
      "updated_at",
      "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    );

    console.log("[LEGACY DB INIT] Schema check completed successfully");
  } catch (err) {
    console.error("[LEGACY DB INIT ERROR]", err);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// Test connection before initializing
async function testConnection() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.execute("SELECT 1");
    console.log("[LEGACY DB] Connection test successful");
    return true;
  } catch (err) {
    console.error("[LEGACY DB] Connection test failed:", err.message);
    return false;
  } finally {
    if (conn) conn.release();
  }
}

// Initialize with connection test
(async () => {
  try {
    const connected = await testConnection();
    if (connected) {
      await init();
    } else {
      console.error(
        "[LEGACY DB] Skipping initialization due to connection failure"
      );
    }
  } catch (err) {
    console.error("[LEGACY DB] Initialization failed:", err.message);
  }
})();

// Helper functions with improved error handling
async function insertUpload(row) {
  const sql = `
    INSERT INTO uploads (type, original_name, stored_name, size, sha256)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    stored_name = VALUES(stored_name),
    size = VALUES(size),
    sha256 = VALUES(sha256),
    created_at = CURRENT_TIMESTAMP
  `;
  const args = [
    row.type,
    row.original_name,
    row.stored_name,
    row.size,
    row.sha256,
  ];

  try {
    const [r] = await pool.query(sql, args);
    return { lastInsertRowid: r.insertId };
  } catch (err) {
    console.error("[LEGACY DB] insertUpload failed:", err);
    throw err;
  }
}

async function findBySha(sha) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM uploads WHERE sha256 = ? AND deleted = 0 ORDER BY id DESC LIMIT 1`,
      [sha]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[LEGACY DB] findBySha failed:", err);
    throw err;
  }
}


async function findByOriginalNameType(originalName, type) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM uploads WHERE LOWER(original_name) = LOWER(?) AND type = ? AND deleted = 0 ORDER BY id DESC LIMIT 1`,
      [originalName, type]
    );
    return rows[0] || null;
  } catch (err) {
    console.error("[LEGACY DB] findByOriginalNameType failed:", err);
    throw err;
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("[LEGACY DB] Gracefully shutting down connection pool...");
  try {
    await pool.end();
    console.log("[LEGACY DB] Pool closed successfully");
    process.exit(0);
  } catch (err) {
    console.error("[LEGACY DB] Error closing pool:", err);
    process.exit(1);
  }
});

module.exports = {
  pool,
  insertUpload,
  findBySha,
  findByOriginalNameType,
};
