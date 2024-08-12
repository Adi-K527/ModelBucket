import { client } from "../server.js"
import jwt from "jsonwebtoken"

const getProjects = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)

        const response = await client.query(
            `SELECT * FROM users_project 
             INNER JOIN project ON users_project.project_id = project.id 
             WHERE users_project.user_id = $1 
             AND (users_project.status = 'MEMBER' OR users_project.status = 'OWNER')`, 
            [id]
        )
    
        res.status(200).json({"projects": response.rows})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}


const getProject = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {project_id} = req.params

        const response = await client.query(
            `SELECT * FROM users_project 
             INNER JOIN project ON users_project.project_id = project.id 
             WHERE users_project.user_id = $1 
             AND (users_project.status = 'MEMBER' OR users_project.status = 'OWNER')
             AND users_project.project_id = $2`, 
            [id, project_id]
        )

        if (response.rows.length > 0) {
            const projectRes = await client.query(
                `SELECT * FROM project
                 LEFT JOIN model ON model.project_id = project.id
                 WHERE project.id = $1`,
                [project_id]
            )

            const modelRes = await client.query(
                `SELECT * FROM model
                 WHERE model.project_id = $1`,
                [project_id]
            )

            const userRes = await client.query(
                `SELECT * FROM users_project
                 INNER JOIN users ON users_project.user_id = users.id
                 WHERE users_project.project_id = $1`,
                [project_id]
            )

            res.status(200).json({"projectData": projectRes.rows, "modelData": modelRes.rows, "userData": userRes.rows})
        }
        else {
            res.status(400).json({"error": "Project not found"})
        }
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}


const createProject = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {projectname} = req.body
    
        const projectRes = await client.query(
            "INSERT INTO project (projectname, user_id) VALUES ($1, $2) RETURNING id",
            [projectname, id]
        )
    
        const projectId = projectRes.rows[0].id
        await client.query(
            "INSERT INTO users_project (user_id, project_id, status) VALUES ($1, $2, $3)",
            [id, projectId, "OWNER"]
        )
    
        res.status(200).json({"message": "successfully inserted"})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

const updateProjectName = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {project_id, project_name} = req.body
    
        const projectAvailable = await client.query(
            "SELECT * FROM users_project WHERE user_id = $1 AND project_id = $2",
            [id, project_id]
        )

        if (projectAvailable.rows.length > 0) {
            await client.query(
                "UPDATE project SET projectname = $1 WHERE id = $2",
                [project_name, project_id]
            )

            res.status(200).json({"message": "successfully updated name"})
        }
        else {
            res.status(400).json({"error": "Project not found"})
        }    
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}


const addUserPending = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {project_id} = req.body

        await client.query(
            "INSERT INTO users_project (user_id, project_id, status) VALUES ($1, $2, $3)",
            [id, project_id, "PENDING"]
        )

        res.status(200).json({"message": "request pending"})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}


const addUserMember = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)
        const {project_id, user_id} = req.body
        
        const projectPresent = await client.query(
            "SELECT user_id FROM users_project WHERE user_id = $1 AND project_id = $2 AND status = $3",
            [id, project_id, "OWNER"]
        )

        if (projectPresent.rows.length > 0) {
            await client.query(
                "UPDATE users_project SET status = $1 WHERE user_id = $2",
                ["MEMBER", user_id]
            )

            res.status(200).json({"message": "Added user successfully"})
        }
        else {
            res.status(400).json({"error": "Insufficient permissions"})
        }
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}


export { getProjects, createProject, updateProjectName, addUserPending, addUserMember, getProject }