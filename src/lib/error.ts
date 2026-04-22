export const HttpError = (
	statusCode: number,
	message: string,
	code?: string
) => ({
	statusCode,
	message,
	code
})
