import type { NextFunction, Request, Response } from 'express'
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto'
import { ListTasksQuery, tasksService } from './tasks.service'

export const tasksController = {
	async create(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as CreateTaskDto
			const result = await tasksService.create({
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
			const query = (req.validated ?? req.query) as ListTasksQuery
			const result = await tasksService.list({
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
			const result = await tasksService.getById({
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
			const payload = (req.validated ?? req.body) as UpdateTaskDto
			const result = await tasksService.update({
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
			await tasksService.remove({
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
