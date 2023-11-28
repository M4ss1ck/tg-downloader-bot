import { Composer, Markup, Input } from "telegraf";
import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";
import { csvExport } from "../utils/csvExport.js";
import { unlink } from "fs/promises";
import { downloader } from "../queues/download.js";
import { getTotalSizeRaw, convertBytes } from "../utils/getSize.js";
import { updateCurrentSize, getConfig, setCurrentSize } from "../utils/config.js";

export const commands = new Composer()

commands.command(['dls', 'downloads'], async ctx => {
    const counts = await downloader.getJobCounts('wait', 'completed', 'failed');
    // Returns an object like this { wait: number, completed: number, failed: number }
    ctx.sendMessage(`<pre>${JSON.stringify(counts, null, 2)}</pre>`, { parse_mode: "HTML" })
})

commands.command('metrics', async ctx => {
    const metrics = await downloader.getMetrics('completed');
    const text = JSON.stringify(metrics, null, 2)
    for (let i = 0; i < Math.ceil(text.length / 2037); i++) {
        ctx.sendMessage(`<pre>${text.substring(i * 2037, (i + 1) * 2037)}</pre>`, { parse_mode: "HTML" }).catch(logger.error)
    }
})

commands.command('status', async ctx => {
    try {
        if (ctx.chat.type === 'private') {
            const userId = ctx.message.from.id
            const size = await getTotalSizeRaw('public/dl')
            let text = `Total used space: ${convertBytes(size)}`
            const myDLs = await prisma.download.findMany({
                where: {
                    tgId: String(userId),
                    status: "active",
                }
            })
            if (myDLs && myDLs.length > 0) {
                text += `\n\nMy files:\n${myDLs.map((dl, i) => {
                    const name = dl.path.split('/').pop()
                    const size = convertBytes(dl.size)
                    return `${i + 1}. <a href="${dl.link}">${name}</a> (${size})`
                })}`
            }
            ctx.replyWithHTML(text)
        }
    } catch (error) {
        logger.log(error)
        ctx.replyWithHTML('Oops! Some random sprites ate the previous command\'s response')
    }
})

commands.command('clear', async ctx => {
    if (ctx.chat.type === 'private') {
        const userId = ctx.message.from.id
        try {
            const myDLs = await prisma.download.findMany({
                where: {
                    tgId: String(userId),
                    status: "active",
                }
            })
            let text = 'Deleted files:'
            for (const dl of myDLs) {
                await unlink(dl.path).then(async () => {
                    await updateCurrentSize(Number(dl.size), true)
                    const bytes = convertBytes(Number(dl.size || 0))
                    text += `\n${dl.path} (${bytes})`
                }).catch(logger.error)
            }
            await ctx.replyWithHTML(text)
            await prisma.download.updateMany({
                where: {
                    tgId: String(userId),
                    status: "active",
                },
                data: {
                    status: "inactive"
                }
            })
        } catch (error) {
            logger.error(error)
            await ctx.replyWithHTML('I put a spoon in the microwave and something bad happened!')
        }
    }
})

commands.command('config', async ctx => {
    if (ctx.chat.type === 'private') {
        const config = await getConfig()
        const text = config ? `Current configuration:\n${Number(config.currentSize).toFixed(2)}/${Number(config.maxSize)}GB\nURL: ${config.downloadURL}` : "No config found!"
        ctx.sendMessage(text, { parse_mode: "HTML" })
    }
})
