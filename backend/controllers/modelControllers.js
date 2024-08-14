import { client, s3, lambda } from "../server.js"
import jwt from "jsonwebtoken"
import fetch from "node-fetch";
import { randomUUID } from "crypto";


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

        const model_id = randomUUID()

        const response = await client.query(
            "SELECT user_id FROM users_project WHERE user_id = $1 AND project_id = $2",
            [id, project_id]
        )
    
        if (response.rows.length > 0) {

            const nameExists = await client.query(
                "SELECT id FROM model WHERE project_id = $1 AND modelname = $2",
                [project_id, modelname]
            )

            if (nameExists.rows.length > 0) {
                return res.status(400).json({"error": "Name is already taken in the project"})
            }

            await client.query(
                "INSERT INTO model (modelname, project_id, deploymenttype, state, model_id) VALUES ($1, $2, $3, $4, $5)",
                [modelname, project_id, deploymentType, "INACTIVE", model_id]
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
    try {
        let {secretAccessToken, proj_name, model_name} = req.body
        let {model, dependencies} = req.files

        let user_id = ""
        const response = await client.query(
            "SELECT id FROM users WHERE secret_access_token = $1",
            [secretAccessToken]
        )
        user_id = response.rows[0].id

        const project_id = await client.query(
            `SELECT project_id FROM users_project
             INNER JOIN project ON users_project.project_id = project.id
             WHERE project.projectname = $1 AND users_project.user_id = $2`,
            [proj_name, user_id]
        )

        if (project_id.rows.length < 1) {
            return res.status(400).json({"Error": "Unable to find model or project"})
        }

        const model_id = await client.query(
            "SELECT id FROM model WHERE modelname = $1 AND project_id = $2",
            [model_name, project_id.rows[0].project_id]
        )

        if (model_id.rows.length < 1) {
            return res.status(400).json({"Error": "Unable to find model or project"})
        }

        await fetch(process.env.BACKEND_URL + "/api/model/update", {
            method: "PUT",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                "secretAccessToken": secretAccessToken,
                "project_id": project_id.rows[0].project_id, 
                "model_id": model_id.rows[0].id,
                "state": "PENDING"
            })
        })

        const id = randomUUID().toString()

        const uploadFile = (bucket, folder, key, body) => {
            return new Promise((resolve, reject) => {
                const params = {
                    Bucket: bucket,
                    Key: `${folder}/${key}`,
                    Body: body
                }

                s3.upload(params, (err, data) => {
                    if (err) {
                        return res.status(400).json({"error": err})
                    }
                    resolve(data)
                }) 
            })
        }

        await uploadFile("mb-bucket-5125", "models",       id + ".joblib", model[0].buffer)
        await uploadFile("mb-bucket-5125", "dependencies", id,             dependencies[0].buffer)
    
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

        let function_config = ""
        let function_url = ""

        while (true) {
            try {
                function_config = await lambda.getFunctionUrlConfig({FunctionName: id}).promise()
                function_url = function_config.FunctionUrl
                break
            }
            catch (error) {
                setTimeout(() => {}, 10000)
                continue
            }
        }


        await fetch(process.env.BACKEND_URL + "/api/model/update", {
            method: "PUT",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                "secretAccessToken": secretAccessToken,
                "project_id": project_id.rows[0].project_id, 
                "model_id": model_id.rows[0].id,
                "state": "ACTIVE",
                "model_url": function_url
            })
        })
        res.status(200).json({"message": "deployment successful"})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    } 
}


export {getModels, createModel, updateModel, deployModel}