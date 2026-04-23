import { z } from 'zod'

export const updateCompanyDto = z.object({
	name: z.string().min(2).max(120)
})

export type UpdateCompanyDto = z.infer<typeof updateCompanyDto>
