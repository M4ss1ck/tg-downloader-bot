import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from 'url';

export const __filename = fileURLToPath(import.meta.url);
// Downloads directory is outside `dist`
export const __dirname = path.dirname(__filename).replace('/dist/utils', '');

export const getAllFiles = async function (dirPath: string, arrayOfFiles: string[] | null = null) {
    const files = await fs.readdir(dirPath)

    let newArrayOfFiles = arrayOfFiles || []

    for (const file of files) {
        if ((await fs.stat(dirPath + "/" + file)).isDirectory()) {
            newArrayOfFiles = await getAllFiles(dirPath + "/" + file, newArrayOfFiles)
        } else {
            newArrayOfFiles.push(path.join(__dirname, dirPath, file))
        }
    }

    return newArrayOfFiles
}

export const convertBytes = function (bytes: number) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]

    if (bytes == 0) {
        return "n/a"
    }

    const i = Number(Math.floor(Math.log(bytes) / Math.log(1024)))

    if (i == 0) {
        return bytes + " " + sizes[i]
    }

    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i]
}

export const getTotalSizeRaw = async function (directoryPath: string) {
    console.log(__dirname);
    const arrayOfFiles = await getAllFiles(directoryPath)

    let totalSize = 0

    for (const filePath of arrayOfFiles) {
        totalSize += (await fs.stat(filePath)).size
    }

    return totalSize
}

export const getTotalSize = async (directoryPath: string) => {
    const size = await getTotalSizeRaw(directoryPath)
    return convertBytes(size)
}