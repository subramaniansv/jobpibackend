const express = require("express");
const { registerHr, loginHr,createJob, getHrJob, updateHrJob, deleteHrJob, hrProfile, getJobById, getApplicationForJob,updateApplicationStatus , getApplicationsForHR} = require("../controller/hrController");
const authHr = require('../middleware/hrAuth');
const hrRouter = express.Router();
//Register and Login
hrRouter.post("/hrRegister",registerHr);
hrRouter.post("/hrLogin",loginHr);
hrRouter.get("/hr-profile",authHr,hrProfile)
//CRUD operations:
hrRouter.post("/create-job",authHr,createJob);
hrRouter.get("/get-jobs",authHr,getHrJob);
hrRouter.get("/single-job/:id",authHr,getJobById);
hrRouter.put("/update-job/:id",authHr,updateHrJob);
hrRouter.delete("/delete-job/:id",authHr,deleteHrJob);
//Applicatons option
hrRouter.get("/get-applications/:jobId",authHr,getApplicationForJob);
hrRouter.get("/get-hr-applications",authHr,getApplicationsForHR);
hrRouter.put("/update-status/:applicationId",authHr,updateApplicationStatus);

module.exports = hrRouter;