import { ClientStatus, Role } from '@prisma/client'

export type JwtPayload = {
	sub: string
	companyId: string
	role: Role
}

export type ClientQuery = {
	search?: string
	status?: ClientStatus
	managerId?: string
	dateFrom?: string
	dateTo?: string
	sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'monthlyValue'
	sortOrder?: 'asc' | 'desc'
}

export type Pagination = {
	page: number
	limit: number
	skip: number
}
