import { registerAiCommands } from './ai.commands.js'
import { registerSystemCommands } from './system.commands.js'
import { registerTaskCommands } from './task.commands.js'

export function registerAllCommands(bot) {
	// Правильная настройка middleware для сессий
	bot.use((ctx, next) => {
		ctx.session = ctx.session || {}
		return next()
	})

	// Регистрируем все команды
	registerSystemCommands(bot)
	registerTaskCommands(bot)
	registerAiCommands(bot)
}
