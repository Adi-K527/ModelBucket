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

const tier1Deployment = async (id, secretAccessToken, project_id, model_data) => {
    const data = await fetch('https://api.github.com/repos/Adi-K527/ModelBucket/actions/workflows/deployTier1.yaml/dispatches', {
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
                "filename": id,
                "secrettoken": secretAccessToken,
                "project_id": project_id.rows[0].project_id,
                "model_id": model_data.rows[0].id
            }
        })
    });

    console.log(`6) - Triggered GA Workflow using params: filename=${id} secrettoken=${secretAccessToken} project_id=${project_id.rows[0].project_id} model_id=${model_data.rows[0].id}`)

    while (true) {
        const isPresent = await client.query(
            "SELECT state FROM model WHERE model_id = $1",
            [model_data.rows[0].model_id]
        )
        const state = isPresent.rows[0].state

        if (state !== "PENDING") {
            break
        }
        else {
            setTimeout(() => {}, 10000)
        }
    }
    console.log(`7) - Done waiting for model to not be pending anymore`)
    
}

const tier2Deployment = async (id, secretAccessToken, project_id, model_data) => {
    const data = await fetch('https://api.github.com/repos/Adi-K527/ModelBucket/actions/workflows/deployTier2.yaml/dispatches', {
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
                "filename": id,
                "secrettoken": secretAccessToken,
                "project_id": project_id.rows[0].project_id,
                "model_id": model_data.rows[0].id
            }
        })
    });
}

const deployModel = async (req, res) => {
    try {
        console.log("----------------DEPLOY MODEL LOGS-------------------")
        let {secretAccessToken, proj_name, model_name} = req.body
        let {model, dependencies} = req.files

        let user_id = ""
        const response = await client.query(
            "SELECT id FROM users WHERE secret_access_token = $1",
            [secretAccessToken]
        )
        user_id = response.rows[0].id

        console.log(`1) - Authenticated user: ${user_id} using secret token`)

        const project_id = await client.query(
            `SELECT project_id FROM users_project
             INNER JOIN project ON users_project.project_id = project.id
             WHERE project.projectname = $1 AND users_project.user_id = $2`,
            [proj_name, user_id]
        )

        if (project_id.rows.length < 1) {
            return res.status(400).json({"Error": "Unable to find model or project"})
        }

        console.log(`2) - Found project: ${project_id.rows[0].project_id} belonging to user`)

        const model_data = await client.query(
            "SELECT id, model_id, deploymenttype FROM model WHERE modelname = $1 AND project_id = $2",
            [model_name, project_id.rows[0].project_id]
        )

        if (model_data.rows.length < 1) {
            return res.status(400).json({"Error": "Unable to find model or project"})
        }

        console.log(`3) - Found model: ${model_data.rows[0].id} using secret token`)

        await fetch(process.env.VITE_BACKEND_URI + "/api/model/update", {
            method: "PUT",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify({
                "secretAccessToken": secretAccessToken,
                "project_id": project_id.rows[0].project_id, 
                "model_id": model_data.rows[0].id,
                "state": "PENDING"
            })
        })

        console.log(`4) - Updated model state to PENDING`)

        const id = model_data.rows[0].model_id

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

        console.log(`5) - Uploaded model and dependencies file to S3 bucket with filename: ${id}`)
    
        if (model_data.rows[0].deploymenttype == "TIER 1") {
            await tier1Deployment(id, secretAccessToken, project_id, model_data)
        }
        else {
            await tier2Deployment(id, secretAccessToken, project_id, model_data)
        }

        console.log(`----------------MODEL DEPLOYMENT FINISHED-------------------`)
        console.log("\n\n\n")

        res.status(200).json({"message": "deployment successful"})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    } 
}

const terminateModelWorkflow = async (workflow, model_id) => {
    let workflowName = ""
    if (workflow === "TIER 1") {
        workflowName = "Tier1"
    }
    else {
        workflowName = "Tier2"
    }
    await fetch(`https://api.github.com/repos/Adi-K527/ModelBucket/actions/workflows/terminate${workflowName}.yaml/dispatches`, {
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
                "model_id": model_id
            }
        })
    })
}

const terminateModel = async (req, res) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        const {id, username, email} = jwt.decode(token, process.env.JWT_SECRET)
        const {project_id, model_id} = req.body

        const modelIdData = await client.query(
            "SELECT model_id, deploymenttype FROM model WHERE id = $1 AND project_id = $2", 
            [model_id, project_id]
        )

        const modelExists = await client.query(
            "SELECT user_id FROM users_project WHERE user_id = $1 AND project_id = $2",
            [id, project_id]
        )

        if (modelExists.rows.length > 0) {
            let workflow = ""
            if (modelIdData.rows[0].deploymenttype === "TIER 1") {
                workflow = "Tier1"
            }
            else {
                workflow = "Tier2"
            }

            await terminateModelWorkflow(workflow, modelIdData.rows[0].model_id)

            await client.query(
                "UPDATE model SET state = 'STOPPED' WHERE id = $1",
                [model_id]
            )
        }
        else {
            res.status(400).json({"Error": "Model does not exist"})
        }
    }
    catch (error) {
        res.status(400).json({"Error": error})
    }
}

const deleteModel = async (req, res) => {
    try {
        console.log("---------------- DELETE MODEL -------------------")
        const token = req.headers.authorization.split(' ')[1]
        const {id, username, email} = jwt.decode(token, process.env.JWT_SECRET)
        const {project_id, model_id} = req.body

        console.log(project_id, model_id)

        const modelTypeData = await client.query(
            "SELECT state, deploymenttype, model_id FROM model WHERE id = $1 AND project_id = $2", 
            [model_id, project_id]
        )

        console.log(`1) - Retrieved model data: \n`)
        console.log(modelTypeData.rows[0])

        if (modelTypeData.rows[0].state === "ACTIVE") {
            console.log(`2) - Triggering termination workflow with params: ${modelTypeData.rows[0].deploymenttype}, ${modelTypeData.rows[0].model_id}`)
            await terminateModelWorkflow(modelTypeData.rows[0].deploymenttype, modelTypeData.rows[0].model_id)
        }

        await s3.deleteObject({Bucket: "mb-bucket-5125", Key: `models/${modelTypeData.rows[0].model_id}.joblib`}).promise()
        await s3.deleteObject({Bucket: "mb-bucket-5125", Key: `dependencies/${modelTypeData.rows[0].model_id}` }).promise()

        await client.query(
            "DELETE FROM model WHERE id = $1",
            [model_id]
        )

        res.status(200).json({"message": "Model deleted successfully"})
    }
    catch (error) {
        res.status(400).json({"Error": error})
    }
}


export {getModels, createModel, updateModel, deployModel, terminateModel, deleteModel}