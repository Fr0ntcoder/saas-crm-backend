import type { NextFunction, Request, Response } from 'express'

import { TeamQueryDto, UpdateMeDto } from './profiles.dto'
import { profilesService } from './profiles.service'

export const profilesController = {
	async me(req: Request, res: Response, next: NextFunction) {
		try {
			const result = await profilesService.me(req.user!.id)
			res.json(result)
		} catch (error) {
			next(error)
		}
	},

	async updateMe(req: Request, res: Response, next: NextFunction) {
		try {
			const payload = (req.validated ?? req.body) as UpdateMeDto
			const result = await profilesService.updateMe(req.user!.id, payload)
			res.json(result)
		} catch (error) {
			next(error)
		}
	},

	async listTeam(req: Request, res: Response, next: NextFunction) {
		try {
			const query = (req.validated ?? req.query) as TeamQueryDto
			const result = await profilesService.listTeam({
				userId: req.user!.id,
				role: req.user!.role,
				companyId: req.tenantCompanyId!,
				pagination: req.pagination!,
				query
			})

			res.json({
				items: result.items,
				meta: result.total
			})
		} catch (error) {
			next(error)
		}
	}
}
