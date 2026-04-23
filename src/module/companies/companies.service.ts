import { HttpError } from '../../lib/error'
import { prisma } from '../../lib/prisma'
import { UpdateCompanyDto } from './companies.dto'

export const companiesService = {
	async getCurrent(companyId: string) {
		const company = await prisma.company.findUnique({
			where: { id: companyId }
		})
		if (!company) {
			throw HttpError(404, 'Компания не найдена', 'COMPANY_NOT_FOUND')
		}

		return {
			id: company.id,
			name: company.name,
			ownerId: company.ownerId,
			createdAt: company.createdAt.toISOString(),
			updatedAt: company.updatedAt.toISOString()
		}
	},

	async updateCurrent(companyId: string, data: UpdateCompanyDto) {
		const company = await prisma.company.update({
			where: { id: companyId },
			data: { name: data.name.trim() }
		})

		return {
			id: company.id,
			name: company.name,
			ownerId: company.ownerId,
			createdAt: company.createdAt.toISOString(),
			updatedAt: company.updatedAt.toISOString()
		}
	}
}
