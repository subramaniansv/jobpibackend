const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Rejected", "Accepted"],
      default: "Pending",
    },
    hr: { type: mongoose.Schema.Types.ObjectId, ref: "Hr" }, 
  },
  { timestamps: true }
);

ApplicationSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model("Application", ApplicationSchema);
