import { Composer, Markup, Input } from "telegraf";
import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";
import { ADMIN_ID } from "../config/index.js";
import { updateMaxSize } from "../utils/config.js";
import { unlink } from "fs/promises";
import { updateCurrentSize } from "../utils/config.js";
import { convertBytes } from "../utils/getSize.js";

export const admin = new Composer()

admin.command('add', Composer.acl(parseInt(ADMIN_ID), async ctx => {
    const tgId = ctx.message.text.replace(/^\/add\s+/i, '').trim()
    await prisma.user.upsert({
        where: {
            tgId,
        },
        update: {},
        create: {
            tgId,
        }
    })
        .then(() => ctx.reply('User added'))
        .catch(() => ctx.reply('Error with prisma call'))
}))

admin.command('reset', Composer.acl(parseInt(ADMIN_ID), async ctx => {
    if (ctx.chat.type === 'private') {
        try {
            const downloads = await prisma.download.findMany({
                where: {
                    status: "active",
                }
            })
            let text = 'Deleted files:'
            for (const dl of downloads) {
                await unlink(dl.path).then(async () => {
                    await updateCurrentSize(Number(dl.size), true)
                    const bytes = convertBytes(Number(dl.size || 0))
                    text += `\n${dl.path} (${bytes})`
                }).catch(logger.error)
            }
            await ctx.replyWithHTML(text)
            await prisma.download.updateMany({
                where: {
                    status: "active",
                },
                data: {
                    status: "inactive"
                }
            })
        } catch (error) {
            logger.error(error)
            await ctx.replyWithHTML('Error deleting all downloads.')
        }
    }
}))

admin.command('max', Composer.acl(parseInt(ADMIN_ID), async ctx => {
    const value = ctx.message.text.replace(/^\/max\s+/i, '').trim()
    await updateMaxSize(Number(value))
    ctx.reply('The maximum size for the queue was set to ' + value + 'GB')
}))