const bcrypt = require("bcryptjs");

module.exports = function registerAdminSetup(app, q) {
  app.post("/api/admin/setup", async (req, res) => {
    const { ADMIN_NAME, ADMIN_MOBILE, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
    if (!ADMIN_NAME || !/^\d{10}$/.test(ADMIN_MOBILE || "") || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
      return res.status(503).json({ error: "Admin setup is not configured" });
    }

    const existingAdmin = await q("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (existingAdmin.rowCount) {
      return res.status(410).json({ error: "Admin setup already completed" });
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    const existing = await q("SELECT id FROM users WHERE mobile=$1", [ADMIN_MOBILE]);
    let user;
    if (existing.rowCount) {
      const r = await q(
        "UPDATE users SET name=$1,email=$2,password_hash=$3,role='admin' WHERE mobile=$4 RETURNING id,name,mobile,email,role",
        [ADMIN_NAME, ADMIN_EMAIL || null, hash, ADMIN_MOBILE]
      );
      user = r.rows[0];
    } else {
      const r = await q(
        "INSERT INTO users(name,mobile,email,password_hash,role) VALUES($1,$2,$3,$4,'admin') RETURNING id,name,mobile,email,role",
        [ADMIN_NAME, ADMIN_MOBILE, ADMIN_EMAIL || null, hash]
      );
      user = r.rows[0];
    }

    return res.json({ ok: true, user: { id: user.id, name: user.name, mobile: user.mobile, role: user.role } });
  });
};
