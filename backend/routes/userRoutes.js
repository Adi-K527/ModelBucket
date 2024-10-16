import express from "express"
import { login, register, getProfile, updateProfile, createKey, getInfo } from "../controllers/userControllers.js"
import { secure } from "../middleware/auth.js"

const router = express.Router()

router.post("/login",     login)
router.post("/register",  register)

router.post("/createKey", secure,   createKey)

router.get("/profile",    secure,   getProfile)
router.get("/getinfo",    secure,   getInfo)
router.put("/profile",    secure,   updateProfile)

export default router