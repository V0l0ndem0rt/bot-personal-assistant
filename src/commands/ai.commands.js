import { message } from 'telegraf/filters'
import { createModelsKeyboard, mainMenuKeyboard } from '../bot/keyboards.js'
import { aiService, gigachat } from '../services/aiService.js'
import { taskService } from '../services/taskService.js'

// Разрешенные модели
const ALLOWED_MODELS = ['GigaChat-2', 'GigaChat-2-Pro', 'GigaChat-2-Max']

export function registerAiCommands(bot) {
	// Обработчик для кнопки "Баланс"
	bot.hears('💰 Баланс', async ctx => {
		try {
			const balance = await gigachat.getBalance()
			await ctx.reply(
				`Баланс токенов: \n${balance.balance
					.map(b => `${b.usage}: ${b.value}`)
					.join('\n')}`
			)
		} catch (error) {
			console.error('Ошибка при получении баланса:', error)
			await ctx.reply('Произошла ошибка при получении баланса токенов.')
		}
	})

	// Обработчик для кнопки "Сбросить диалог"
	bot.hears('🔄 Сбросить диалог', async ctx => {
		try {
			await taskService.resetDialog(ctx.from.id)
			await ctx.reply('Диалог сброшен.')
		} catch (error) {
			console.error('Ошибка при сбросе диалога:', error)
			await ctx.reply('Произошла ошибка при сбросе диалога.')
		}
	})

	// Обработчик для кнопки "Изменить модель AI"
	bot.hears('⚙️ Изменить модель AI', async ctx => {
		try {
			// Получаем все модели, но фильтруем только разрешенные
			const allModels = await gigachat.allModels()
			const models = allModels
				.filter(model => ALLOWED_MODELS.includes(model.id))
				.map(model => ({ id: model.id }))

			const user = await taskService.getUser(ctx.from.id)
			const currentModel = user[0].model

			ctx.session.changingModel = true

			// Создаем клавиатуру только с разрешенными моделями
			await ctx.reply(
				`Текущая модель: ${currentModel}\nВыберите модель AI:`,
				createModelsKeyboard(models)
			)
		} catch (error) {
			console.error('Ошибка при получении списка моделей:', error)
			await ctx.reply(
				'Не удалось получить список моделей. Попробуйте позже.'
			)
		}
	})

	// Обработчик для изменения модели и обработки сообщений для AI
	bot.on(message('text'), async (ctx, next) => {
		// Если включен режим изменения модели AI
		if (ctx.session && ctx.session.changingModel === true) {
			try {
				// Проверяем, что выбранная модель в списке разрешенных
				if (!ALLOWED_MODELS.includes(ctx.message.text)) {
					await ctx.reply(
						`Выбрана неверная модель. Доступные модели: ${ALLOWED_MODELS.join(
							', '
						)}`
					)
					return
				}

				// Устанавливаем новую модель
				await taskService.setUserModel(ctx.from.id, ctx.message.text)
				await ctx.reply(
					`Модель успешно изменена на "${ctx.message.text}".`
				)

				// Возвращаем основную клавиатуру
				await ctx.reply('Выберите действие:', mainMenuKeyboard)

				// Сбрасываем флаг
				ctx.session.changingModel = false
			} catch (error) {
				console.error('Ошибка при изменении модели:', error)
				await ctx.reply('Произошла ошибка при изменении модели.')
				ctx.session.changingModel = false
			}
		} else {
			// Проверяем, не обрабатывается ли сообщение другими обработчиками
			const isHandlingTask =
				ctx.session &&
				(ctx.session.addingTask ||
					ctx.session.deletingTask ||
					ctx.session.settingDueDate ||
					ctx.session.settingCategory)

			// Если сообщение не обрабатывается другими обработчиками,
			// то передаем его в AI
			if (!isHandlingTask) {
				try {
					const aiResponse = await aiService.askAI(
						ctx.message.text,
						ctx.from.id
					)
					await ctx.reply(aiResponse, { parse_mode: 'Markdown' })
				} catch (error) {
					console.error('Ошибка при обработке запроса AI:', error)
					await ctx.reply(
						'Произошла ошибка при обработке вашего запроса.'
					)
				}
			} else {
				return next()
			}
		}
	})
}
