import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.config'
import { authMiddleware } from './middlewares/auth'
import { errorHandler } from './middlewares/error-handler'
import { paginationMiddleware } from './middlewares/pagination'
import { tenantMiddleware } from './middlewares/tenant'
import authRouter from './module/auth/auth.routes'
import clientsRouter from './module/clients/clients.routes'
export const app = express()

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }))
app.use(helmet())
app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRouter)
app.use(
	'/api/clients',
	authMiddleware,
	tenantMiddleware,
	paginationMiddleware,
	clientsRouter
)
app.use(errorHandler)
