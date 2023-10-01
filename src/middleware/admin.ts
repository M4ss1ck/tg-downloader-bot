import { Composer, Markup, Input } from "telegraf";
import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";
import { ADMIN_ID } from "../config/index.js";
import { updateMaxSize } from "../utils/config.js";

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

admin.command('max', Composer.acl(parseInt(ADMIN_ID), async ctx => {
    const value = ctx.message.text.replace(/^\/max\s+/i, '').trim()
    await updateMaxSize(Number(value))
    ctx.reply('The maximum size for the queue was set to ' + value + 'GB')
}))