import schedule from 'node-schedule'
import { bot } from '../bot/index.js'
import { taskService } from './taskService.js'

export function scheduleReminders() {
	// Ежедневное утреннее напоминание о задачах на сегодня
	schedule.scheduleJob('0 9 * * *', async () => {
		const tasks = await taskService.getTodayTasks()

		for (const task of tasks) {
			try {
				await bot.telegram.sendMessage(
					task.id,
					`⏰ Задача на сегодня: ${task.description}`
				)
			} catch (error) {
				console.error(
					`Ошибка при отправке уведомления для задачи ${task.id}:`,
					error
				)
			}
		}
	})

	// Проверка задач с истекающим сроком (каждые 3 часа)
	schedule.scheduleJob('0 */3 * * *', async () => {
		// Получаем задачи, срок которых истекает в ближайшие 24 часа
		const upcomingTasks = await taskService.getUpcomingTasks(24)

		for (const task of upcomingTasks) {
			try {
				const dueDate = new Date(task.dueDate)
				const timeLeft = Math.round(
					(dueDate - new Date()) / (1000 * 60 * 60)
				)

				await bot.telegram.sendMessage(
					task.id,
					`⚠️ Напоминание: задача "${task.description}" истекает через ${timeLeft} часов!`
				)
			} catch (error) {
				console.error(
					`Ошибка при отправке напоминания для задачи ${task.id}:`,
					error
				)
			}
		}
	})
}

// Функция для запуска планировщика
export function initScheduler() {
	try {
		scheduleReminders()
		console.log('🕒 Планировщик запущен')
	} catch (error) {
		console.error('❌ Ошибка при запуске планировщика:', error)
	}
}
