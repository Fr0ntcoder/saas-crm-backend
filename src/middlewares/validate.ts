import { NextFunction, Request, Response } from 'express'
import z, { ZodError, ZodType } from 'zod'
export const validate =
	<T>(schema: ZodType<T>, source: 'body' | 'query' | 'params' = 'body') =>
	(req: Request, _res: Response, next: NextFunction) => {
		try {
			const parsed = schema.parse(req[source])
			const typedReq = req as Request & { validated?: unknown }

			typedReq.validated = parsed
			next()
		} catch (error) {
			if (error instanceof ZodError) {
				next({
					statusCode: 400,
					code: 'VALIDATION_ERROR',
					message: 'Validation failed',
					details: z.treeifyError(error)
				})
				return
			}
			next(error)
		}
	}
