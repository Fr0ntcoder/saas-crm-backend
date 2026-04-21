import cors from 'cors'
import express from 'express'
import { env } from './config/env.config'
import authRouter from './module/auth/auth.routes'
export const app = express()

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRouter)
