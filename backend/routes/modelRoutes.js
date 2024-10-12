import express from "express"
import { getModels, createModel, updateModel, deployModel, terminateModel, deleteModel, uploadPreprocessor, uploadEvalData, getModel } from "../controllers/modelControllers.js"
import { secure } from "../middleware/auth.js"
import multer from "multer"

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

router.get("/",             secure,   getModels)
router.get("/:project_id/:model_id",  secure,   getModel)
router.post("/create",      secure,   createModel)
router.put("/update",       secure,   updateModel)
router.put("/terminate",    secure,   terminateModel)
router.delete("/delete",    secure,   deleteModel)

router.post("/deploy",       upload.fields([{ name: 'model' }, { name: 'dependencies' }]), secure,   deployModel)
router.post("/preprocessor", upload.fields([{ name: 'preprocessor' }]),                    secure,   uploadPreprocessor)
router.post("/eval",         upload.fields([{ name: 'X_eval' }, { name: 'Y_eval' }]),      secure,   uploadEvalData)

export default router