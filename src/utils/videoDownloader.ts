import { Job } from "bullmq"
import { bot } from "../bot.js"
import { logger } from "../logger/index.js"
import { prisma } from "../db/prisma.js"
import { cp, unlink } from "fs/promises"
import { __dirname, getFileSize } from "./getSize.js"
import { getConfig, updateCurrentSize } from "./config.js"
import { URL_PREFIX } from "../config/index.js"
import { processLink } from "../services/ytdl.js"

export const addTempLink = async (url: string, tgId: string) => {
    return prisma.link.create({
        data: {
            tgId,
            url,
        }
    })
}

export const getTempLink = async (id: number) => {
    return prisma.link.findUnique({
        where: {
            id,
        }
    })
}

export const downloadVideo = async (job: Job) => {
    logger.info('[Download Video] Processing job ' + job.id)
    const { name, user, quality, url } = job.data.data
    console.log({ name, user, url, quality })

    try {
        let filename = name
        if (!name) {
            const index = String(url).lastIndexOf('/')
            filename = String(url).substring(index + 1)
        }

        const link = URL_PREFIX + "/dl/" + filename
        const path = __dirname + "/public/dl/" + filename

        await processLink(url, quality, user, path)

        const size = await getFileSize(path)
        // update currentSize to include newly added file
        await updateCurrentSize(size)

        logger.success('Link: ' + link)
        await bot.telegram.sendMessage(user, `File <em>${filename}</em> uploaded, you can find it <a href="${link}">here</a>`, {
            parse_mode: "HTML",
            disable_web_page_preview: true,
        })
        // if (user && msgId) {
        //     await bot.telegram.deleteMessage(user, msgId).catch(logger.error)
        // }
        await prisma.download.create({
            data: {
                tgId: user,
                link: link,
                path: path,
                size: Number(size || 0),
                status: "active",
            }
        }).catch(logger.error)
    } catch (error) {
        logger.error(error)
        await bot.telegram.sendMessage(user, `Failure downloading the video`, {
            parse_mode: "HTML",
        })
        throw new Error('Error in downloadVideo()')
    }
}