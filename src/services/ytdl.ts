import ytdl from "ytdl-core"
import { createWriteStream } from "fs"

export const processLink = async (url: string, quality: number, user: string, path: string) => {
    return new Promise((resolve, reject) => {
        try {
            console.log('calling processLink()\n====================')
            const dl = ytdl(url, { quality })
            dl.pipe(createWriteStream(path))
            dl.on('error', err => {
                console.log(err)
                reject(err)
            })
            dl.on('close', () => {
                console.log('close listener')
                resolve('closed')
            })
            dl.on('finish', () => {
                console.log('finish listener')
                resolve('download finished!')
            })
            dl.on('progress', (data) => {
                console.log('progress listener')
                console.log(data)
            })
        } catch (error) {
            console.log(error)
            reject(error)
        }
    })
}