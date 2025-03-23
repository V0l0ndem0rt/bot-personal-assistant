import { Markup } from 'telegraf'

// Список доступных категорий
export const categories = ['общее', 'работа', 'дом', 'учеба', 'важное']

// Главное меню бота
export const mainMenuKeyboard = Markup.keyboard([
	['📋 Задачи', '➕ Добавить задачу'],
	['🗑️ Удалить задачу', '📅 Установить срок'],
	['🏷️ Категории', '📊 По категориям'],
	['💰 Баланс', '🔄 Сбросить диалог', '⚙️ Изменить модель AI'],
]).resize()

// Клавиатура выбора категорий задач
export const categoriesKeyboard = Markup.keyboard([
	...categories.map(c => [`🏷️ ${c}`]),
	['🔙 Назад'],
]).resize()

// Клавиатура для выбора категории при создании задачи
export const taskCategoryKeyboard = Markup.keyboard([
	...categories.map(c => [c]),
	['пропустить'],
	['отмена'],
])
	.oneTime()
	.resize()

// Клавиатура для выбора категории при изменении категории задачи
export const changeCategoryKeyboard = Markup.keyboard([
	...categories.map(c => [c]),
	['отмена'],
])
	.oneTime()
	.resize()

// Функция для создания клавиатуры выбора моделей
export const createModelsKeyboard = models => {
	return Markup.keyboard(models.map(m => [m.id]))
		.oneTime()
		.resize()
}

// Клавиатура с кнопкой отмены для процессов ввода
export const cancelKeyboard = Markup.keyboard([['отмена']])
	.oneTime()
	.resize()
