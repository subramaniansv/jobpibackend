const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
    title:{type: String, required: true},
    company:{type: String, required: true},
    location:{type: String, required: true},
    description:{type: String, required: true},
    salary:{type: String, },
    skills:[String],
    hrId:{type:mongoose.Schema.Types.ObjectId,ref:"Hr",required:true},
    postedAt:{type: Date,default:Date.now},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});
jobSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
  });
const Job = mongoose.model("Job",jobSchema)
module.exports = Job