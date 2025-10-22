import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { setupAuthRoutes, setupGenreRoutes, setupBookRoutes } from "./routes/authGenre"
import { setupTransactionRoutes } from "./routes/transactions"

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())

setupAuthRoutes(app)
setupGenreRoutes(app)
setupBookRoutes(app)
setupTransactionRoutes(app)

export default app
