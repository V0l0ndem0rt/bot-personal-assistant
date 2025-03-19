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
if (!gigachat.token) {
	try {
		await gigachat.createToken()
		console.log('Токен GigaChat успешно создан')
	} catch (tokenError) {
		console.error('Ошибка при создании токена GigaChat:', tokenError)
	}
}

// Экспортируем объект aiService с методом askAI внутри
export const aiService = {
	async askAI(userMessage, userId) {
		const user = await taskService.getUser(userId)
		const existingContext = user[0].context

		const messages = [
			{
				role: 'system',
				content: 'Ты – умный Telegram-ассистент.',
			},
			...existingContext,
			{
				role: 'user',
				content: `${userMessage}`,
			},
		]
		try {
			const completion = await gigachat.completion({
				model: user[0].model || 'GigaChat-2',
				messages: messages,
				temperature: 0.7,
				max_tokens: 1500,
			})

			await taskService.updateUser(userId, {
				context: [
					...existingContext,
					{
						role: 'user',
						content: userMessage,
					},
					{
						role: 'assistant',
						content: completion.choices[0].message.content,
					},
				],
			})

			return completion.choices[0].message.content
		} catch (error) {
			console.error('Ошибка при обращении к GigaChat:', error)
			return 'Извините, произошла ошибка при обработке вашего запроса.'
		}
	},
}
