const mongoose = require('mongoose');
const job = require('./job');

const hrSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    company:{type:String},
    postedjob:[{type:mongoose.Schema.Types.ObjectId, ref:"Job"}],
    role:{type: String}

})
module.exports = mongoose.model("Hr",hrSchema)