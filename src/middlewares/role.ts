import { Role } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
export const roleMiddleware =
	(...roles: Role[]) =>
	(req: Request, _res: Response, next: NextFunction) => {
		if (!req.user) {
			next({ statusCode: 401, code: 'UNAUTHORIZED', message: 'Неавторизован' })
			return
		}

		if (!roles.includes(req.user.role)) {
			next({ statusCode: 403, code: 'FORBIDDEN', message: 'Недостаточно прав' })
			return
		}

		next()
	}
