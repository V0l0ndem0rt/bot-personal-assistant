import { categoriesKeyboard, mainMenuKeyboard } from '../bot/keyboards.js'
import { taskService } from '../services/taskService.js'

export function registerSystemCommands(bot) {
	// Команда для начала работы с ботом
	bot.command('start', async ctx => {
		try {
			await taskService.createUser(ctx.from.id)
			await ctx.reply(
				'Привет! Я твой ассистент. Выберите действие:',
				mainMenuKeyboard
			)
		} catch (error) {
			console.error('Ошибка при выполнении команды start:', error)
			await ctx.reply(
				'Произошла ошибка при запуске бота. Попробуйте позже.'
			)
		}
	})

	// Обработчик для кнопки "По категориям"
	bot.hears('📊 По категориям', async ctx => {
		await ctx.reply(
			'Выберите категорию для просмотра задач:',
			categoriesKeyboard
		)
	})

	// Обработчик для возврата в главное меню
	bot.hears('🔙 Назад', async ctx => {
		await ctx.reply('Выберите действие:', mainMenuKeyboard)
	})

	// Обработчик для команды помощи
	bot.command('help', async ctx => {
		const helpText = `
Доступные команды:
/start - Начать работу с ботом
/help - Вывести это сообщение с помощью

Доступные действия:
📋 Задачи - Просмотр всех активных задач
➕ Добавить задачу - Добавление новой задачи
🗑️ Удалить задачу - Удаление существующей задачи
📅 Установить срок - Установка срока выполнения задачи
🏷️ Категории - Изменение категории задачи
📊 По категориям - Просмотр задач по категориям
💰 Баланс - Проверка баланса токенов GigaChat
🔄 Сбросить диалог - Очистка контекста диалога с AI
⚙️ Изменить модель AI - Выбор модели GigaChat (GigaChat-2, GigaChat-2-Pro, GigaChat-2-Max)
`
		await ctx.reply(helpText)
	})

	// Обработчик для неизвестных команд
	bot.command(/.+/, async ctx => {
		await ctx.reply(
			`Неизвестная команда: ${ctx.message.text}. Используйте /help для получения списка доступных команд.`
		)
	})
}
