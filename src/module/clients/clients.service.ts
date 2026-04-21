import { Client, Prisma, Role } from '@prisma/client'
import { HttpError } from '../../lib/error'
import { prisma } from '../../lib/prisma'
import { ClientQuery } from '../../types/other'
import { CreateClientDto, UpdateClientDto } from './clients.dto'

const clientToApi = (item: Client) => ({
	id: item.id,
	name: item.name,
	industry: item.industry,
	contactEmail: item.contactEmail,
	phone: item.phone ?? '',
	managerId: item.managerId,
	companyId: item.companyId,
	status: item.status,
	monthlyValue: Number(item.monthlyValue),
	createdAt: item.createdAt.toISOString(),
	updatedAt: item.createdAt.toISOString()
})

export const clientService = {
	async create(params: {
		payload: CreateClientDto
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { payload, user, companyId } = params
		const managerId =
			user.role === 'MANAGER' ? user.id : (payload.managerId ?? user.id)

		const created = await prisma.client.create({
			data: {
				companyId,
				managerId,
				name: payload.name.trim(),
				industry: payload.industry.trim(),
				contactEmail: payload.contactEmail.trim(),
				phone: payload.phone?.trim() || null,
				status: payload.status,
				monthlyValue: payload.monthlyValue
			}
		})

		return clientToApi(created)
	},
	async list(params: {
		query: ClientQuery
		pagination: { skip: number; limit: number }
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { query, pagination, user, companyId } = params
		const isAdmin = user.role === 'ADMIN'

		const where: Prisma.ClientWhereInput = { companyId }

		if (!isAdmin) {
			where.managerId = user.id
		}

		if (query.status) {
			where.status = query.status
		}

		if (query.managerId && isAdmin) {
			where.managerId = query.managerId
		}

		if (query.dateFrom || query.dateTo) {
			where.createdAt = {}
			if (query.dateFrom) where.createdAt.gte = new Date(query.dateFrom)

			if (query.dateTo) where.createdAt.lte = new Date(query.dateTo)
		}

		if (query.search) {
			where.OR = [
				{
					name: {
						contains: query.search,
						mode: 'insensitive'
					}
				},
				{
					industry: {
						contains: query.search,
						mode: 'insensitive'
					}
				},
				{
					contactEmail: {
						contains: query.search,
						mode: 'insensitive'
					}
				}
			]
		}

		const [items, total] = await prisma.$transaction([
			prisma.client.findMany({
				where,
				skip: pagination.skip,
				take: pagination.limit,
				orderBy: {
					createdAt: 'desc'
				},
				include: {
					manager: {
						select: {
							id: true,
							fullName: true,
							email: true
						}
					}
				}
			}),
			prisma.client.count({ where })
		])

		return {
			items: items.map(client => ({
				id: client.id,
				name: client.name,
				industry: client.industry,
				contactEmail: client.contactEmail,
				phone: client.phone,
				status: client.status,
				monthlyValue: client.monthlyValue,
				companyId: client.companyId,
				managerId: client.managerId,
				manage: client.manager,
				createdAt: client.createdAt,
				updatedAt: client.updatedAt
			})),
			total
		}
	},
	async getById(params: {
		id: string
		user: { id: string; role: Role }
		companyId: string
	}) {
		const item = await prisma.client.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				...(params.user.role === 'MANAGER' ? { managerId: params.user.id } : {})
			}
		})

		if (!item) {
			throw HttpError(404, 'Пользователь не найден', 'CLIENT_NOT_FOUND')
		}

		return clientToApi(item)
	},

	async update(params: {
		id: string
		payload: UpdateClientDto
		user: {
			id: string
			role: Role
		}
		companyId: string
	}) {
		const { id, payload, user, companyId } = params
		const isAdmin = user.role === 'ADMIN'

		const existing = await prisma.client.findFirst({
			where: {
				id,
				companyId,
				...(isAdmin ? {} : { managerId: user.id })
			}
		})

		if (!existing) {
			throw HttpError(404, 'Пользователь не найден', 'CLIENT_NOT_FOUND')
		}

		const data: Prisma.ClientUpdateInput = {}

		if (payload.name) {
			data.name = payload.name.trim()
		}

		if (payload.industry) {
			data.industry = payload.industry.trim()
		}

		if (payload.contactEmail) {
			data.contactEmail = payload.contactEmail.trim()
		}

		if (payload.phone !== undefined) {
			data.phone = payload.phone.trim() || null
		}

		if (payload.status) {
			data.status = payload.status
		}

		if (payload.monthlyValue !== undefined) {
			data.monthlyValue = payload.monthlyValue
		}

		if (payload.managerId && isAdmin) {
			data.manager = {
				connect: {
					id: payload.managerId
				}
			}
		}

		const updated = await prisma.client.update({
			where: {
				id: existing.id
			},
			data
		})

		return clientToApi(updated)
	},
	async remove(params: {
		id: string
		user: {
			id: string
			role: Role
		}
		companyId: string
	}) {
		const existing = await prisma.client.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				...(params.user.role === 'MANAGER'
					? {
							managerId: params.user.id
						}
					: {})
			}
		})

		if (!existing) {
			throw HttpError(404, 'Пользователь не найден', 'CLIENT_NOT_FOUND')
		}

		await prisma.client.delete({ where: { id: existing.id } })
	}
}
