
//require('dotenv').config({path: './env'})

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})
connectDB()
.then(()=>{
    app.listen(process.nextTick.PORT || 8000 , ()=>
    log`server is running at port ${process.env.PORT}`)
})
.catch((err)=>{
    console.log("mongo db connection failed0", err);
} )