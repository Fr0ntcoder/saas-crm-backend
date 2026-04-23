import type { NextFunction, Request, Response } from 'express'
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto'
import { invoicesService, ListInvoicesQuery } from './invoices.service'

export const invoicesController = {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as CreateInvoiceDto
			const result = await invoicesService.create({
				payload,
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
			const query = (req.validated ?? req.query) as ListInvoicesQuery
			const result = await invoicesService.list({
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
			const result = await invoicesService.getById({
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
			const payload = (req.validated ?? req.body) as UpdateInvoiceDto
			const result = await invoicesService.update({
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
			await invoicesService.remove({
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
