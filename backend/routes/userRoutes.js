import express from "express"
import { login, register, getProfile, updateProfile } from "../controllers/userControllers.js"
import { secure } from "../middleware/auth.js"

const router = express.Router()

router.post("/login",     login)
router.post("/register",  register)

router.get("/profile",    secure,   getProfile)
router.put("/profile",    secure,   updateProfile)

export default router