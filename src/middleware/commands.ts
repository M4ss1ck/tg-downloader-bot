import { Composer, Markup, Input } from "telegraf";
import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";
import { csvExport } from "../utils/csvExport.js";
import { unlink } from "fs/promises";

export const commands = new Composer()

commands.command('get', async ctx => {
    if (ctx.chat.type === 'private') {
        const username = ctx.message.text.replace(/^\/get(@\w+)?/, '').trim()

    }
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