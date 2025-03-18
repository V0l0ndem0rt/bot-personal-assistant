import { Telegraf } from 'telegraf'
import { config } from '../config/env.js'
import { handleCommands } from './commands.js'
import { handleMessages } from './handlers.js'

const bot = new Telegraf(config.BOT_TOKEN)

handleCommands(bot) // Подключаем команды
handleMessages(bot) // Подключаем обработчики сообщений

bot.launch()
	.then(() => console.log('🤖 Бот запущен'))
	.catch(err => console.error('❌ Ошибка запуска:', err))

// Закрытие бота при получении сигналов
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
