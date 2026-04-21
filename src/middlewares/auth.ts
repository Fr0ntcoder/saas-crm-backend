import type { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../config/jwt.config'

export const authMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const authHeader = req.headers.authorization

	if (!authHeader?.startsWith('Bearer ')) {
		next({
			statusCode: 401,
			code: 'UNAUTHORIZED',
			message: 'Отсутствует токен'
		})
		return
	}

	try {
		const token = authHeader.slice(7)
		const payload = verifyAccessToken(token)

		req.user = {
			id: payload.sub,
			companyId: payload.companyId,
			role: payload.role
		}
		next()
	} catch (error) {
		next({
			statusCode: 401,
			code: 'UNAUTHORIZED',
			message: 'Токен недействителен'
		})
	}
}
