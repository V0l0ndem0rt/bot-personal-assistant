import { Markup } from 'telegraf'
import { gigachat } from '../services/aiService.js'
import { taskService } from '../services/taskService.js'

export function handleCommands(bot) {
	// Команда для начала работы с ботом
	bot.command('start', async ctx => {
		await taskService.createUser(ctx.from.id)
		await ctx.reply(
			'Привет! Я твой ассистент. Выберите действие:',
			Markup.keyboard([
				['📋 Задачи', '➕ Добавить задачу'],
				['💰 Баланс', '📦 Модели', '🔄 Сбросить диалог'],
			]).resize()
		)
	})

	// Обработчик для кнопки "Задачи"
	bot.hears('📋 Задачи', async ctx => {
		const tasks = await taskService.getTasks(ctx.from.id)
		const taskList = tasks.length
			? tasks.map((t, i) => `${i + 1}. ${t.description}`).join('\n')
			: 'Задач нет.'
		await ctx.reply(`📋 Ваши задачи:\n${taskList}`)
	})

	// Обработчик для кнопки "Баланс"
	bot.hears('💰 Баланс', async ctx => {
		const balance = await gigachat.getBalance()
		await ctx.reply(
			`Баланс токенов: \n${balance.balance
				.map(b => `${b.usage}: ${b.value}`)
				.join('\n')}`
		)
	})

	// Обработчик для кнопки "Модели"
	bot.hears('📦 Модели', async ctx => {
		const models = await gigachat.allModels()
		await ctx.reply(
			`Доступные модели: \n${models.map(m => m.id).join('\n')}`
		)
	})

	// Обработчик для кнопки "Сбросить диалог"
	bot.hears('🔄 Сбросить диалог', async ctx => {
		await taskService.resetDialog(ctx.from.id)
		await ctx.reply('Диалог сброшен.')
	})

	// Обработчик для кнопки "Добавить задачу"
	bot.hears('➕ Добавить задачу', async ctx => {
		ctx.session = { addingTask: true }
		await ctx.reply('Введите описание задачи:')
		// Обработчик текстовых сообщений
		bot.on('text', async ctx => {
			if (ctx.session && ctx.session.addingTask) {
				const task = ctx.message.text
				await taskService.addTask(ctx.from.id, task)
				await ctx.reply('Задача добавлена.')
				ctx.session.addingTask = false
			} else {
				await ctx.reply('не получается добавить задачу')
			}
		})
	})
}
