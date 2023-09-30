import { Composer } from "telegraf"
import { message } from "telegraf/filters"
import { logger } from "../logger/index.js"
import { downloader } from "../queues/download.js"

export const files = new Composer()

files.on([message('document'), message('video'), message('photo'), message('audio')], async ctx => {
    logger.info(ctx.message)
    try {
        const user = ctx.message.from
        if ('document' in ctx.message) {
            const { file_id, file_name, file_size } = ctx.message.document
            const { file_path } = await ctx.telegram.getFile(file_id)
            const downloadObject = {
                name: file_name,
                size: file_size,
                user: user.id,
                url: file_path,
            }
            const job = await downloader.add(`${user.id}-${file_name ?? Date.now()}`, { data: downloadObject })
            console.log(job.data)
            return ctx.replyWithHTML('Document was added to queue')
        }
    } catch (error) {
        logger.error(error)
        return ctx.replyWithHTML('I forgot my cat in the fridge and couldn\'t add the file to queue')
    }
})
