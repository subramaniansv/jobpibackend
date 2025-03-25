const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{type: String, required: true},
    email:{type: String, required: true,unique:true},
    password:{type: String, required: true,unique:true},
    name:{type: String, required: true},
    skill:[String],
    role:{type: String},
    savedJobs:[{type:mongoose.Schema.Types.ObjectId,ref:"Job"}],
    resume:[{type:mongoose.Schema.Types.ObjectId,ref:"Resume"}],

},{timestamps:true});
module.exports = mongoose.model("User",userSchema);