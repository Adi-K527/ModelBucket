import express from "express"
import { getModels, createModel, updateModel, deployModel } from "../controllers/modelControllers.js"
import { secure } from "../middleware/auth.js"

const router = express.Router()

router.get("/",           secure,   getModels)
router.post("/create",    secure,   createModel)
router.put("/update",     secure,   updateModel)
router.post("/deploy",    secure,   deployModel)

export default router