import { Job } from "bullmq"
import { bot } from "../bot.js"
import { logger } from "../logger/index.js"
import { prisma } from "../db/prisma.js"
import { cp, unlink } from "fs/promises"
import { __dirname } from "./getSize.js"
import { getConfig } from "./config.js"

export const downloadFile = async (job: Job) => {
    logger.info('Processing job ' + job.id)
    try {
        const { name, size, user, url } = job.data
        if (!url) {
            throw new Error('No url received')
        }
        let filename = name
        if (!name) {
            const index = String(url).lastIndexOf('/')
            filename = String(url).substring(index + 1)
        }
        const link = __dirname + "/Downloads/" + filename
        await cp(url, link)
        await unlink(url)
        await bot.telegram.sendMessage(user, `File uploaded, you can find it <a href="${link}">here</a>`, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        })
    } catch (error) {
        logger.error(error)
        throw new Error('Error in downloadFile()')
    }
}