import express from "express"
import { getModels, createModel, updateModelName, deployModel } from "../controllers/modelControllers.js"
import { secure } from "../middleware/auth.js"

const router = express.Router()

router.get("/",           secure,   getModels)
router.post("/create",    secure,   createModel)
router.put("/updateName", secure,   updateModelName)
router.post("/deploy",    secure,   deployModel)

export default router