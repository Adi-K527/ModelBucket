import express from "express"
import { getProjects, createProject, updateProjectName, addUserPending, addUserMember, getProject } from "../controllers/projectControllers.js"
import { secure } from "../middleware/auth.js"

const router = express.Router()

router.get("/",              secure,   getProjects)
router.get("/:project_id",   secure,   getProject)
router.post("/create",       secure,   createProject)
router.put("/updateName",    secure,   updateProjectName)

router.post("/addUserPending",    secure,   addUserPending)
router.post("/addUserMember",     secure,   addUserMember)

export default router