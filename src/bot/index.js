import { Telegraf, session } from 'telegraf'
import { registerAllCommands } from '../commands/index.js'
import { config } from '../config/env.js'
import { initScheduler } from '../services/scheduler.js'

export const bot = new Telegraf(config.BOT_TOKEN)

// Подключаем middlewares
bot.use(session())

// Регистрируем все команды
registerAllCommands(bot)

// Инициализируем планировщик уведомлений
initScheduler()

// Запускаем бота
bot.launch()
	.then(() => console.log('🤖 Бот запущен'))
	.catch(err => console.error('❌ Ошибка запуска:', err))

// Закрытие бота при получении сигналов
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
