const API_URL = 'http://localhost:3000'

export const userService = {
	async getAllUsers() {
		try {
			const response = await fetch(`${API_URL}/users`)
			if (!response.ok) {
				throw new Error(`Ошибка: ${response.status}`)
			}
			return await response.json()
		} catch (error) {
			console.error('Ошибка при получении списка пользователей:', error)
			return []
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
}
