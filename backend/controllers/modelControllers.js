import { client } from "../server.js"
import jwt from "jsonwebtoken"
import fetch from "node-fetch";


const deployTier1 = async (model_id, id) => {
    const data = await fetch('https://api.github.com/repos/Adi-K527/ModelBucket/actions/workflows/deploymodel.yaml/dispatches', {
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

    console.log(data.ok)
}


const getModels = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const {id, username, email} = jwt.decode(token, process.env.JWT_SECRET)
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
        const token = req.headers.authorization.split(' ')[1]
        const {id, username, email} = jwt.decode(token, process.env.JWT_SECRET)
        const {project_id, modelname, deploymentType} = req.body

        const response = await client.query(
            "SELECT user_id FROM users_project WHERE user_id = $1 AND project_id = $2",
            [id, project_id]
        )
    
        if (response.rows.length > 0) {
            await client.query(
                "INSERT INTO model (modelname, project_id, deploymenttype, state) VALUES ($1, $2, $3, $4)",
                [modelname, project_id, deploymentType, "INACTIVE"]
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

const updateModel = async (req, res) => {
    try {
        let token = ""
        let id = ""

        if (req.body.secretAccessToken) {
            token = req.body.secretAccessToken
            const response = await client.query(
                "SELECT id FROM users WHERE secret_access_token = $1",
                [token]
            )

            id = response.rows[0].id
        }
        else {
            token = req.headers.authorization.split(' ')[1]
            id  = jwt.decode(token, process.env.JWT_SECRET)
        }

        const {project_id, model_id} = req.body

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
                const attributes = Object.keys(req.body).sort()
                const values = []

                console.log(attributes)
        
                attributes.forEach(attribute => {
                    values.push(req.body[attribute])
                });

                let queryString = "UPDATE model SET"

                let i;
                let pos = 1

                const params = []
                for (i = 0; i < attributes.length; i++) {
                    if (["modelname", "deploymenttype", "model_url", "state"].includes(attributes[i])){    
                        console.log(attributes[i])
                        queryString += " " + attributes[i] + " = $" + (pos) + ","
                        params.push(values[i])
                        pos += 1
                    }
                }

                queryString = queryString.slice(0, queryString.length - 1)
                queryString += " WHERE id = $" + (pos) + " RETURNING *"

                const data = await client.query(queryString, [...params, model_id])
    
                res.status(200).json({"message": "model updated"})
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

    try {
        await deployTier1(model_id, id)
        res.status(200).json({"message": "deployment successful"})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    } 
}


export {getModels, createModel, updateModel, deployModel}