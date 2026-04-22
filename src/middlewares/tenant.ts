import { NextFunction, Request, Response } from 'express'

export const tenantMiddleware = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	if (!req.user?.companyId) {
		next({
			statusCode: 401,
			message: 'Нужен ID компании',
			code: 'UNAUTHORIZED'
		})
		return
	}

	req.tenantCompanyId = req.user?.companyId
	next()
}
