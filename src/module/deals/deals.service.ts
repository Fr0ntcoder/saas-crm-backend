import { Deal, DealSource, DealStage, Prisma, Role } from '@prisma/client'
import { HttpError } from '../../lib/error'
import { prisma } from '../../lib/prisma'
import { CreateDealDto, UpdateDealDto } from './deals.dto'

export type ListDealsQuery = {
	search?: string
	stage?: DealStage
	source?: DealSource
	managerId?: string
	clientId?: string
	dateFrom?: string
	dateTo?: string
	sortBy?: 'createdAt' | 'updatedAt' | 'amount' | 'title'
	sortOrder?: 'asc' | 'desc'
}

const dealToApi = (item: Deal) => ({
	id: item.id,
	title: item.title,
	clientId: item.clientId,
	stage: item.stage,
	amount: Number(item.amount),
	managerId: item.managerId,
	source: item.source,
	updateAt: item.updatedAt.toISOString(),
	createdAt: item.createdAt.toISOString()
})

export const dealsService = {
	async create(params: {
		data: CreateDealDto
		user: {
			id: string
			role: Role
		}
		companyId: string
	}) {
		const { data, user, companyId } = params
		const managerId =
			user.role === 'MANAGER' ? user.id : (data.managerId ?? user.id)

		const isRole = user.role === 'MANAGER' ? { managerId: user.id } : {}

		const client = await prisma.client.findFirst({
			where: {
				id: data.clientId,
				companyId,
				isRole
			}
		})

		if (!client) {
			throw HttpError(
				404,
				'Клиент с такой компанией не найден',
				'CLIENT_NOT_FOUND'
			)
		}

		const created = await prisma.deal.create({
			data: {
				companyId,
				managerId,
				clientId: data.clientId,
				title: data.title.trim(),
				stage: data.stage,
				amount: data.amount,
				source: data.source
			}
		})

		return dealToApi(created)
	},
	async list(params: {
		query: ListDealsQuery
		pagination: {
			skip: number
			limit: number
		}
		user: {
			id: string
			role: Role
		}
		companyId: string
	}) {
		const { query, pagination, user, companyId } = params

		const isAdmin = user.role === 'ADMIN'

		const where: Prisma.DealWhereInput = { companyId }

		if (isAdmin) {
			where.managerId = user.id
		}

		if (query.stage) {
			where.stage = query.stage
		}

		if (query.source) {
			where.source = query.source
		}

		if (query.managerId && isAdmin) {
			where.managerId = query.managerId
		}

		if (query.clientId) {
			where.clientId = query.clientId
		}

		if (query.dateFrom || query.dateTo) {
			where.createdAt = {}
			if (query.dateFrom) {
				where.createdAt.gte = new Date(query.dateFrom)
			}
			if (query.dateTo) {
				where.createdAt.lte = new Date(query.dateTo)
			}
		}

		if (query.search) {
			where.OR = [
				{ title: { contains: query.search, mode: 'insensitive' as const } },
				{
					client: {
						name: { contains: query.search, mode: 'insensitive' as const }
					}
				}
			]
		}

		const sortBy = query.sortBy ?? 'updatedAt'
		const sortOrder = query.sortOrder ?? 'desc'

		const [items, total] = await prisma.$transaction([
			prisma.deal.findMany({
				where,
				skip: pagination.skip,
				take: pagination.limit,
				orderBy: {
					[sortBy]: sortOrder
				}
			}),
			prisma.deal.count({ where })
		])

		return {
			items: items.map(dealToApi),
			total
		}
	},
	async getById(params: {
		id: string
		user: {
			id: string
			role: Role
		}
		companyId: string
	}) {
		const isRole =
			params.user.role === 'MANAGER'
				? {
						managerId: params.user.id
					}
				: {}

		const item = await prisma.deal.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				isRole
			}
		})

		if (!item) {
			throw HttpError(404, 'Сделка не найдена', 'DEAL_NOT_FOUND')
		}

		return dealToApi(item)
	},
	async update(params: {
		id: string
		payload: UpdateDealDto
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { id, payload, user, companyId } = params
		const isAdmin = user.role === 'ADMIN'

		const existing = await prisma.deal.findFirst({
			where: {
				id,
				companyId,
				...(isAdmin ? {} : { managerId: user.id })
			}
		})

		if (!existing) {
			throw {
				statusCode: 404,
				code: 'DEAL_NOT_FOUND',
				message: 'Deal not found'
			}
		}

		const data: Prisma.DealUpdateInput = {}

		if (payload.title) data.title = payload.title.trim()
		if (payload.stage) data.stage = payload.stage
		if (payload.amount !== undefined) data.amount = payload.amount
		if (payload.source) data.source = payload.source

		if (payload.clientId) {
			data.client = { connect: { id: payload.clientId } }
		}

		if (payload.managerId && isAdmin) {
			data.manager = { connect: { id: payload.managerId } }
		}

		const updated = await prisma.deal.update({
			where: { id: existing.id },
			data
		})

		return dealToApi(updated)
	},
	async remove(params: {
		id: string
		user: { id: string; role: Role }
		companyId: string
	}) {
		const isRole =
			params.user.role === 'MANAGER' ? { managerId: params.user.id } : {}
		const existing = await prisma.deal.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				isRole
			}
		})

		if (!existing) {
			throw {
				statusCode: 404,
				code: 'DEAL_NOT_FOUND',
				message: 'Deal not found'
			}
		}

		await prisma.deal.delete({ where: { id: existing.id } })
	}
}
