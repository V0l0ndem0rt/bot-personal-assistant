import { gigachat } from '../services/aiService.js'
import { taskService } from '../services/taskService.js'

export function handleCommands(bot) {
	bot.command('start', async ctx => {
		await taskService.createUser(ctx.from.id)
		await ctx.reply(
			'Привет! Я твой ассистент. Используй /tasks для просмотра задач.'
		)
	})

	bot.command('tasks', async ctx => {
		const tasks = await taskService.getTasks(ctx.from.id)
		const taskList = tasks.length
			? tasks.map((t, i) => `${i + 1}. ${t.description}`).join('\n')
			: 'Задач нет.'
		await ctx.reply(`📋 Ваши задачи:\n${taskList}`)
	})

	bot.command('addtask', async ctx => {
		const taskText = ctx.message.text.split('/addtask ')[1]
		if (!taskText)
			return ctx.reply('Введите описание задачи после команды.')
		await taskService.addTask(ctx.from.id, taskText)

		await ctx.reply('✅ Задача добавлена!')
	})

	bot.command('balance', async ctx => {
		const balance = await gigachat.getBalance()
		await ctx.reply(
			balance.balance.map(b => `${b.usage}: ${b.value}`).join('\n')
		)
	})

	bot.command('models', async ctx => {
		const models = await gigachat.allModels()
		await ctx.reply(models.data.map(m => `${m.object}: ${m.id}`).join('\n'))
		// console.log(models)
	})
}
