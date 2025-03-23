const API_URL = 'http://localhost:3000'

export const taskService = {
	async getTasks(userId) {
		try {
			const response = await fetch(
				`${API_URL}/tasks?id=${userId}&status=active`
			)
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}
			return await response.json()
		} catch (error) {
			console.error('Ошибка при получении задач:', error)
			return []
		}
	},

	async getTodayTasks() {
		try {
			// Получаем текущую дату в формате ISO, но только первую часть (YYYY-MM-DD)
			const today = new Date().toISOString().split('T')[0]

			// Запрашиваем задачи на сегодня, которые активны
			const response = await fetch(
				`${API_URL}/tasks?status=active&dueDate_like=${today}`
			)

			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}

			return await response.json()
		} catch (error) {
			console.error('Ошибка при получении задач на сегодня:', error)
			return []
		}
	},

	async getUpcomingTasks(hoursThreshold = 24) {
		try {
			// Получаем все активные задачи
			const response = await fetch(`${API_URL}/tasks?status=active`)

			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}

			const allTasks = await response.json()
			const now = new Date()
			const thresholdMs = hoursThreshold * 60 * 60 * 1000 // часы в миллисекунды

			// Фильтруем задачи, которые истекают в течение указанного времени
			return allTasks.filter(task => {
				const dueDate = new Date(task.dueDate)
				const timeUntilDue = dueDate - now

				// Возвращаем задачи, срок которых истекает в течение указанного времени,
				// но еще не просрочены
				return timeUntilDue > 0 && timeUntilDue <= thresholdMs
			})
		} catch (error) {
			console.error(`Ошибка при получении предстоящих задач: ${error}`)
			return []
		}
	},

	async addTask(userId, description, category = 'общее') {
		try {
			// Проверяем, что передана категория, иначе используем 'общее'
			const actualCategory = category || 'общее'

			const newTask = {
				id: userId.toString(),
				description,
				dueDate: new Date().toISOString(),
				status: 'active',
				category: actualCategory,
			}

			const response = await fetch(`${API_URL}/tasks`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newTask),
			})

			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}

			return await response.json()
		} catch (error) {
			console.error('Ошибка при добавлении задачи:', error)
			throw error
		}
	},

	async completeTask(taskId) {
		try {
			// Сначала получаем текущую задачу
			const taskResponse = await fetch(`${API_URL}/tasks/${taskId}`)

			if (!taskResponse.ok) {
				throw new Error(`Ошибка: ${taskResponse.status}`)
			}

			const task = await taskResponse.json()

			// Затем обновляем ее статус
			const response = await fetch(`${API_URL}/tasks/${taskId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ status: 'done' }),
			})

			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}

			return await response.json()
		} catch (error) {
			console.error('Ошибка при выполнении задачи:', error)
			throw error
		}
	},
	async createUser(userId) {
		try {
			const user = await this.getUser(userId)
			if (user.length) {
				return user
			}

			const newUser = {
				id: userId.toString(),
				model: 'GigaChat-2',
				context: [],
			}

			const response = await fetch(`${API_URL}/users`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newUser),
			})

			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}

			return await response.json()
		} catch (error) {
			console.error('Ошибка при добавлении пользователя:', error)
			throw error
		}
	},
	async getUser(userId) {
		try {
			const response = await fetch(`${API_URL}/users?id=${userId}`)
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}
			const user = await response.json()
			return await user
		} catch (error) {
			console.error('Ошибка при получении пользователя:', error)
			return null
		}
	},
	async updateUser(userId, data) {
		try {
			const response = await fetch(`${API_URL}/users/${userId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ...data }),
			})
			if (!response.ok) {
				throw new Error(
					`Ошибка при обновлении пользователя: ${response.status}`
				)
			}
			return await response.json()
		} catch (error) {
			console.error('Ошибка:', error)
		}
	},
	async resetDialog(userId) {
		try {
			const response = await fetch(`${API_URL}/users/${userId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ context: [] }),
			})
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}
			return await response.json()
		} catch (error) {
			console.error('Ошибка при сбросе диалога:', error)
			throw error
		}
	},
	async setUserModel(userId, model) {
		try {
			const response = await fetch(`${API_URL}/users/${userId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ model }),
			})

			if (!response.ok) {
				throw new Error(
					`Ошибка при изменении модели: ${response.status}`
				)
			}

			return await response.json()
		} catch (error) {
			console.error('Ошибка при изменении модели:', error)
			throw error
		}
	},
	async deleteTask(taskId) {
		try {
			const response = await fetch(`${API_URL}/tasks/${taskId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
			})

			if (!response.ok) {
				throw new Error(
					`Ошибка при удалении задачи: ${response.status}`
				)
			}

			return true
		} catch (error) {
			console.error('Ошибка при удалении задачи:', error)
			throw error
		}
	},
	async setTaskDueDate(taskId, dueDate) {
		try {
			// Проверяем, что дата в правильном формате
			const dueDateObj = new Date(dueDate)
			if (isNaN(dueDateObj.getTime())) {
				throw new Error('Некорректная дата')
			}

			const response = await fetch(`${API_URL}/tasks/${taskId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ dueDate: dueDateObj.toISOString() }),
			})

			if (!response.ok) {
				throw new Error(
					`Ошибка при обновлении срока задачи: ${response.status}`
				)
			}

			return await response.json()
		} catch (error) {
			console.error('Ошибка при установке срока задачи:', error)
			throw error
		}
	},
	async getTasksByCategory(userId, category) {
		try {
			// Получаем все активные задачи пользователя
			const response = await fetch(
				`${API_URL}/tasks?id=${userId}&status=active`
			)

			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}

			// Получаем все задачи и фильтруем по категории
			const tasks = await response.json()

			// Фильтруем задачи, у которых категория точно совпадает с запрашиваемой
			return tasks.filter(task => {
				// Если запрошена категория "общее", возвращаем задачи с категорией "общее" или без категории
				if (category === 'общее') {
					return (
						!task.category ||
						task.category === 'общее' ||
						task.category === ''
					)
				}
				// Иначе проверяем точное совпадение категории
				return task.category === category
			})
		} catch (error) {
			console.error('Ошибка при получении задач по категории:', error)
			return []
		}
	},
	async setTaskCategory(taskId, category) {
		try {
			const response = await fetch(`${API_URL}/tasks/${taskId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ category }),
			})

			if (!response.ok) {
				throw new Error(
					`Ошибка при установке категории: ${response.status}`
				)
			}

			return await response.json()
		} catch (error) {
			console.error('Ошибка при установке категории задачи:', error)
			throw error
		}
	},
}
