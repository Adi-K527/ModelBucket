import { client } from "../server.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"


const getToken = async (id, username, email) => {
    return jwt.sign({id, username, email}, process.env.JWT_SECRET)
}

const login = async (req, res) => {
    const {username, password} = req.body

    if (!(username && password)) {
        res.status(400).json({"message": "Missing Required Field"})
    }

    try {
        const response = await client.query(
            "SELECT * FROM users WHERE username = $1", 
            [username]
        )

        if (response.rows.length > 0 && await bcrypt.compare(password, response.rows[0].password)) {
            const token = await getToken(response.rows[0].id, response.rows[0].username, response.rows[0].email)
            res.cookie("AUTH_TOKEN", token, {
                maxAge: 9000000,
                httpOnly: false,
                secure: false,
            });
    
            res.status(200).json({"message": "Authenticated"})
        }
        else {
            res.status(400).json({"error": "Invalid Credentials"})
        }
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

const register = async (req, res) => {
    const {username, password, email, name} = req.body

    if (!(username && password && email && name)) {
        res.status(400).json({"message": "Missing Required Field"})
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        const response = await client.query(
            "INSERT INTO users (username, password, email, name) VALUES ($1, $2, $3, $4) RETURNING *", 
            [username, hashedPassword, email, name]
        )

        const token = await getToken(response.rows[0].id, username, email)
        res.cookie("AUTH_TOKEN", token, {
            maxAge: 9000000,
            httpOnly: false,
            secure: false,
        });

        res.status(200).json({"message": response.rows})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

const getProfile = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)

        const response = await client.query(
            "SELECT * FROM project JOIN users_project ON project.id = users_project.project_id JOIN users ON users_project.user_id = users.id WHERE users.id = $1", 
            [id]
        )
    
        res.status(200).json({id, username, email, "data": response.rows})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

const updateProfile = async (req, res) => {
    try {
        const {id, username, email} = jwt.decode(req.cookies.AUTH_TOKEN, process.env.JWT_SECRET)

        const attributes = Object.keys(req.body)
        const values = []

        attributes.forEach(attribute => {
            values.push(req.body[attribute])
        });

        let queryString = "UPDATE users SET"
        
        let i;
        for (i = 0; i < attributes.length; i++) {
            if (["username", "password", "email", "name"].includes(attributes[i])){    
                queryString += " " + attributes[i] + " = $" + (i + 1) + ","
                if (attributes[i] == "password") {
                    values[i] = await bcrypt.hash(values[i], 10)
                }
            }
        }

        queryString = queryString.slice(0, queryString.length - 1)
        queryString += " WHERE id = $" + (i + 1) + " RETURNING *"

        const data = await client.query(queryString, [...values, id])


        const response = await client.query(
            "SELECT * FROM users WHERE id = $1", 
            [id]
        )

        const token = await getToken(response.rows[0].id, response.rows[0].username, response.rows[0].email)

        res.cookie("AUTH_TOKEN", token, {
            maxAge: 9000000,
            httpOnly: false,
            secure: false,
        })
    
        res.status(200).json({"data": data.rows})
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": error})
    }
}

export { login, register, getProfile, updateProfile }