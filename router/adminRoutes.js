const express = require("express");
const adminRouter = express.Router();
const adminAuth = require('../middleware/adminAuth.js');
const { adminLogin, getAllJobs, deleteJobByAdmin } = require("../controller/adminController.js");

adminRouter.post("/login",adminLogin);
adminRouter.get("/all-jobs",adminAuth,getAllJobs)
adminRouter.delete("/delete-job/:id",adminAuth,deleteJobByAdmin)
module.exports = adminRouter;

