import { DealSource, DealStage } from '@prisma/client'
import z from 'zod'

export const createDealDto = z.object({
	title: z.string().min(2),
	clientId: z.uuid(),
	stage: z.enum(DealStage),
	amount: z.coerce.number().nonnegative(),
	source: z.enum(DealSource),
	managerId: z.uuid().optional()
})

export const updateDealDto = createDealDto
	.partial()
	.refine(data => Object.keys(data).length > 0, {
		message: 'Введите хотя бы одно поле'
	})

export const listDealDto = z.object({
	search: z.string().optional(),
	stage: z.enum(DealStage).optional(),
	source: z.enum(DealSource).optional(),
	managerId: z.uuid().optional(),
	clientId: z.uuid().optional(),
	dateFrom: z.iso.datetime().optional(),
	dateTo: z.iso.datetime().optional(),
	sortBy: z.enum(['createdAt', 'updatedAt', 'amount', 'title']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
})

export type CreateDealDto = z.infer<typeof createDealDto>
export type UpdateDealDto = z.infer<typeof updateDealDto>
export type ListDealDto = z.infer<typeof listDealDto>
