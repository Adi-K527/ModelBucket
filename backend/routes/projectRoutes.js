import express from "express"
import {  } from "../controllers/projectControllers.js"
import { secure } from "../middleware/auth.js"

const router = express.Router()

router.post("/create",    createProject)
router.post("/register",  register)

router.get("/profile",    secure,   getProfile)
router.put("/profile",    secure,   updateProfile)

export default router