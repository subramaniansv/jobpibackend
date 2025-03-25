const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const Job = require("../model/job.js");
require('dotenv').config();

//Login 
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { ADMIN_EMAIL, ADMIN_PASSWORD, JWT_SECRET } = process.env;

    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Hash the plain password in `.env` for better security
    const hashedPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);

    // Compare entered password with hashed password
    const isPasswordValid = bcrypt.compareSync(password, hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign({ email, role: "admin" }, JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Admin logged in successfully", token });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
//Jobs operation for admin

const getAllJobs =async (req,res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json({success:true,message:"Job fetched successfully",jobs})
  } catch (error) {
    res.status(500).json({success:false,message:"Internal Server error"})
  }
}
const deleteJobByAdmin = async (req, res) => {
  try {
      const { id } = req.params;
      const job = await Job.findById(id);

      if (!job) {
          return res.status(404).json({ success: false, message: "Job not found" });
      }

      await Job.findByIdAndDelete(id);
      res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
      res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {adminLogin,getAllJobs,deleteJobByAdmin}