import jwt, { type SignOptions } from 'jsonwebtoken'
import { parseDurationMs } from '../lib/jwt'

import { JwtPayload } from '../types'
import { env } from './env.config'

export const toSignOptions = (expiresIn: string): SignOptions => ({
	expiresIn: expiresIn as SignOptions['expiresIn']
})

export const signAccessToken = (payload: JwtPayload) =>
	jwt.sign(
		payload,
		env.JWT_ACCESS_SECRET,
		toSignOptions(env.JWT_ACCESS_EXPIRES_IN)
	)

export const signRefreshToken = (payload: JwtPayload) =>
	jwt.sign(
		payload,
		env.JWT_REFRESH_SECRET,
		toSignOptions(env.JWT_REFRESH_EXPIRES_IN)
	)

export const verifyAccessToken = (token: string) =>
	jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload

export const verifyRefreshToken = (token: string) =>
	jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload

export const refreshTokenExpiresAt = () =>
	new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN))
