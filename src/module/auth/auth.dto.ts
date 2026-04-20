import z from 'zod'

const registerDto = z.object({
	email: z.email(),
	password: z
		.string()
		.min(6, { message: 'Пароль должен содержать не менее 6 символов' }),
	fullName: z
		.string()
		.min(2, { message: 'Имя должно содержать не менее 2 символов' }),
	company: z.string().optional()
})

const loginDto = z.object({
	email: z.email(),
	password: z
		.string()
		.min(6, { message: 'Пароль должен содержать не менее 6 символов' })
})

const refreshDto = z.object({
	refreshToken: z.string().min(10).optional()
})

export type RegisterDto = z.infer<typeof registerDto>
export type LoginDto = z.infer<typeof loginDto>
export type RefreshDto = z.infer<typeof refreshDto>
