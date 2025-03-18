import { GigaChat } from 'gigachat-node'
import { config } from '../config/env.js'
import { taskService } from './taskService.js'

// Используем правильное имя переменной из конфига
export const gigachat = new GigaChat({
	clientSecretKey: config.GIGACHAT_API_KEY,
	isIgnoreTSL: true,
	isPersonal: true,
	autoRefreshToken: true,
	scope: 'GIGACHAT_API_PERS', // явно указываем scope для физических лиц
})
// Создаем токен при первом использовании
// if (!gigachat.token) {
// 	try {
// 		await gigachat.createToken()
// 		console.log('Токен GigaChat успешно создан')
// 	} catch (tokenError) {
// 		console.error('Ошибка при создании токена GigaChat:', tokenError)
// 	}
// }

// const balance = await gigachat.getBalance()
// console.log(balance)

// const models = await gigachat.allModels()
// console.log(models)

// Экспортируем объект aiService с методом askAI внутри
export const aiService = {
	async askAI(userMessage, userId) {
		try {
			const tasks = await taskService.getTasks(userId)
			const context = `Задачи пользователя: ${
				tasks.map(t => t.description).join(', ') || 'нет активных задач'
			}`

			const completion = await gigachat.completion({
				model: 'GigaChat-2',
				messages: [
					{
						role: 'system',
						content: 'Ты – умный Telegram-ассистент.',
					},
					{ role: 'user', content: `${userMessage}` },
				],
				temperature: 0.7,
				max_tokens: 1500,
			})

			return completion.choices[0].message.content
		} catch (error) {
			console.error('Ошибка при обращении к GigaChat:', error)
			return 'Извините, произошла ошибка при обработке вашего запроса.'
		}
	},
}
