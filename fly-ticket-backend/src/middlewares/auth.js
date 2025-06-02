import jwt from "jsonwebtoken";

export function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header." });
    }
    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload.isAdmin) {
      return res.status(403).json({ error: "Not authorized." });
    }
    req.user = { username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}