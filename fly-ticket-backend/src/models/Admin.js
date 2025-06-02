import { pool } from "../config/db.js";

export const Admin = {
  // 1) Create a new admin user (username + hashed password):
  async create({ username, passwordHash }) {
    const [result] = await pool.query(
      `INSERT INTO Admin (username, password) VALUES (?, ?)`,
      [username, passwordHash]
    );
    return result;
  },

  // 2) Find an admin by username (to verify password during login):
  async findByUsername(username) {
    const [rows] = await pool.query(
      `SELECT username, password FROM Admin WHERE username = ?`,
      [username]
    );
    return rows[0] || null;
  },
};
