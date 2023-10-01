import { prisma } from "../db/prisma.js";
import { logger } from "../logger/index.js";

export const getConfig = async () => {
    return prisma.config.findUnique({
        where: {
            id: 'global'
        }
    })
}

/**
 * Update the value of currentSize (GB) in the database
 * @param value size in bytes
 * @param negative this is telling us if we need to increment or decrement. True for decrements, false by default.
 * @returns 
 */
export const updateCurrentSize = async (value: number, negative = false) => {
    let increment = Number(value / Math.pow(1024, 3))
    if (negative) {
        increment *= -1
    }
    logger.info('received value: ' + value + ' and processed as ' + increment)
    return prisma.config.update({
        where: {
            id: 'global'
        },
        data: {
            currentSize: {
                increment,
            }
        }
    })
}

export const updateMaxSize = async (value: number) => {
    return prisma.config.update({
        where: {
            id: 'global'
        },
        data: {
            maxSize: value
        }
    })
}

export const setCurrentSize = async (value: number) => {
    return prisma.config.update({
        where: {
            id: 'global'
        },
        data: {
            currentSize: value
        }
    })
}
