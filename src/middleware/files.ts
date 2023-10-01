import { Composer } from "telegraf"
import { message } from "telegraf/filters"
import { logger } from "../logger/index.js"
import { downloader } from "../queues/download.js"
import { getConfig, updateCurrentSize } from "../utils/config.js"
import { convertBytes, getTotalSizeRaw } from "../utils/getSize.js"

export const files = new Composer()

files.on([message('document'), message('video'), message('audio')], async ctx => {
    logger.info(ctx.message)
    try {
        const user = ctx.message.from
        const msgId = ctx.message.message_id
        let name, size, path
        if ('document' in ctx.message) {
            const { file_id, file_name, file_size } = ctx.message.document
            const { file_path } = await ctx.telegram.getFile(file_id)
            name = file_name ?? `document_${Date.now()}`
            size = file_size
            path = file_path
        } else if ('video' in ctx.message) {
            const { file_id, file_name, file_size, mime_type } = ctx.message.video
            const { file_path } = await ctx.telegram.getFile(file_id)
            name = file_name ?? `video_${Date.now()}`
            size = file_size
            path = file_path
        } else if ('audio' in ctx.message) {
            const { file_id, file_name, file_size, mime_type } = ctx.message.audio
            const { file_path } = await ctx.telegram.getFile(file_id)
            name = file_name ?? `audio_${Date.now()}`
            size = file_size
            path = file_path
        }
        const config = await getConfig()
        // check if there's enough space
        // maxSize and currentSize are GBs
        if (config && size && Number((config.maxSize - config.currentSize) * Math.pow(1024, 3)) < Number(size)) {
            await ctx.deleteMessage().catch(logger.error)
            return ctx.replyWithHTML(`There is not enough available space\nAvailable: ${Number(config.maxSize - config.currentSize).toFixed(1)}GB\n${name ?? 'This file'}: ${convertBytes(size)}\nAnyways, I'll delete it.`)
        } else if (!config || !size) {
            await ctx.deleteMessage().catch(logger.error)
            return ctx.replyWithHTML('There is no size data available for this file. That or I messed up... Who knows...\n\n<em>Deleting...</em>')
        }

        // update currentSize to include newly added file
        await updateCurrentSize(size)

        const downloadObject = {
            name,
            size,
            user: user.id,
            path,
            msgId,
        }
        const job = await downloader.add(`${user.id}-${name ?? Date.now()}`, { data: downloadObject })
        console.log(job.data)
        return ctx.replyWithHTML('Document was added to queue')
    } catch (error) {
        logger.error(error)
        return ctx.replyWithHTML('I forgot my cat in the fridge and couldn\'t add the file to queue')
    }
})
