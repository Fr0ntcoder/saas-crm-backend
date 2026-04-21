import type { NextFunction, Request, Response } from 'express'
import { LoginDto, RefreshDto, RegisterDto } from './auth.dto'
import { authService } from './auth.service'
export const authController = {
	async register(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as RegisterDto
			const result = await authService.register(payload)
			res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	},
	async login(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as LoginDto

			const result = await authService.login(payload)
			res.json(result)
		} catch (error) {
			next(error)
		}
	},
	async refresh(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as RefreshDto
			const token = payload.refreshToken ?? req.cookies?.refreshToken

			if (!token) {
				next({
					statusCode: 401,
					code: 'MISSING_REFRESH_TOKEN',
					message: 'Требуется токен обновления'
				})
				return
			}
		} catch (error) {
			next({
				statusCode: 401,
				code: 'INVALID_REFRESH_TOKEN',
				message: 'Токен обновления недействителен',
				details: error
			})
		}
	},
	async logout(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as RefreshDto
			const token = payload.refreshToken ?? req.cookies?.refreshToken

			if (!token) {
				res.status(204).send()
				return
			}

			await authService.logout(token)

			res.status(204).send()
		} catch (error) {
			next(error)
		}
	},
	async me(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await authService.me(req.user!.id)
			res.json(result)
		} catch (error) {
			next(error)
		}
	}
}
