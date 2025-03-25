const jwt = require("jsonwebtoken");
require("dotenv").config();

const adminAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Handle missing Bearer
    if (!token) {
      return res.status(401).json({ message: "Token not found. Please log in again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.email !== process.env.ADMIN_EMAIL || decoded.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Unauthorized admin" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = adminAuth;
