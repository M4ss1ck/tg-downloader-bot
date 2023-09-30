import { Telegraf } from "telegraf";
import { app } from "./server/app.js";
import { logger } from "./logger/index.js";
import { PORT } from "./config/index.js";
import { worker } from "./queues/download.js";
import { bot } from "./bot.js";

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