import { Role } from '@prisma/client'
import { z } from 'zod'

export const updateMeDto = z.object({
	fullName: z.string().min(2).max(120)
})

export const teamQueryDto = z.object({
	search: z.string().optional(),
	role: z.enum(Role).optional(),
	sortBy: z.enum(['createdAt', 'fullName']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
})

export type UpdateMeDto = z.infer<typeof updateMeDto>
export type TeamQueryDto = z.infer<typeof teamQueryDto>
