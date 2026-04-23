import { Prisma, Role } from '@prisma/client'
import { HttpError } from '../../lib/error'
import { prisma } from '../../lib/prisma'
import { TeamQueryDto, UpdateMeDto } from './profiles.dto'

export const profilesService = {
	async me(userId: string) {
		const profile = await prisma.profile.findUnique({
			where: { id: userId },
			include: { company: true }
		})
		if (!profile) {
			throw HttpError(404, 'Профайл не найден', 'PROFILE_NOT_FOUND')
		}

		return {
			id: profile.id,
			email: profile.email,
			fullName: profile.fullName,
			role: profile.role,
			companyId: profile.companyId,
			companyName: profile.company.name
		}
	},

	async updateMe(userId: string, payload: UpdateMeDto) {
		const profile = await prisma.profile.update({
			where: { id: userId },
			data: { fullName: payload.fullName.trim() }
		})

		return {
			id: profile.id,
			email: profile.email,
			fullName: profile.fullName,
			role: profile.role,
			companyId: profile.companyId
		}
	},

	async listTeam(params: {
		userId: string
		role: Role
		companyId: string
		pagination: { skip: number; limit: number }
		query: TeamQueryDto
	}) {
		const { userId, role, companyId, pagination, query } = params
		const isAdmin = role === 'ADMIN'

		const where: Prisma.ProfileWhereInput = { companyId }

		if (!isAdmin) {
			where.id = userId
		}

		if (query.role) {
			where.role = query.role
		}

		if (query.search) {
			where.OR = [
				{ fullName: { contains: query.search, mode: 'insensitive' } },
				{ email: { contains: query.search, mode: 'insensitive' } }
			]
		}

		const sortBy: Prisma.ProfileOrderByWithRelationInput =
			query.sortBy === 'fullName'
				? { fullName: query.sortOrder ?? 'desc' }
				: { createdAt: query.sortOrder ?? 'desc' }

		const [items, total] = await prisma.$transaction([
			prisma.profile.findMany({
				where,
				skip: pagination.skip,
				take: pagination.limit,
				orderBy: sortBy
			}),
			prisma.profile.count({ where })
		])

		return {
			items: items.map(item => ({
				id: item.id,
				fullName: item.fullName,
				email: item.email,
				role: item.role,
				companyId: item.companyId,
				createdAt: item.createdAt.toISOString()
			})),
			total
		}
	}
}
