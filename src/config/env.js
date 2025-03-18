import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

export const config = {
	BOT_TOKEN: process.env.BOT_TOKEN,
	// Ключ должен быть в формате Base64
	GIGACHAT_API_KEY: process.env.GIGACHAT_API_KEY,
	DATABASE_URL: process.env.DATABASE_URL,
	API_URL: process.env.API_URL || 'http://localhost:3000',
}
