import schedule from 'node-schedule'
import bot from '../bot/index.js'
import { taskService } from './taskService.js'

export function scheduleReminders() {
	schedule.scheduleJob('0 9 * * *', async () => {
		const tasks = await taskService.getTodayTasks()
		tasks.forEach(task => {
			bot.telegram.sendMessage(
				task.userId,
				`⏰ Напоминание: ${task.description}`
			)
		})
	})
}
