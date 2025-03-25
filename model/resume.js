const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: { type: String, trim: true },
  email: { type: String, trim: true },
  phone: { type: String, trim: true },

  skills: [{ type: String, trim: true }],

  experience: [
    {
      jobTitle: { type: String,  trim: true },
      company: { type: String,  trim: true },
      location: { type: String, trim: true },
      startDate: { type: String, },
      endDate: { type: String },
      description: { type: String, trim: true },
    },
  ],

  education: [
    {
      institution: { type: String, trim: true },
      degree: { type: String,  trim: true },
      fieldOfStudy: { type: String, trim: true },
      startDate: { type: String, },
      endDate: { type: String },
      description: { type: String, trim: true },
    },
  ],

  certifications: [
    {
      title: { type: String, trim: true },
      issuer: { type: String, trim: true },
      dateIssued: { type: String },
      description: { type: String, trim: true },
    },
  ],

  projects: [
    {
      title: { type: String,trim: true },
      description: { type: String, trim: true },
      link: { type: String, trim: true },
    },
  ],

  languages: [{ type: String, trim: true }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update 'updatedAt' on save
ResumeSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Resume = mongoose.model("Resume", ResumeSchema);
module.exports = Resume;
