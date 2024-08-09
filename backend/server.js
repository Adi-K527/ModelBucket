import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import pg from "pg"
import userRoutes from "./routes/userRoutes.js"
import deploymentRoutes from "./routes/deploymentRoutes.js"

const app = express()
dotenv.config()


const client = new pg.Client({
    connectionString: process.env.DB_URI
})

client.connect()
  .then(() => console.log('Connected to the database'))
  .catch((err) => console.error('Database connection error', err.stack));


app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended: false}))


app.use("/api/user", userRoutes)
app.use("/api/deployment", deploymentRoutes)

app.listen(3000, () => console.log("Listening on port 3000"))

export { client }