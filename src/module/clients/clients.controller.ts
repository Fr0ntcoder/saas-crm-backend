import type { NextFunction, Request, Response } from 'express'
import { listMeta } from '../../lib/list-meta'
import { CreateClientDto, ListClientDto, UpdateClientDto } from './clients.dto'
import { clientService } from './clients.service'

export const clientsController = {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as CreateClientDto
			const result = await clientService.create({
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
			const query = (req.validated ?? req.body) as ListClientDto
			const result = await clientService.list({
				query,
				pagination: req.pagination!,
				user: req.user!,
				companyId: req.tenantCompanyId!
			})

			res.json({ items: result.items, meta: listMeta(req, result.total) })
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
			const result = await clientService.getById({
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
			const payload = (req.validated ?? req.body) as UpdateClientDto
			const result = await clientService.update({
				id: req.params.id,
				user: req.user!,
				companyId: req.tenantCompanyId!,
				payload
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
			await clientService.remove({
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
