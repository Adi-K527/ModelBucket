import express from "express"
import { getModels, createModel, updateModel, deployModel, terminateModel, deleteModel } from "../controllers/modelControllers.js"
import { secure } from "../middleware/auth.js"
import multer from "multer"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/",           secure,   getModels)
router.post("/create",    secure,   createModel)
router.put("/update",     secure,   updateModel)
router.put("/terminate",  secure,   terminateModel)
router.delete("/delete",  secure,   deleteModel)

router.post("/deploy",    upload.fields([{ name: 'model' }, { name: 'dependencies' }]), secure,   deployModel)

export default router