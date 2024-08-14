import express from "express"
import { getModels, createModel, updateModel, deployModel } from "../controllers/modelControllers.js"
import { secure } from "../middleware/auth.js"
import multer from "multer"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/",           secure,   getModels)
router.post("/create",    secure,   createModel)
router.put("/update",     secure,   updateModel)
router.post("/deploy",    upload.fields([{ name: 'model' }, { name: 'dependencies' }]), secure,   deployModel)

export default router