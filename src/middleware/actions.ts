import { Composer, Markup, Input } from "telegraf";
import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";
import { csvExport } from "../utils/csvExport.js";
import { unlink } from "fs/promises";

export const actions = new Composer()

actions.action(/^exportAll_\d+/i, async ctx => {
    if ('data' in ctx.callbackQuery) {
        const userId = ctx.callbackQuery.data.replace(/^exportAll_/i, '').trim()
        if (!ctx.from || ctx.from.id.toString() !== userId) {
            await ctx.answerCbQuery('this is not your data')
        }
        await ctx.answerCbQuery().catch(logger.error)
    }
})