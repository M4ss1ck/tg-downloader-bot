import { Composer, Markup, Input } from "telegraf";
import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";
import { csvExport } from "../utils/csvExport.js";
import { unlink } from "fs/promises";
import { downloader } from "../queues/download.js";
import { getTotalSizeRaw, convertBytes } from "../utils/getSize.js";

export const commands = new Composer()

commands.command(['dls', 'downloads'], async ctx => {
    const counts = await downloader.getJobCounts('wait', 'completed', 'failed');
    // Returns an object like this { wait: number, completed: number, failed: number }
    ctx.sendMessage(`<pre>${JSON.stringify(counts, null, 2)}</pre>`, { parse_mode: "HTML" })
})

commands.command('metrics', async ctx => {
    const metrics = await downloader.getMetrics('completed');
    ctx.sendMessage(`<pre>${JSON.stringify(metrics, null, 2)}</pre>`, { parse_mode: "HTML" })
})

commands.command('status', async ctx => {
    try {
        if (ctx.chat.type === 'private') {
            const size = await getTotalSizeRaw('Downloads')
            console.log(size)
            ctx.replyWithHTML(`Used space: ${convertBytes(size)}`)
        }
    } catch (error) {
        logger.log(error)
        ctx.replyWithHTML('Oops! Some random sprites ate the previous command\'s response')
    }
})

commands.command('followers', async ctx => {
    if (ctx.chat.type === 'private') {

    }
})

commands.command('following', async ctx => {
    if (ctx.chat.type === 'private') {

    }
})