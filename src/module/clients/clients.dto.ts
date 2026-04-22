import { ClientStatus } from '@prisma/client'
import z from 'zod'

export const createClientDto = z.object({
	name: z.string().min(2),
	industry: z.string().min(2),
	contactEmail: z.email({
		message: 'Введите email'
	}),
	phone: z.string().optional(),
	managerId: z.uuid().optional(),
	status: z.enum(ClientStatus),
	monthlyValue: z.coerce.number().nonnegative()
})

export const updateClientDto = createClientDto
	.partial()
	.refine(data => Object.keys(data).length > 0, {
		message: 'Заполните хоть одно поле'
	})

export const listClientsDto = z.object({
	search: z.string().optional(),
	status: z.enum(ClientStatus).optional(),
	managerId: z.uuid().optional(),
	dateFrom: z.iso.datetime().optional(),
	dateTo: z.iso.datetime().optional(),
	sortBy: z.enum(['createdAt', 'updatedAt', 'name', 'monthlyValue']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
})

export type CreateClientDto = z.infer<typeof createClientDto>
export type UpdateClientDto = z.infer<typeof updateClientDto>
export type ListClientDto = z.infer<typeof listClientsDto>
