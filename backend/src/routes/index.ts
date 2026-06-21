import express, { type Request, type Response } from "express";
import ragRoutes from "./ragRoutes.js"
import userRoutes from "./userRoutes.js"
const router = express.Router();


router.use("/rag",ragRoutes)
router.use("/user",userRoutes)
router.use("/",(req:Request,res:Response)=>{
    res.send("This is response from Router")
})



export default router