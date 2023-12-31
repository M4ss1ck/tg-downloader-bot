import { Queue, Worker, QueueEvents, MetricsTime, Job } from 'bullmq';
import { logger } from '../logger/index.js';
import { downloadFile } from '../utils/downloader.js';
import { downloadVideo } from '../utils/videoDownloader.js';

const connection = {
    host: "localhost",
    port: 6379
}

const handleJob = async (job: Job) => {
    if (job.data && job.data.data && job.data.data.type === "local") {
        return downloadFile(job)
    } else downloadVideo(job)
}

export const downloader = new Queue('dl', { connection });
export const queueEvents = new QueueEvents('dl', { connection });
export const worker = new Worker('dl', handleJob, {
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
