import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import Database from './config/db.js'
Database()
import scanRoutes from './routers/scan.routes.js';
import userRoutes from "./routers/user.routes.js";
import cors from 'cors'


const app=express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors({
    origin:process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials:true,
}))



app.use("/api/users", userRoutes);


app.use("/api/scan", scanRoutes);


app.all("*",(req,res,next)=>{
    let err=new Error("Page Not Found")
    err.statusCode=404
    next(err)
})

app.use((err,req,res,next)=>{
    let statusCode=err.statusCode || 500
    let message=err.message || "Something went wrong"
    return res.status(statusCode).json({message})
})


export default app