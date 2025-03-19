export function handleMessages(bot) {
	try {
		bot.on('text', async ctx => {
			const aiResponse = await aiService.askAI(
				ctx.message.text,
				ctx.from.id
			)

			// Оборачиваем ответ в try-catch для безопасной отправки
			try {
				await ctx.reply(aiResponse, { parse_mode: 'Markdown' })
			} catch (markdownError) {
				console.warn(
					'Ошибка при отправке с Markdown:',
					markdownError.message
				)
				// Пробуем отправить без форматирования при ошибке
				// await ctx.reply(aiResponse)
			}
		})
	} catch (error) {
		console.error('Ошибка при отправке ответа:', error)
	}
}
