import type { NextFunction, Request, Response } from 'express'
import { CreateDealDto, UpdateDealDto } from './deals.dto'
import { dealsService, ListDealsQuery } from './deals.service'

export const dealsController = {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const data = (req.validated ?? req.body) as CreateDealDto
			const result = await dealsService.create({
				data,
				user: req.user!,
				companyId: req.tenantCompanyId!
			})
			res.status(201).json(result)
		} catch (error) {
			next(error)
		}
	},

	async list(req: Request, res: Response, next: NextFunction) {
		try {
			const query = (req.validated ?? req.query) as ListDealsQuery
			const result = await dealsService.list({
				query,
				pagination: req.pagination!,
				user: req.user!,
				companyId: req.tenantCompanyId!
			})
			res.json({ items: result.items, meta: result.total })
		} catch (error) {
			next(error)
		}
	},

	async getById(
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction
	) {
		try {
			const result = await dealsService.getById({
				id: req.params.id,
				user: req.user!,
				companyId: req.tenantCompanyId!
			})
			res.json(result)
		} catch (error) {
			next(error)
		}
	},

	async update(
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction
	) {
		try {
			const payload = (req.validated ?? req.body) as UpdateDealDto
			const result = await dealsService.update({
				id: req.params.id,
				payload,
				user: req.user!,
				companyId: req.tenantCompanyId!
			})
			res.json(result)
		} catch (error) {
			next(error)
		}
	},

	async remove(
		req: Request<{ id: string }>,
		res: Response,
		next: NextFunction
	) {
		try {
			await dealsService.remove({
				id: req.params.id,
				user: req.user!,
				companyId: req.tenantCompanyId!
			})
			res.status(204).send()
		} catch (error) {
			next(error)
		}
	}
}
