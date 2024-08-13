import jwt from "jsonwebtoken"
import { client } from "../server.js"

const secure = async (req, res, next) => {
    console.log(req)
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            const token = req.headers.authorization.split(' ')[1]

            const {id, username, email} = jwt.decode(token, process.env.JWT_SECRET)

            const response = await client.query(
                "SELECT id FROM users WHERE id = $1", 
                [id]
            )
    
            if (response.rows.length > 0) {
                next()
            }
            else {
                res.status(400).json({"error": "Invalid Credentials"})
            }
        }
        else if (req.body.secretAccessToken) {
            const response = await client.query(
                "SELECT id FROM users WHERE secret_access_token = $1",
                [req.body.secretAccessToken]
            )

            if (response.rows.length > 0) {
                next()
            }
            else {
                res.status(400).json({"error": "Invalid Credentials"})
            }
        }
        else {
            res.status(400).json({"error": "Invalid Credentials"})
        }
    }
    catch (error) {
        console.error(error)
        res.status(400).json({"error": "server error"})
    }
}

export { secure }