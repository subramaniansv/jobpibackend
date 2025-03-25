const multer = require("multer");

const storage = multer.memoryStorage(); // Storing file in memory (for analysis)

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true); // Accept the file
    } else {
        cb(new Error("Only pdf files are allowed"), false); // Reject the file
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
