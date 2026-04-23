import { InvoiceStatus } from '@prisma/client'
import { z } from 'zod'

export const isoOrDateOnly = z.union([
	z.iso.datetime(),
	z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
])

export const createInvoiceDto = z.object({
	clientId: z.string().uuid(),
	amount: z.coerce.number().nonnegative(),
	status: z.enum(InvoiceStatus),
	dueDate: isoOrDateOnly,
	issuedAt: isoOrDateOnly
})

export const updateInvoiceDto = createInvoiceDto
	.partial()
	.refine(data => Object.keys(data).length > 0, {
		message: 'Заполните хотя бы одно поле'
	})

export const listInvoicesDto = z.object({
	search: z.string().optional(),
	status: z.enum(InvoiceStatus).optional(),
	clientId: z.string().uuid().optional(),
	managerId: z.string().uuid().optional(),
	issuedFrom: isoOrDateOnly.optional(),
	issuedTo: isoOrDateOnly.optional(),
	dueFrom: isoOrDateOnly.optional(),
	dueTo: isoOrDateOnly.optional(),
	sortBy: z
		.enum(['createdAt', 'updatedAt', 'issuedAt', 'dueDate', 'amount'])
		.optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
})

export type CreateInvoiceDto = z.infer<typeof createInvoiceDto>
export type UpdateInvoiceDto = z.infer<typeof updateInvoiceDto>
export type ListInvoicesDto = z.infer<typeof listInvoicesDto>
