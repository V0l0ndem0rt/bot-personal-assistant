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

	async addTask(userId, description) {
		try {
			const newTask = {
				id: userId,
				description,
				dueDate: new Date().toISOString(),
				status: 'active',
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
}
