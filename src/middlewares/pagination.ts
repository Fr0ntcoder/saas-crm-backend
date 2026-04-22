import { NextFunction, Request, Response } from 'express'
import { Pagination } from '../types/other'

export const paginationMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const page = Math.max(1, Number(req.query.page ?? 1) || 1)
	const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20) || 20))
	const pag = req as Request & { pagination?: Pagination }

	pag.pagination = {
		page,
		limit,
		skip: (page - 1) * limit
	}

	next()
}
