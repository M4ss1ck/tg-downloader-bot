export const ADMIN_ID = process.env.ADMIN_ID ?? ""
export const TOKEN = process.env.BOT_TOKEN ?? ""
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000
export const LOCAL_API = process.env.LOCAL_API ?? "http://localhost:8081"
export const URL_PREFIX = process.env.URL_PREFIX?.replace(/\/$/g, '') ?? `http://localhost:${PORT}`