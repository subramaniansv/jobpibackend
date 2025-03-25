const express = require("express");
const { registerUser, loginUser, getJobsUser,getSavedJobs,getJobById,saveJob,userProfile, analyseResume, downloadResume,previewResume, createResume, allResume, getResume, updateResume, deleteResume, removeJob } = require("../controller/userController");
const authUser = require("../middleware/userAuth.js");
const upload = require("../config/multer.js");
const userRouter = express.Router();

userRouter.post("/userRegister",registerUser)
userRouter.post("/userLogin",loginUser);
userRouter.get("/profile", authUser, userProfile);

//job routes
userRouter.get("/get-jobs",authUser,getJobsUser);
userRouter.get("/get-job-id/:jobId", authUser, getJobById);
userRouter.post("/save-job", authUser, saveJob);
userRouter.post("/remove-saved-job", authUser, removeJob);
userRouter.get("/saved-jobs", authUser, getSavedJobs);

//resume analysis
userRouter.post("/analyze-resume",authUser,upload.single("file"),analyseResume);
//resume builder
userRouter.post("/create-resume",authUser,createResume);
userRouter.get("/all-resume",authUser,allResume);
userRouter.get("/single-resume/:resumeId",authUser,getResume);
userRouter.put("/update-resume/:resumeId",authUser,updateResume);
userRouter.delete("/delete-resume/:resumeId",authUser,deleteResume)
//download resume 
userRouter.get("/download/:resumeId", downloadResume)
userRouter.get("/preview-resume/:resumeId",previewResume)
module.exports = userRouter;