import { Telegraf } from "telegraf";
import { TOKEN, LOCAL_API } from "./config/index.js";
import { validator } from "./middleware/validator.js";
import { start } from "./middleware/start.js";
import { commands } from "./middleware/commands.js";
import { actions } from "./middleware/actions.js";
import { admin } from "./middleware/admin.js";
import { files } from "./middleware/files.js";

export const bot = new Telegraf(TOKEN, {
    handlerTimeout: 9000000,
    telegram: {
        apiRoot: LOCAL_API
    }
});

bot
    .use(admin)
    .use(validator)
    .use(start)
    .use(commands)
    .use(actions)
    .use(files)

