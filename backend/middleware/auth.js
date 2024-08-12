import jwt from "jsonwebtoken"
import { client } from "../server.js"

const secure = async (req, res, next) => {
    try {
        console.log(req.headers)
        if (req.headers.cookie.startsWith("Bearer")) {
            const token = req.headers.cookie.split(' ')[1]

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