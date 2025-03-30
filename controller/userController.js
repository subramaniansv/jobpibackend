const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/user.js");
const Job = require("../model/job.js");
const Application = require("../model/application.js");
const pdfParse = require("pdf-parse");
const Resume = require("../model/resume.js");
const { processResume } = require("../utils/processResume.js");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

// Register User
const registerUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      role: "user",
      password: hashedPassword,
    });

    await newUser.save();

    // Generate token
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: "user" }, // Fixed: Use newUser._id
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res
      .status(201)
      .json({ success: true, message: "User registered successfully", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      console.log("User not found.");
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    // Generate token
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .json({ success: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//user profile
const userProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//Get job for user:
const getJobsUser = async (req, res) => {
  try {
    const { title, location, minSalary, maxSalary, datePosted, skills,  company } = req.query;

    let query = {};

    // title
    if (title && title.trim() !== "") {
      query.title = { $regex: new RegExp(title.trim(), "i") };
    }

    // Location Filter
    if (location && location.trim() !== "") {
      query.location = { $regex: new RegExp(location.trim(), "i") };
    }

    //  Salary Filter
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    // date
    if (datePosted) {
      let dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - Number(datePosted));
      query.createdAt = { $gte: dateLimit };
    }

    // 
    if (skills) {
      const skillArray = skills.split(",").map(skill => skill.trim());
      query.skills = { $in: skillArray }; // Match jobs with at least one of these skills
    }

   
    // 🔹 Company Name Filter
    if (company && company.trim() !== "") {
      query.company = { $regex: new RegExp(company.trim(), "i") };
    }

   

  
    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// Get Job by ID
const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    const userId = req.user.id;
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

   const user = await User.findById(userId);
    const isSaved = user.savedJobs.includes(jobId);

    res.status(200).json({ job, saved: isSaved })
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
//save and remove jobs
const saveJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user.savedJobs.includes(jobId)) {
      user.savedJobs.push(jobId);
      await user.save();
    }

    res.json({ message: "Job saved successfully" });
  } catch (error) {
    console.error("Error saving job:", error);
    res.status(500).json({ message: "Server error" });
  }
}
const removeJob = async (req,res)=>{
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    await user.save();

    res.json({ message: "Job removed from saved list" });
  } catch (error) {
    console.error("Error removing saved job:", error);
    res.status(500).json({ message: "Server error" });
  }
}
//fetch saved Jobs
const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("savedJobs");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, savedJobs: user.savedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
//Applicatons controller
//apply for a job
const applyJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check if user has already applied
    const existingApplication = await Application.findOne({ user: userId, job: jobId });
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    const newApplication = new Application({
      user: userId,
      job: jobId,
      hr: job.hrId,
    });

    await newApplication.save();
    res.status(201).json({ message: "Application submitted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//withdraw application 
const withdrawApplication = async (req,res)=>{
  try {
    const { applicationId } = req.params;
    const userId = req.user.id;

    const application = await Application.findOneAndDelete({
      _id: applicationId,
      user: userId,
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
//application id
const applicationFromJob = async (req,res)=>{
  try {
    const userId = req.user.id;
    const { jobId } = req.params;

    const application = await Application.findOne({ user: userId, job: jobId });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ applicationId: application._id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
//all jobs applied by the user
const jobsApplied = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ user: userId })
      .populate("job", "title company location")
      .populate("hr", "name email");

    res.status(200).json({ AppliedJobs: applications }); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const applicationStatus = async(req,res)=>{
  try {
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.status(200).json({ status: application.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
//***RESUME ANALYSIS****//
const analyseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "Upload a file" });
  }

  try {
    const userId = req.user.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "User not authorized" });
    }

    const pdfBuffer = req.file.buffer;

    const data = await pdfParse(pdfBuffer);

    const resumeText = data.text;

    const extractedData = processResume(resumeText);

    const resumeData = {
      userId,
      name: req.body.name || extractedData.contact?.name || "Not Provided",
      email: req.body.email || extractedData.contact?.email || "Not Provided",
      phone: req.body.phone || extractedData.contact?.phone || "Not Provided",
      skills: req.body.skills
        ? req.body.skills.split(",")
        : extractedData.skills || [],
      languages: req.body.languages ? req.body.languages.split(",") : [],
      experience:
        req.body.experience ||
        (extractedData.experience !== "Not Found"
          ? [{ jobTitle: extractedData.experience }]
          : []),
      education:
        req.body.education ||
        (extractedData.education !== "Not Found"
          ? [{ institution: extractedData.education }]
          : []),
      certifications: req.body.certifications
        ? JSON.parse(req.body.certifications)
        : [],
      projects: req.body.projects ? JSON.parse(req.body.projects) : [],
    };

    const newResume = new Resume(resumeData);
    await newResume.save();

    res.status(201).json({
      success: true,
      resume: newResume,
      message: "Resume stored successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error uploading resume" });
  }
};
//**RESUME DOWNLOADER **//
const downloadResume = async (req, res) => {
  try {
    const resumeId = req.params.resumeId;

    // Check if the ID is valid before querying the database
    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Resume ID" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }
    // Load the EJS template
    const templatePath = path.join(__dirname, "../templates/resume.ejs");
    const html = await ejs.renderFile(templatePath, { resume }); // Corrected function name

    // Puppeteer setup
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html);
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close(); // Close the browser instance

    // Send response
    res.setHeader("Content-Disposition", `attachment; filename="${resume.name}_Resume.pdf"`);
    res.contentType("application/pdf");
    res.end(pdfBuffer);
    
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error", error });
  }
};
//RESUME BUILDER//
const createResume = async(req,res) =>{
  try {
    const userId = req.user.id; // Extract userId from authenticated user
    const newResume = new Resume({ name:"Untitled resume", userId });

    const savedResume = await newResume.save();
    res.status(201).json(savedResume);
} catch (error) {
    res.status(500).json({ message: "Error creating resume", error });
}
}
//get resume of respective user
const allResume = async(req,res) =>{
  try {
    const  userId  = req.user.id; // Optional filter
    const resumes = userId ? await Resume.find({ userId }) : await Resume.find();
    res.status(200).json(resumes);
} catch (error) {
    res.status(500).json({ message: "Error fetching resumes", error });
}
}
// get each resume
const getResume = async (req,res) =>{
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Ensure only the owner can view
    if (resume.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to view this resume" });
    }

    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: "Error fetching resume", error });
  }
}
//update resume
const updateResume = async(req,res) =>{
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Ensure user can only update their own resume
    if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to update this resume" });
    }

    const updatedResume = await Resume.findByIdAndUpdate(req.params.resumeId, req.body, { new: true });
    res.status(200).json(updatedResume);
} catch (error) {
    res.status(500).json({ message: "Error updating resume", error });
}
}
//delete resume
const deleteResume = async(req,res)=>{
  try {
    const resume = await Resume.findById(req.params.resumeId);
    if (!resume) return res.status(404).json({ message: "Resume not found" });

    // Ensure user can only delete their own resume
    if (resume.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to delete this resume" });
    }

    await Resume.findByIdAndDelete(req.params.resumeId);
    res.status(200).json({ message: "Resume deleted successfully" });
} catch (error) {
    res.status(500).json({ message: "Error deleting resume", error });
}
}
const previewResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).send("Resume not found");
    }

    res.render("resume", { resume });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).send("Server error");
  }
}
module.exports = {
  registerUser,
  loginUser,
  getJobsUser,
  getJobById,
  userProfile,
  saveJob,
  removeJob,
  getSavedJobs,
  analyseResume,
  downloadResume,
  previewResume,
  createResume,
  allResume,
  getResume,
  updateResume,
  deleteResume,
  applyJob,
  jobsApplied,
  applicationFromJob,
  withdrawApplication,
  applicationStatus,
};
