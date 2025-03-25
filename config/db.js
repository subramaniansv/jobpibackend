const mongoose = require('mongoose');

const connectDb = ()=>{
    try {
        mongoose.connect(process.env.DB_URL);
        console.log("Server connected with DB");
    } catch (error) {
        console.error("Some issue in connecting with DB..")
    }
}
module.exports= connectDb