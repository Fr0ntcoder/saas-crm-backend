import type { Request } from 'express'
export const listMeta = (req: Request, total: number) => {
	const pagination = req.pagination ?? { page: 1, limit: 20, skip: 0 }

	return {
		page: pagination.page,
		limit: pagination.limit,
		total,
		totalPages: Math.max(1, Math.ceil(total / pagination.limit))
	}
}
