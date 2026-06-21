import express from "express"
import { register, login, getMe } from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", authenticateToken as any, getMe as any)

export default router;