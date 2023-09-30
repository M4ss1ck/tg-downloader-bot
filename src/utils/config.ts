import { prisma } from "../db/prisma.js";

export const getConfig = async () => {
    return prisma.config.findUnique({
        where: {
            id: 'global'
        }
    })
}