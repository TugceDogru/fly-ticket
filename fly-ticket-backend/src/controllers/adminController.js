import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.js";

const SALT_ROUNDS = 10;

export async function registerAdmin(req, res, next) {
  try {
    const { username, password } = req.body;

    // 1) Check if username already exists
    const existing = await Admin.findByUsername(username);
    if (existing) {
      return res.status(400).json({ error: "Username already exists." });
    }

    // 2) Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3) Insert into DB
    await Admin.create({ username, passwordHash });

    res.status(201).json({ message: "Admin registered successfully." });
  } catch (err) {
    // Log the full error to console
    console.error("registerAdmin error:", err);
    // Then continue passing to the global error handler:
    next(err);
  }
}

export async function loginAdmin(req, res, next) {
  try {
    const { username, password } = req.body;

    // 1) Find the admin row
    const user = await Admin.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 2) Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 3) Issue a JWT
    const payload = { username, isAdmin: true };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({ message: "Login successful.", token });
  } catch (err) {
    next(err);
  }
}
