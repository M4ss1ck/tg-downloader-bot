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

export const bot = new Telegraf(TOKEN, {
    handlerTimeout: 9000000
});

bot
    .use(admin)
    .use(validator)
    .use(start)
    .use(commands)
    .use(actions)

