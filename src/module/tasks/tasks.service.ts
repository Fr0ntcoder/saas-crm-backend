import { Prisma, Role, Task, TaskPriority, TaskStatus } from '@prisma/client'
import { HttpError } from '../../lib/error'
import { prisma } from '../../lib/prisma'
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto'

export type ListTasksQuery = {
	search?: string
	status?: TaskStatus
	priority?: TaskPriority
	managerId?: string
	clientId?: string
	dealId?: string
	dueFrom?: string
	dueTo?: string
	sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority'
	sortOrder?: 'asc' | 'desc'
}

const taskToApi = (item: Task) => ({
	id: item.id,
	title: item.title,
	status: item.status,
	priority: item.priority,
	dueDate: item.dueDate.toISOString(),
	managerId: item.managerId,
	clientId: item.clientId,
	dealId: item.dealId,
	createdAt: item.createdAt.toISOString(),
	updatedAt: item.updatedAt.toISOString()
})

export const tasksService = {
	async create(params: {
		payload: CreateTaskDto
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { payload, user, companyId } = params
		const managerId =
			user.role === 'MANAGER' ? user.id : (payload.managerId ?? user.id)

		if (payload.clientId) {
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
					message: 'Клиент компании не найден'
				}
			}
		}

		if (payload.dealId) {
			const deal = await prisma.deal.findFirst({
				where: {
					id: payload.dealId,
					companyId,
					...(user.role === 'MANAGER' ? { managerId: user.id } : {})
				}
			})
			if (!deal) {
				throw HttpError(
					404,
					'Сделка не найдена для этой компании',
					'DEAL_NOT_FOUND'
				)
			}
		}

		const created = await prisma.task.create({
			data: {
				companyId,
				managerId,
				clientId: payload.clientId ?? null,
				dealId: payload.dealId ?? null,
				title: payload.title.trim(),
				status: payload.status,
				priority: payload.priority,
				dueDate: new Date(payload.dueDate)
			}
		})

		return taskToApi(created)
	},

	async list(params: {
		query: ListTasksQuery
		pagination: { skip: number; limit: number }
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { query, pagination, user, companyId } = params
		const isAdmin = user.role === 'ADMIN'

		const where: Prisma.TaskWhereInput = { companyId }

		if (!isAdmin) {
			where.managerId = user.id
		}

		if (query.status) {
			where.status = query.status
		}

		if (query.priority) {
			where.priority = query.priority
		}

		if (query.managerId && isAdmin) {
			where.managerId = query.managerId
		}

		if (query.clientId) {
			where.clientId = query.clientId
		}

		if (query.dealId) {
			where.dealId = query.dealId
		}

		if (query.dueFrom || query.dueTo) {
			where.dueDate = {}
			if (query.dueFrom) where.dueDate.gte = new Date(query.dueFrom)
			if (query.dueTo) where.dueDate.lte = new Date(query.dueTo)
		}

		if (query.search) {
			where.OR = [
				{ title: { contains: query.search, mode: 'insensitive' } },
				{
					client: {
						is: { name: { contains: query.search, mode: 'insensitive' } }
					}
				},
				{
					deal: {
						is: { title: { contains: query.search, mode: 'insensitive' } }
					}
				}
			]
		}

		const sortBy = query.sortBy ?? 'createdAt'
		const sortOrder = query.sortOrder ?? 'desc'

		const [items, total] = await prisma.$transaction([
			prisma.task.findMany({
				where,
				skip: pagination.skip,
				take: pagination.limit,
				orderBy: { [sortBy]: sortOrder } as Prisma.TaskOrderByWithRelationInput
			}),
			prisma.task.count({ where })
		])

		return { items: items.map(taskToApi), total }
	},

	async getById(params: {
		id: string
		user: { id: string; role: Role }
		companyId: string
	}) {
		const item = await prisma.task.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				...(params.user.role === 'MANAGER' ? { managerId: params.user.id } : {})
			}
		})

		if (!item) {
			throw HttpError(404, 'Задача не найдена', 'TASK_NOT_FOUND')
		}

		return taskToApi(item)
	},

	async update(params: {
		id: string
		payload: UpdateTaskDto
		user: { id: string; role: Role }
		companyId: string
	}) {
		const { id, payload, user, companyId } = params
		const isAdmin = user.role === 'ADMIN'

		const existing = await prisma.task.findFirst({
			where: {
				id,
				companyId,
				...(isAdmin ? {} : { managerId: user.id })
			}
		})

		if (!existing) {
			throw HttpError(404, 'Задача не найдена', 'TASK_NOT_FOUND')
		}

		const data: Prisma.TaskUpdateInput = {}

		if (payload.title) {
			data.title = payload.title.trim()
		}

		if (payload.status) {
			data.status = payload.status
		}

		if (payload.priority) {
			data.priority = payload.priority
		}

		if (payload.dueDate) {
			data.dueDate = new Date(payload.dueDate)
		}

		if (payload.clientId !== undefined) {
			data.client = payload.clientId
				? { connect: { id: payload.clientId } }
				: { disconnect: true }
		}

		if (payload.dealId !== undefined) {
			data.deal = payload.dealId
				? { connect: { id: payload.dealId } }
				: { disconnect: true }
		}

		if (payload.managerId && isAdmin) {
			data.manager = { connect: { id: payload.managerId } }
		}

		const updated = await prisma.task.update({
			where: { id: existing.id },
			data
		})

		return taskToApi(updated)
	},

	async remove(params: {
		id: string
		user: { id: string; role: Role }
		companyId: string
	}) {
		const existing = await prisma.task.findFirst({
			where: {
				id: params.id,
				companyId: params.companyId,
				...(params.user.role === 'MANAGER' ? { managerId: params.user.id } : {})
			}
		})

		if (!existing) {
			throw HttpError(404, 'Задача не найдена', 'TASK_NOT_FOUND')
		}

		await prisma.task.delete({ where: { id: existing.id } })
	}
}
