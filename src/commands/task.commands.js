import { message } from 'telegraf/filters'
import {
	categories,
	changeCategoryKeyboard,
	mainMenuKeyboard,
	taskCategoryKeyboard,
} from '../bot/keyboards.js'
import { taskService } from '../services/taskService.js'

export function registerTaskCommands(bot) {
	// Обработчик для кнопки "Задачи"
	bot.hears('📋 Задачи', async ctx => {
		const tasks = await taskService.getTasks(ctx.from.id)
		const taskList = tasks.length
			? tasks
					.map(
						(t, i) =>
							`${i + 1}. ${t.description} (ID: ${
								t._id || t.id
							}) [${t.category || 'общее'}]`
					)
					.join('\n')
			: 'Задач нет.'
		await ctx.reply(`📋 Ваши задачи:\n${taskList}`)
	})

	// Обработчик для кнопки "Добавить задачу"
	bot.hears('➕ Добавить задачу', async ctx => {
		ctx.session.addingTask = true
		ctx.session.newTask = {}
		await ctx.reply('Введите описание задачи:')
	})

	// Обработчик для кнопки "Удалить задачу"
	bot.hears('🗑️ Удалить задачу', async ctx => {
		ctx.session.deletingTask = true
		const tasks = await taskService.getTasks(ctx.from.id)

		if (tasks.length === 0) {
			await ctx.reply('У вас нет активных задач.')
			ctx.session.deletingTask = false
			return
		}

		const taskList = tasks
			.map((t, i) => `${i + 1}. ${t.description} (ID: ${t._id || t.id})`)
			.join('\n')
		await ctx.reply(`Выберите номер задачи для удаления:\n${taskList}`)
	})

	// Обработчик для кнопки "Установить срок"
	bot.hears('📅 Установить срок', async ctx => {
		ctx.session.settingDueDate = true
		ctx.session.dueDate = {}

		const tasks = await taskService.getTasks(ctx.from.id)

		if (tasks.length === 0) {
			await ctx.reply('У вас нет активных задач.')
			ctx.session.settingDueDate = false
			return
		}

		const taskList = tasks
			.map((t, i) => `${i + 1}. ${t.description} (ID: ${t._id || t.id})`)
			.join('\n')
		await ctx.reply(
			`Выберите номер задачи для установки срока:\n${taskList}`
		)
	})

	// Обработчик для кнопки "Категории"
	bot.hears('🏷️ Категории', async ctx => {
		ctx.session.settingCategory = true

		const tasks = await taskService.getTasks(ctx.from.id)

		if (tasks.length === 0) {
			await ctx.reply('У вас нет активных задач.')
			ctx.session.settingCategory = false
			return
		}

		const taskList = tasks
			.map(
				(t, i) =>
					`${i + 1}. ${t.description} (ID: ${t._id || t.id}) [${
						t.category || 'общее'
					}]`
			)
			.join('\n')
		await ctx.reply(
			`Выберите номер задачи для изменения категории:\n${taskList}`
		)
	})

	// Обработчики для просмотра задач по категориям
	categories.forEach(category => {
		bot.hears(`🏷️ ${category}`, async ctx => {
			const tasks = await taskService.getTasksByCategory(
				ctx.from.id,
				category
			)
			const taskList = tasks.length
				? tasks
						.map(
							(t, i) =>
								`${i + 1}. ${t.description} (ID: ${
									t._id || t.id
								})`
						)
						.join('\n')
				: `В категории "${category}" нет задач.`
			await ctx.reply(
				`📋 Задачи из категории "${category}":\n${taskList}`
			)
		})
	})

	// Обработка ввода пользователя для добавления, удаления, установки срока и категории задачи
	bot.on(message('text'), async (ctx, next) => {
		// Если включен режим добавления задачи
		if (ctx.session && ctx.session.addingTask === true) {
			// Если еще не ввели описание задачи
			if (!ctx.session.newTask.description) {
				ctx.session.newTask.description = ctx.message.text

				// Предлагаем выбрать категорию
				await ctx.reply(
					'Выберите категорию для задачи:',
					taskCategoryKeyboard
				)
			}
			// Если уже ввели описание и теперь выбираем категорию
			else {
				let category = 'общее'

				if (ctx.message.text !== 'пропустить') {
					// Проверяем, что категория из списка доступных
					if (categories.includes(ctx.message.text)) {
						category = ctx.message.text
					} else {
						await ctx.reply(
							'Выбрана неверная категория. Используется категория "общее".'
						)
					}
				}

				await taskService.addTask(
					ctx.from.id,
					ctx.session.newTask.description,
					category
				)
				await ctx.reply(`Задача добавлена в категорию "${category}".`)

				// Возвращаем основную клавиатуру
				await ctx.reply('Выберите действие:', mainMenuKeyboard)

				// Сбрасываем флаги и данные
				ctx.session.addingTask = false
				ctx.session.newTask = {}
				return
			}
		}
		// Если включен режим удаления задачи
		else if (ctx.session && ctx.session.deletingTask === true) {
			const tasks = await taskService.getTasks(ctx.from.id)
			const taskIndex = parseInt(ctx.message.text) - 1

			if (
				isNaN(taskIndex) ||
				taskIndex < 0 ||
				taskIndex >= tasks.length
			) {
				await ctx.reply(
					'Пожалуйста, выберите корректный номер задачи из списка.'
				)
				return
			}

			const taskId = tasks[taskIndex]._id || tasks[taskIndex].id

			try {
				await taskService.deleteTask(taskId)
				await ctx.reply('Задача успешно удалена.')
			} catch (error) {
				await ctx.reply('Произошла ошибка при удалении задачи.')
				console.error('Ошибка при удалении задачи:', error)
			}

			ctx.session.deletingTask = false
			return
		}
		// Если включен режим установки срока задачи
		else if (ctx.session && ctx.session.settingDueDate === true) {
			// Если еще не выбрана задача
			if (!ctx.session.dueDate.taskId) {
				const tasks = await taskService.getTasks(ctx.from.id)
				const taskIndex = parseInt(ctx.message.text) - 1

				if (
					isNaN(taskIndex) ||
					taskIndex < 0 ||
					taskIndex >= tasks.length
				) {
					await ctx.reply(
						'Пожалуйста, выберите корректный номер задачи из списка.'
					)
					return
				}

				ctx.session.dueDate.taskId =
					tasks[taskIndex]._id || tasks[taskIndex].id
				await ctx.reply(
					'Введите срок выполнения в формате ГГГГ-ММ-ДД (например, 2024-04-01):'
				)
			}
			// Если задача выбрана и теперь выбираем дату
			else {
				const dateStr = ctx.message.text
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/

				if (!dateRegex.test(dateStr)) {
					await ctx.reply(
						'Пожалуйста, введите дату в формате ГГГГ-ММ-ДД (например, 2024-04-01).'
					)
					return
				}

				try {
					await taskService.setTaskDueDate(
						ctx.session.dueDate.taskId,
						dateStr
					)
					await ctx.reply('Срок задачи успешно обновлен.')
				} catch (error) {
					await ctx.reply(
						'Произошла ошибка при установке срока задачи.'
					)
					console.error('Ошибка при установке срока задачи:', error)
				}

				ctx.session.settingDueDate = false
				ctx.session.dueDate = {}
				return
			}
		}
		// Если включен режим установки категории задачи
		else if (ctx.session && ctx.session.settingCategory === true) {
			// Если еще не выбрана задача
			if (!ctx.session.categoryData) {
				const tasks = await taskService.getTasks(ctx.from.id)
				const taskIndex = parseInt(ctx.message.text) - 1

				if (
					isNaN(taskIndex) ||
					taskIndex < 0 ||
					taskIndex >= tasks.length
				) {
					await ctx.reply(
						'Пожалуйста, выберите корректный номер задачи из списка.'
					)
					return
				}

				ctx.session.categoryData = {
					taskId: tasks[taskIndex]._id || tasks[taskIndex].id,
				}

				// Предлагаем выбрать категорию
				await ctx.reply(
					'Выберите категорию для задачи:',
					changeCategoryKeyboard
				)
			}
			// Если задача выбрана и теперь выбираем категорию
			else {
				const category = ctx.message.text

				if (!categories.includes(category)) {
					await ctx.reply(
						`Пожалуйста, выберите категорию из списка: ${categories.join(
							', '
						)}`
					)
					return
				}

				try {
					await taskService.setTaskCategory(
						ctx.session.categoryData.taskId,
						category
					)
					await ctx.reply(
						`Категория задачи изменена на "${category}".`
					)
				} catch (error) {
					await ctx.reply(
						'Произошла ошибка при изменении категории задачи.'
					)
					console.error(
						'Ошибка при изменении категории задачи:',
						error
					)
				}

				// Возвращаем основную клавиатуру
				await ctx.reply('Выберите действие:', mainMenuKeyboard)

				ctx.session.settingCategory = false
				ctx.session.categoryData = null
				return
			}
		} else {
			// Передаем управление следующему обработчику
			return next()
		}
	})
}
