import { Telegraf } from "telegraf";
import { app } from "./server/app.js";
import { logger } from "./logger/index.js";
import { TOKEN, PORT } from "./config/index.js";
import { validator } from "./middleware/validator.js";
import { start } from "./middleware/start.js";
import { commands } from "./middleware/commands.js";
import { actions } from "./middleware/actions.js";
import { admin } from "./middleware/admin.js";
import { worker } from "./queues/download.js";

const bot = new Telegraf(TOKEN, {
    handlerTimeout: 9000000
});

bot.command('test', ctx => {
    ctx.reply('tested', { reply_to_message_id: ctx.message?.message_id })
})

bot
    .use(admin)
    .use(validator)
    .use(start)
    .use(commands)
    .use(actions)

bot.launch()
logger.success('BOT INICIADO')

const server = app.listen(PORT, () => logger.success(`Server listening on port: ${PORT}`));

const gracefulStop = (signal: string) => async () => {
    await worker.close()
    server.closeAllConnections()
    bot.stop(signal)
}

// Enable graceful stop
process.once('SIGINT', gracefulStop('SIGINT'))
process.once('SIGTERM', gracefulStop('SIGTERM'))

process.on("uncaughtException", function (err) {
    // Handle the error safely
    logger.info("Uncaught exception")
    logger.error(err)
});

process.on("unhandledRejection", (reason, promise) => {
    // Handle the error safely
    logger.info("Unhandled Rejection at: Promise")
    logger.error({ promise, reason })
});