type Role = 'ADMIN' | 'MANAGER'

export type AuthProfile = {
	id: string
	companyId: string
	role: Role
}

export type JwtPayload = {
	sub: string
	companyId: string
	role: Role
}
