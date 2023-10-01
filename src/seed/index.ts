import { PrismaClient } from "@prisma/client";
import { logger } from "../logger/index.js";
import { ADMIN_ID, URL_PREFIX } from "../config/index.js";
import { getTotalSizeRaw } from "../utils/getSize.js";

const prisma = new PrismaClient();

const seed = async () => {
    await prisma.user.upsert({
        where: {
            tgId: ADMIN_ID
        },
        update: {},
        create: {
            tgId: ADMIN_ID,
            name: "Admin"
        }
    }).then(res => logger.info(res))

    const currentSize = await getTotalSizeRaw('public/dl')
    await prisma.config.upsert({
        where: {
            id: 'global'
        },
        update: {
            downloadURL: URL_PREFIX + '/dl/',
            currentSize,
        },
        create: {
            downloadURL: URL_PREFIX + '/dl/',
            currentSize,
        }
    }).then(res => logger.info(res))
}

seed()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });  