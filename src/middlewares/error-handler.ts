import { NextFunction, Request, Response } from 'express'

type ApiError = {
	statusCode?: number
	code?: string
	message?: string
	details?: unknown
}

export const errorHandler = (
	error: ApiError,
	_req: Request,
	res: Response,
	_next: NextFunction
) => {
	const statusCode = error.statusCode ?? 500
	const code = error.code ?? 'INTERNAL_ERROR'
	const message = error.message ?? 'Ошибка сервера'

	res.status(statusCode).json({
		error: {
			code,
			message,
			details: error.details ?? null
		}
	})
}
