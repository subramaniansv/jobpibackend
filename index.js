require("dotenv").config();
const express = require("express")
const cors = require("cors")
const path = require('path')
const connectDb = require('./config/db');
const adminRouter = require("./router/adminRoutes");
const userRouter = require("./router/userRoutes");
const hrRouter = require("./router/hrRoutes");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express()

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(cors())
// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use(limiter);
//Database connection
connectDb()
//Routes to controll admin ,user and hr
app.use("/api/admin",adminRouter);
app.use('/api/user',userRouter);
app.use('/api/hr',hrRouter)
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> console.log(`Server is now running on Port ${PORT}`));
