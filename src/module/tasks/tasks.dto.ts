import { TaskPriority, TaskStatus } from '@prisma/client'
import { z } from 'zod'

export const isoOrDateOnly = z.union([
	z.iso.datetime(),
	z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
])

export const createTaskDto = z.object({
	title: z.string().min(2),
	status: z.enum(TaskStatus).default('TODO'),
	priority: z.enum(TaskPriority),
	dueDate: isoOrDateOnly,
	managerId: z.uuid().optional(),
	clientId: z.uuid().optional(),
	dealId: z.uuid().optional()
})

export const updateTaskDto = createTaskDto
	.partial()
	.refine(data => Object.keys(data).length > 0, {
		message: 'Введите хотя бы одно поле'
	})

export const listTasksDto = z.object({
	search: z.string().optional(),
	status: z.enum(TaskStatus).default('TODO'),
	priority: z.enum(TaskPriority),
	managerId: z.uuid().optional(),
	clientId: z.uuid().optional(),
	dealId: z.uuid().optional(),
	dueFrom: isoOrDateOnly.optional(),
	dueTo: isoOrDateOnly.optional(),
	sortBy: z.enum(['createdAt', 'updatedAt', 'dueDate', 'priority']).optional(),
	sortOrder: z.enum(['asc', 'desc']).optional()
})

export type CreateTaskDto = z.infer<typeof createTaskDto>
export type UpdateTaskDto = z.infer<typeof updateTaskDto>
export type ListTasksDto = z.infer<typeof listTasksDto>
