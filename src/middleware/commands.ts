import { Composer, Markup, Input } from "telegraf";
import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";
import { csvExport } from "../utils/csvExport.js";
import { unlink } from "fs/promises";
import { downloader } from "../queues/download.js";

export const commands = new Composer()

commands.command(['dls', 'downloads'], async ctx => {
    const counts = await downloader.getJobCounts('wait', 'completed', 'failed');
    // Returns an object like this { wait: number, completed: number, failed: number }
    ctx.sendMessage(`<pre>${JSON.stringify(counts, null, 2)}</pre>`, { parse_mode: "HTML" })
})

commands.command('myid', async ctx => {
    if (ctx.chat.type === 'private') {
        const id = ctx.message.text.replace(/^\/myid(@\w+)?/, '').trim()

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