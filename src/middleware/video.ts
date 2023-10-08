import { Composer, Markup } from "telegraf"
import ytdl from 'ytdl-core'
import { downloader } from "../queues/download.js"
import { convertBytes } from "../utils/getSize.js"
import { addTempLink, getTempLink } from "../utils/videoDownloader.js"
import { logger } from "../logger/index.js"

export const video = new Composer()

video.command(['dl', 'url'], async ctx => {
    if (ctx.chat.type === 'private') {
        try {
            const user = ctx.message.from
            const [url, name] = ctx.message.text.replace(/^\/(dl|url)\s+/, '').split(' ')
            // TODO: validate url
            const info = await ytdl.getInfo(url)
            const btnLabels = info.formats.map(f => `[${f.container}]${f.hasVideo ? `[${f.qualityLabel}] ${f.height ?? 'n/a'}x${f.width ?? 'n/a'} ` : ''} Video: ${f.hasVideo ? '✅' : '❌'} Audio: ${f.hasAudio ? '✅' : '❌'} (${convertBytes(Number(f.contentLength ?? '0'))})`)
            const iTags = info.formats.map(f => `${f.itag}_${f.container}`)
            console.log(info)
            // add to database to fetch a given format later
            const { id } = await addTempLink(url, String(user.id), info.videoDetails.title)

            const buttons = btnLabels.map((label, i) => [Markup.button.callback(label, `dl_${id}_${iTags[i]}`)])
            const keyboard = Markup.inlineKeyboard(buttons)
            // const job = await downloader.add(`${user.id}-${name ?? Date.now()}`, { data: downloadObject })
            // console.log(job.data)
            const text = `${info.videoDetails.title ?? 'Title n/a'}\n\nList of available formats:\n${btnLabels.join('\n')}`
            return ctx.replyWithHTML(text, keyboard)
        } catch (error) {
            console.error(error)
            return ctx.replyWithHTML('I forgot my cat in the fridge and couldn\'t add the file to queue')
        }
    }
})

video.action(/dl_(\d+)_(\d+)/, async ctx => {
    if ('data' in ctx.callbackQuery) {
        const [urlId, quality, ext] = ctx.callbackQuery.data.replace(/^dl_/, '').split('_')
        if (!urlId || !quality) return ctx.answerCbQuery('Error with request, try a different option.', { show_alert: true }).catch(logger.error)

        const link = await getTempLink(Number(urlId))
        if (!link) return ctx.answerCbQuery('Error with request, try a different option.', { show_alert: true }).catch(logger.error)

        // const file = ytdl(link.url, {quality})

        const downloadObject = {
            name: `${ctx.callbackQuery.data}.${ext}`,
            user: link.tgId,
            url: link.url,
            quality: quality,
            type: 'external'
        }
        const job = await downloader.add(`${ctx.callbackQuery.data}`, { data: downloadObject })
        console.log(job.data)
        return ctx.answerCbQuery('Download was added to queue.', { show_alert: true }).catch(logger.error)
    }
})

const urls = /^(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?\/[a-zA-Z0-9]{2,}|((https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z]{2,}(\.[a-zA-Z]{2,})(\.[a-zA-Z]{2,})?)|(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}\.[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})?$/

video.hears(urls, async ctx => {
    if (ctx.chat.type === 'private') {
        try {
            const user = ctx.message.from
            const url = ctx.message.text
            const info = await ytdl.getInfo(url)
            const btnLabels = info.formats.map(f => `[${f.container}]${f.hasVideo ? `[${f.qualityLabel}] ${f.height ?? 'n/a'}x${f.width ?? 'n/a'} ` : ''} Video: ${f.hasVideo ? '✅' : '❌'} Audio: ${f.hasAudio ? '✅' : '❌'} (${convertBytes(Number(f.contentLength ?? '0'))})`)
            const iTags = info.formats.map(f => `${f.itag}_${f.container}`)
            console.log(info)
            // add to database to fetch a given format later
            const { id } = await addTempLink(url, String(user.id), info.videoDetails.title)

            const buttons = btnLabels.map((label, i) => [Markup.button.callback(label, `dl_${id}_${iTags[i]}`)])
            const keyboard = Markup.inlineKeyboard(buttons)
            // const job = await downloader.add(`${user.id}-${name ?? Date.now()}`, { data: downloadObject })
            // console.log(job.data)
            const text = `${info.videoDetails.title ?? 'Title n/a'}\n\nList of available formats:\n${btnLabels.join('\n')}`
            return ctx.replyWithHTML(text, keyboard)
        } catch (error) {
            console.error(error)
            return ctx.replyWithHTML('I forgot my cat in the fridge and couldn\'t add the file to queue')
        }
    }
})
