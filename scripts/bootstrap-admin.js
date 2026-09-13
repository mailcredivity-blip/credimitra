require("dotenv").config();
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const { DATABASE_URL, DB_SSL, ADMIN_NAME, ADMIN_MOBILE, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

if (!DATABASE_URL) throw new Error("DATABASE_URL required");
if (!ADMIN_NAME) throw new Error("ADMIN_NAME required");
if (!/^\d{10}$/.test(ADMIN_MOBILE || "")) throw new Error("ADMIN_MOBILE must be 10 digits");
if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

(async () => {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const existing = await pool.query("SELECT id, role FROM users WHERE mobile=$1", [ADMIN_MOBILE]);

  if (existing.rowCount) {
    await pool.query(
      "UPDATE users SET name=$1,email=$2,password_hash=$3,role='admin' WHERE mobile=$4",
      [ADMIN_NAME, ADMIN_EMAIL || null, passwordHash, ADMIN_MOBILE]
    );
    console.log(`Admin updated for mobile ending ${ADMIN_MOBILE.slice(-4)}`);
  } else {
    await pool.query(
      "INSERT INTO users(name,mobile,email,password_hash,role) VALUES($1,$2,$3,$4,'admin')",
      [ADMIN_NAME, ADMIN_MOBILE, ADMIN_EMAIL || null, passwordHash]
    );
    console.log(`Admin created for mobile ending ${ADMIN_MOBILE.slice(-4)}`);
  }

  await pool.end();
})().catch(async (err) => {
  console.error(err.message || err);
  try { await pool.end(); } catch {}
  process.exit(1);
});
