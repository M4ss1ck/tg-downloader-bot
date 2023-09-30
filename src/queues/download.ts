import { Queue, Worker, QueueEvents, MetricsTime } from 'bullmq';
import { logger } from '../logger/index.js';

const connection = {
    host: "localhost",
    port: 6379
}

export const downloader = new Queue('dl', { connection });
export const queueEvents = new QueueEvents('dl', { connection });
export const worker = new Worker('dl', async job => {
    logger.log(job.data);
}, {
    concurrency: 1,
    connection,
    metrics: {
        maxDataPoints: MetricsTime.ONE_WEEK * 4,
    },
});

worker.on('completed', job => {
    logger.log(`${job.id} has completed!`);
    // schedule the deletion
});

worker.on('failed', (job, err) => {
    if (job) {
        logger.log(`${job.id} has failed with ${err.message}`);
    }
});

worker.on('error', err => {
    // log the error
    logger.error(err);
});

queueEvents.on('completed', ({ jobId, returnvalue }) => {
    // Called every time a job is completed in any worker.
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
    // jobId received a progress event
});

queueEvents.on('progress', ({ jobId, data }) => {
    // jobId received a progress event
});
