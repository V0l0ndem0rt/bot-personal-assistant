import { Telegraf, session } from 'telegraf'
import { config } from '../config/env.js'
import { handleCommands } from './commands.js'
import { handleMessages } from './handlers.js'

export const bot = new Telegraf(config.BOT_TOKEN)

bot.use(session())
handleCommands(bot) // Подключаем команды
handleMessages(bot) // Подключаем обработчики сообщений

bot.launch()
	.then(() => console.log('🤖 Бот запущен'))
	.catch(err => console.error('❌ Ошибка запуска:', err))

// Закрытие бота при получении сигналов
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
