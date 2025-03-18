import { aiService } from '../services/aiService.js'

export function handleMessages(bot) {
	bot.on('text', async ctx => {
		const aiResponse = await aiService.askAI(ctx.message.text, ctx.from.id)
		ctx.reply(aiResponse)
	})
}
