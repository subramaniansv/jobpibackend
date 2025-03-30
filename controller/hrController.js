const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Hr = require("../model/hr.js"); 
const Job = require('../model/job.js');
const Application = require("../model/application.js");
require("dotenv").config();
//register hr
const registerHr = async (req,res)=>{
    try {
       const {email,password,name} = req.body;
       //hr exisitence check
       if(await Hr.findOne({email})){
        return res.status(400).json({success:false,message:"User already exists"});
       } 
       //hash the password
       const hashedPassword = await bcrypt.hash(password,10);
       const newHr = new Hr({
        name,email,role:"hr",password:hashedPassword
       });
       await newHr.save();
       //token generation
       const token = jwt.sign({
        id:newHr._id,email:newHr.email,role:"hr"},
        process.env.JWT_SECRET,
        { expiresIn:"1d"}    
    );
    return res.status(201).json({ success: true, message: "User registered successfully", token });

    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error"})
    }
}
//login hr
const loginHr = async(req,res) =>{
    try {
        const {email,password}= req.body;
        //find hr
        const existingHr = await Hr.findOne({email});
        if(!existingHr){
            return res.status(404).json({success:false,message:"User not found"})
        }
        //validate hr
        const isPasswordValid = await bcrypt.compare(password,existingHr.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, error: "Invalid email or password" });
         }
          // Generate token
               const token = jwt.sign(
                 { id: existingHr._id, email: existingHr.email, role: "hr" },
                 process.env.JWT_SECRET,
                 { expiresIn: "1d" }
               );
         
               return res.status(200).json({ success: true, message: "Login successful", token });
            
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error"})
    }
}
const hrProfile = async(req,res)=>{
  try {
      const hrId = req.user.id;
      const hr = await Hr.findById(hrId).select("-password")
      if(!hr){
        return res.status(404).json({success:false,message:"User not found"})
      }
      res.status(200).json({success:true,hr})
    } catch (error) {
      res.status(500).json({success:false,message:"Internal server error"});
    }
}
//CRUD OPERATIONS OF HR FOR JOBS:
//Create Jobs
const createJob = async (req, res) => {
    try {
        const { title, description, company, location, salary, skills } = req.body;
        const hrId = req.user.id;

        if (!hrId) {
            return res.status(404).json({ success: false, message: "User id not found" });
        }
        if (!title || !company || !description || !location) {
            return res.status(400).json({ success: false, message: "Missing some input values" });
        }

        const newJob = new Job({
            title, company, description, location, salary, skills, hrId
        });
        await newJob.save();
        res.status(201).json({ success: true, job: newJob });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
//Get all Jobs
const getHrJob = async(req,res) =>{
    try {
        const hrId = req.user.id;
        const jobs = await Job.find({hrId});
        res.status(200).json({success:true,message:"Job fetched succesfully",jobs})
    } catch (error) {
        res.status(500).json({success:false,message:"Internal Server Error"})
    }
}
// Get Job by ID
const getJobById = async (req, res) => {
    try {
      const { id } = req.params;
      const job = await Job.findById(id);
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found" });
      }
  
      const userId = req.user.id;
      const user = await Hr.findById(userId);
      const isSaved = user?.savedJobs?.includes(id);
  
      res.status(200).json({ job, saved: isSaved });
    } catch (error) {
      console.error("Error fetching job:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };  
//Update a job
const updateHrJob = async (req, res) => {
    try {
      const hrId = req.user.id;
      const { id } = req.params;
  
      if (!hrId) {
        return res.status(403).json({ success: false, message: "User ID not found" });
      }
  
      const job = await Job.findOneAndUpdate({ _id: id, hrId }, req.body, { new: true });
  
      if (!job) {
        return res.status(404).json({ success: false, message: "Job not found or unauthorized" });
      }
  
      res.status(200).json({ success: true, message: "Job updated successfully", job });
    } catch (error) {
      console.error("Error updating job:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  };
//delete a job
const deleteHrJob = async(req,res) =>{
    try {
        const hrId = req.user.id;
        const {id} = req.params;
        if(!hrId){
            return res.status(403).json({success:true,message:"user id not found"})
        }
        const job = await Job.findOne({_id:id,hrId});
        if(!job){
            return res.status(404).json({success:false,message:"Job not Found"})
        }
        await Application.deleteMany({ job: id });
        const updatedJob = await Job.findByIdAndDelete(id, req.body, { new: true });
        res.status(200).json({ success: true, message: "Job deleted successfully", job: updatedJob });
    } catch (error) {
        res.status(500).json({success:false,message:"Internal server error"})
    }
}
//Applications
//get applications based on the job id
const getApplicationForJob = async(req,res)=>{
    try {
      const { jobId } = req.params;
      const hrId = req.user.id; 
  
      const applications = await Application.find({ job: jobId, hr: hrId })
        .populate("user", "name email")
        .populate("job", "title");
  
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}
//application status changer
const updateApplicationStatus = async(req,res)=>{
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const hrId = req.user.id;

    const application = await Application.findOne({
      _id: applicationId,
      hr: hrId, 
    });
    if (!application) {
      return res.status(404).json({ message: "Application not found or unauthorized" });
    }

    application.status = status;
    await application.save();

    res.status(200).json({ message: "Application status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
const getApplicationsForHR = async (req, res) => {
  try {
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: HR ID not found" });
    }

    const hrId = req.user.id;
    const applications = await Application.find({ hr: hrId })
      .populate("user", "name email")
      .populate("job", "title");
    if (!applications.length) {
      return res.status(200).json({ message: "No applications found", data: [] });
    }

    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

module.exports = {registerHr,loginHr,hrProfile,createJob,getHrJob,getJobById,updateHrJob,deleteHrJob, getApplicationForJob,updateApplicationStatus , getApplicationsForHR}