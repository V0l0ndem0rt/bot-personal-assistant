import { aiService } from '../services/aiService.js'

export function handleMessages(bot) {
	try {
		bot.on('text', async ctx => {
			const aiResponse = await aiService.askAI(
				ctx.message.text,
				ctx.from.id
			)
			ctx.reply(aiResponse, { parse_mode: 'Markdown' })
		})
	} catch (error) {
		console.error('Ошибка при отправке ответа:', error)
	}
}
