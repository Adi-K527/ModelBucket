import express from "express"
import {  } from "../controllers/projectControllers.js"
import { secure } from "../middleware/auth.js"

const router = express.Router()

router.get("/",           secure,   getProjects)
router.post("/create",    secure,   createProject)
router.put("/profile",    secure,   updateProfile)

export default router