import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pg from "pg"
import userRoutes from "./routes/userRoutes.js"
import projectRoutes from "./routes/projectRoutes.js"
import modelRoutes from "./routes/modelRoutes.js"
import cookieParser from "cookie-parser"

const app = express()
dotenv.config()

const client = new pg.Client({
    connectionString: process.env.DB_URI
})

await client.connect()

app.use(express.json())
app.use(cors({
    origin: process.env.FRONTEND_URI,
    credentials: true 
}));
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.use("/api/user",       userRoutes)
app.use("/api/project",    projectRoutes)
app.use("/api/model",      modelRoutes)

app.listen(8080, () => console.log("Listening on port 8080"))

export { client, app }