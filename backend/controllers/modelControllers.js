import { client } from "../server.js"
import jwt from "jsonwebtoken"


const deployTier1 = async (model_id, id) => {
    try {
        await fetch('https://api.github.com/repos/Adi-K527/ModelBucket/actions/workflows/deploymodel.yaml/dispatches', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${process.env.GH_TOKEN}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ref: 'main',
                inputs: {
                    "filename": id
                }
            })
        });
    }
    catch (error) {
        console.error(error)
    }
}


const getModels = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {project_id} = req.body
    
        const response = await client.query(
            "SELECT user_id FROM users_project WHERE user_id = $1 AND project_id = $2",
            [id, project_id]
        )
    
        if (response.rows.length > 0) {
            const data = await client.query(
                "SELECT * FROM model WHERE project_id = $1",
                [project_id]
            )

            res.status(200).json({"data": data.rows})
        }
        else {
            res.status(400).json({"error": "project not found"})
        }
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

const createModel = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {project_id, model_name, deploymentType} = req.body

        const response = await client.query(
            "SELECT user_id FROM users_project WHERE user_id = $1 AND project_id = $2",
            [id, project_id]
        )
    
        if (response.rows.length > 0) {
            await client.query(
                "INSERT INTO model (modelname, project_id, deploymenttype) VALUES ($1, $2, $3)",
                [model_name, project_id, deploymentType]
            )

            res.status(200).json({"message": "model created"})
        }
        else {
            res.status(400).json({"error": "project not found"})
        }
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

const updateModelName = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {project_id, model_id, model_name} = req.body

        const response = await client.query(
            "SELECT user_id FROM users_project WHERE user_id = $1 AND project_id = $2",
            [id, project_id]
        )
    
        if (response.rows.length > 0) {
            const modelRes = await client.query(
                "SELECT id FROM model WHERE id = $1 AND project_id = $2",
                [model_id, project_id]
            )

            if (modelRes.rows.length > 0) {
                await client.query(
                    "UPDATE model SET modelname = $1",
                    [model_name]
                )
    
                res.status(200).json({"message": "model name updated"})
            }
            else {
                res.status(400).json({"error": "model not found"})
            }
        }
        else {
            res.status(400).json({"error": "project not found"})
        }
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

const deployModel = async (req, res) => {
    let {model_id, id} = req.body
    deployTier1(model_id, id)
}


export {getModels, createModel, updateModelName, deployModel}