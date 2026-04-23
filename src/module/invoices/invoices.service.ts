import { Invoice, InvoiceStatus, Prisma, Role } from '@prisma/client'

import { HttpError } from '../../lib/error'
import { prisma } from '../../lib/prisma.js'
import { CreateInvoiceDto, UpdateInvoiceDto } from './invoices.dto.js'

export type ListInvoicesQuery = {
	search?: string
	status?: InvoiceStatus
	clientId?: string
	managerId?: string
	issuedFrom?: string
	issuedTo?: string
	dueFrom?: string
	dueTo?: string
	sortBy?: 'createdAt' | 'updatedAt' | 'issuedAt' | 'dueDate' | 'amount'
	sortOrder?: 'asc' | 'desc'
}

const invoiceToApi = (item: Invoice) => ({
	id: item.id,
	clientId: item.clientId,
	amount: Number(item.amount),
	status: item.status,
	dueDate: item.dueDate.toISOString(),
	issuedAt: item.issuedAt.toISOString(),
	createdAt: item.createdAt.toISOString(),
	updatedAt: item.updatedAt.toISOString()
})

const managerClientScope = (user: { id: string; role: Role }) =>
	user.role === 'MANAGER' ? { client: { managerId: user.id } } : {}

export const invoicesService = {
	async create(params: {
		payload: CreateInvoiceDto
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { payload, user, companyId } = params
		const client = await prisma.client.findFirst({
			where: {
				id: payload.clientId,
				companyId,
				...(user.role === 'MANAGER' ? { managerId: user.id } : {})
			}
		})

		if (!client) {
			throw {
				statusCode: 404,
				code: 'CLIENT_NOT_FOUND',
				message: 'Клиент для выставления счета не найден'
			}
		}

		const created = await prisma.invoice.create({
			data: {
				companyId,
				clientId: payload.clientId,
				amount: payload.amount,
				status: payload.status,
				dueDate: new Date(payload.dueDate),
				issuedAt: new Date(payload.issuedAt)
			}
		})

		return invoiceToApi(created)
	},

	async list(params: {
		query: ListInvoicesQuery
		pagination: { skip: number; limit: number }
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { query, pagination, user, companyId } = params

		const and: Prisma.InvoiceWhereInput[] = [{ companyId }]

		if (user.role === 'MANAGER') {
			and.push({ client: { is: { managerId: user.id } } })
		}

		if (query.status) {
			and.push({ status: query.status })
		}

		if (query.clientId) {
			and.push({ clientId: query.clientId })
		}

		if (query.managerId && user.role === 'ADMIN') {
			and.push({ client: { is: { managerId: query.managerId } } })
		}

		if (query.issuedFrom || query.issuedTo) {
			and.push({
				issuedAt: {
					...(query.issuedFrom ? { gte: new Date(query.issuedFrom) } : {}),
					...(query.issuedTo ? { lte: new Date(query.issuedTo) } : {})
				}
			})
		}

		if (query.dueFrom || query.dueTo) {
			and.push({
				dueDate: {
					...(query.dueFrom ? { gte: new Date(query.dueFrom) } : {}),
					...(query.dueTo ? { lte: new Date(query.dueTo) } : {})
				}
			})
		}

		if (query.search) {
			and.push({
				client: {
					is: {
						name: { contains: query.search, mode: 'insensitive' }
					}
				}
			})
		}

		const where: Prisma.InvoiceWhereInput = { AND: and }

		const sortBy = query.sortBy ?? 'issuedAt'
		const sortOrder = query.sortOrder ?? 'desc'

		const [items, total] = await prisma.$transaction([
			prisma.invoice.findMany({
				where,
				skip: pagination.skip,
				take: pagination.limit,
				orderBy: {
					[sortBy]: sortOrder
				} as Prisma.InvoiceOrderByWithRelationInput
			}),
			prisma.invoice.count({ where })
		])

		return { items: items.map(invoiceToApi), total }
	},

	async getById(params: {
		id: string
		user: { id: string; role: Role }
		companyId: string
	}) {
		const item = await prisma.invoice.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				...managerClientScope(params.user)
			}
		})

		if (!item) {
			throw HttpError(404, 'Счет не найден', 'INVOICE_NOT_FOUND')
		}

		return invoiceToApi(item)
	},

	async update(params: {
		id: string
		payload: UpdateInvoiceDto
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { id, payload, user, companyId } = params

		const existing = await prisma.invoice.findFirst({
			where: {
				id,
				companyId,
				...managerClientScope(user)
			}
		})

		if (!existing) {
			throw HttpError(404, 'Счет не найден', 'INVOICE_NOT_FOUND')
		}

		const data: Prisma.InvoiceUpdateInput = {}

		if (payload.clientId) {
			data.client = { connect: { id: payload.clientId } }
		}

		if (payload.amount !== undefined) {
			data.amount = payload.amount
		}

		if (payload.status) {
			data.status = payload.status
		}

		if (payload.dueDate) {
			data.dueDate = new Date(payload.dueDate)
		}

		if (payload.issuedAt) {
			data.issuedAt = new Date(payload.issuedAt)
		}

		const updated = await prisma.invoice.update({
			where: { id: existing.id },
			data
		})

		return invoiceToApi(updated)
	},

	async remove(params: {
		id: string
		user: { id: string; role: Role }
		companyId: string
	}) {
		const existing = await prisma.invoice.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				...managerClientScope(params.user)
			}
		})

		if (!existing) {
			throw HttpError(404, 'Счет не найден', 'INVOICE_NOT_FOUND')
		}

		await prisma.invoice.delete({ where: { id: existing.id } })
	}
}
