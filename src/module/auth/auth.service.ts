import bcrypt from 'bcryptjs'
import {
	refreshTokenExpiresAt,
	signAccessToken,
	signRefreshToken,
	verifyAccessToken,
	verifyRefreshToken
} from '../../config/jwt.config'

import { HttpError } from '../../lib/error'
import { comparePassword, hashPassword } from '../../lib/password'
import { prisma } from '../../lib/prisma'

import { Role } from '@prisma/client'
import { LoginDto, RegisterDto } from './auth.dto'

export type AuthProfile = {
	id: string
	companyId: string
	role: Role
}

const toAuthPayload = (profile: AuthProfile) => ({
	sub: profile.id,
	companyId: profile.companyId,
	role: profile.role
})

const tokensForProfile = async (profile: AuthProfile) => {
	const payload = toAuthPayload(profile)
	const accessToken = signAccessToken(payload)
	const refreshToken = signRefreshToken(payload)

	await prisma.refreshToken.create({
		data: {
			userId: profile.id,
			tokenHash: await hashPassword(refreshToken),
			expiresAt: refreshTokenExpiresAt()
		}
	})

	return { accessToken, refreshToken }
}

export const authService = {
	async register(payload: RegisterDto) {
		const existing = await prisma.user.findUnique({
			where: { email: payload.email }
		})

		if (existing) {
			throw HttpError(409, 'Пользователь уже существует', 'EMAIL_EXISTS')
		}

		const user = await prisma.user.create({
			data: {
				email: payload.email,
				password: await hashPassword(payload.password)
			}
		})

		const company = await prisma.company.create({
			data: {
				name: payload.company ?? `${payload.fullName} компания`,
				ownerId: user.id
			}
		})

		const profile = await prisma.profile.create({
			data: {
				id: user.id,
				userId: user.id,
				fullName: payload.fullName,
				email: payload.email,
				role: 'ADMIN',
				companyId: company.id
			}
		})

		const tokens = await tokensForProfile({
			id: profile.id,
			companyId: profile.companyId,
			role: profile.role
		})

		return {
			user: {
				id: profile.id,
				email: profile.email,
				fullName: profile.fullName,
				role: profile.role,
				companyId: profile.companyId
			},
			...tokens
		}
	},

	async login(payload: LoginDto) {
		const user = await prisma.user.findUnique({
			where: { email: payload.email },
			include: { profile: true }
		})

		if (!user?.profile) {
			throw HttpError(401, 'Неверный email или пароль', 'INVALID_CREDENTIALS')
		}

		const isValid = await comparePassword(payload.password, user.password)

		if (!isValid) {
			throw HttpError(401, 'Неверный пароль', 'NVALID_CREDENTIALS')
		}

		const tokens = await tokensForProfile({
			id: user.profile.id,
			companyId: user.profile.companyId,
			role: user.profile.role
		})

		return {
			user: {
				id: user.profile.id,
				email: user.profile.email,
				fullName: user.profile.fullName,
				role: user.profile.role,
				companyId: user.profile.companyId
			},
			...tokens
		}
	},

	async refresh(token: string) {
		const decoded = verifyAccessToken(token)

		const activeTokens = await prisma.refreshToken.findMany({
			where: {
				userId: decoded.sub,
				revokedAt: null,
				expiresAt: { gt: new Date() }
			}
		})

		let matchedTokenId: string | null = null

		for (const item of activeTokens) {
			const isSame = await bcrypt.compare(token, item.tokenHash)

			if (isSame) {
				matchedTokenId = item.id
				break
			}
		}

		if (!matchedTokenId) {
			throw HttpError(401, 'Невалидный токен', 'INVALID_REFRESH_TOKEN')
		}

		await prisma.refreshToken.update({
			where: { id: matchedTokenId },
			data: { revokedAt: new Date() }
		})

		const profile = await prisma.profile.findUnique({
			where: { id: decoded.sub }
		})

		if (!profile) {
			throw HttpError(401, 'Пользователь не найден', 'INVALID_REFRESH_TOKEN')
		}

		return tokensForProfile({
			id: profile.id,
			companyId: profile.companyId,
			role: profile.role
		})
	},
	async logout(token: string) {
		const decoded = verifyRefreshToken(token)
		const activeTokens = await prisma.refreshToken.findMany({
			where: {
				userId: decoded.sub,
				revokedAt: null,
				expiresAt: { gt: new Date() }
			}
		})

		for (const item of activeTokens) {
			const isSame = await bcrypt.compare(token, item.tokenHash)

			if (isSame) {
				await prisma.refreshToken.update({
					where: { id: item.id },
					data: { revokedAt: new Date() }
				})
			}
		}
	},
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
			company: profile.company.name
		}
	}
}
