import { Job } from "bullmq"
import { bot } from "../bot.js"
import { logger } from "../logger/index.js"
import { prisma } from "../db/prisma.js"
import { cp, unlink } from "fs/promises"
import { __dirname } from "./getSize.js"
import { getConfig } from "./config.js"
import { URL_PREFIX } from "../config/index.js"

export const downloadFile = async (job: Job) => {
    logger.info('Processing job ' + job.id)
    const { name, size, user, path, msgId } = job.data.data
    console.log({ name, size, user, path })
    try {
        if (!path) {
            throw new Error('No url received')
        }
        let filename = name
        if (!name) {
            const index = String(path).lastIndexOf('/')
            filename = String(path).substring(index + 1)
        }
        await cp(path, __dirname + "/public/dl/" + filename)
        const link = URL_PREFIX + "/dl/" + filename
        logger.success('Link: ' + link)
        await bot.telegram.sendMessage(user, `File uploaded, you can find it <a href="${link}">here</a>`, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        })
        if (user && msgId) {
            await bot.telegram.deleteMessage(user, msgId).catch(logger.error)
        }
        await unlink(path)
    } catch (error) {
        logger.error(error)
        await bot.telegram.sendMessage(user, `Failure copying the file.\nPath: ${path ?? "n/a"}`, {
            parse_mode: "HTML",
        })
        throw new Error('Error in downloadFile()')
    }
}