const jwt = require("jsonwebtoken");
require("dotenv").config();

const authHr = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "hr")
      return res.status(403).json({ message: "Unauthorized access" });

    req.user = decoded;
    next();
  } catch (error) {
    res.satuts(500).json({ success: false, message: "Internal server error" });
  }
};
module.exports = authHr;