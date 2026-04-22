import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth'
import { validate } from '../../middlewares/validate'
import { authController } from './auth.controller'
import { loginDto, registerDto } from './auth.dto'

const authRouter = Router()

authRouter.post('/register', validate(registerDto), authController.register)
authRouter.post('/login', validate(loginDto), authController.login)
authRouter.post('/refresh', validate(registerDto), authController.refresh)
authRouter.post('/logout', validate(registerDto), authController.logout)

authRouter.get('/me', authMiddleware, authController.me)
export default authRouter
