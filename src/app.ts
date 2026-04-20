import cors from 'cors'
import express from 'express'
import { env } from './config/env.config'
export const app = express()

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(express.json())
