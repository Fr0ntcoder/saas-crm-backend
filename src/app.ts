import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.config'
import { errorHandler } from './middlewares/error-handler'
import authRouter from './module/auth/auth.routes'
export const app = express()

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRouter)

app.use(errorHandler)
