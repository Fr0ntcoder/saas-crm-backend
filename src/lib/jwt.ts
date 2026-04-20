// Конвертация занчений вроде "15m", "7d" в миллисекунды.

export const parseDurationMs = (value: string): number => {
	const matched = value.match(/^(\d+)([smhd])$/)

	if (!matched) {
		return 7 * 24 * 60 * 60 * 1000
	}

	const amount = Number(matched[1])

	const unit = matched[2]

	if (unit === 's') return amount * 1000
	if (unit === 'm') return amount * 60 * 1000
	if (unit === 'h') return amount * 60 * 60 * 1000

	return amount * 24 * 60 * 60 * 1000
}
