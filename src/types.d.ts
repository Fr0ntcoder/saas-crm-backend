import { Role } from '@prisma/client'
import 'express'

declare global {
	namespace Express {
		interface Request {
			user?: {
				id: string
				companyId: string
				role: Role
			}
			tenantCompanyId?: string
			pagination?: {
				page: number
				limit: number
				skip: number
			}
			validated?: unknown
		}
	}
}

export {}
