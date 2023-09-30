import { Job } from "bullmq"
import { bot } from "../bot.js"
import { logger } from "../logger/index.js"

export const downloadFile = async (job: Job) => {
    logger.info('Processing job ' + job.id)
    logger.log(job)
}