import type { NextFunction, Request, Response } from 'express'
import { UpdateCompanyDto } from './companies.dto'
import { companiesService } from './companies.service'

export const companiesController = {
	async getCurrent(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await companiesService.getCurrent(req.tenantCompanyId!)
			res.json(result)
		} catch (error) {
			next(error)
		}
	},
	async updateCurrent(req: Request, res: Response, next: NextFunction) {
		try {
			const data = (req.validated ?? req.body) as UpdateCompanyDto
			const result = await companiesService.updateCurrent(
				req.tenantCompanyId!,
				data
			)
			res.json(result)
		} catch (error) {
			next(error)
		}
	}
}
