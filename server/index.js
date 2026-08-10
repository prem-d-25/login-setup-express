// server/index.js
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoutes from './routes/authRoutes.js'
import profileRoutes from './routes/userRoutes.js'
import { connectDB } from './config/db.js'
import chatWithBot from './routes/chatWithBotRoutes.js'

dotenv.config()


const app = express()

// --- Middleware stack (order matters!) ---

// CORS: tells browser which origin is allowed to call our API
app.use(cors({
  origin: process.env.CLIENT_URL, // e.g. http://localhost:5173
  credentials: true               // allows cookies to be sent cross-origin
}))

app.use(express.json())           // parse JSON request bodies
app.use(cookieParser())           // parsee cookies from request headers

// --- Routes ---
app.use('/api/auth', authRoutes)
app.use('/api/user', profileRoutes)
app.use('/api/chat', chatWithBot)

// --- Start ---
const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})