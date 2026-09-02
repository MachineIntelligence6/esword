import 'server-only'
import syncFs from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createCUID } from '@/lib/cuid'





type FileExts = '.png' | '.jpg'

const MAX_BLOG_IMAGE_BYTES = 2 * 1024 * 1024

function decodeBlogImage(image: string): { buffer: Buffer, ext: FileExts } | null {
    const match = image.match(/^data:image\/(png|jpe?g);base64,([A-Za-z0-9+/=\s]+)$/)
    if (!match) return null

    const ext: FileExts = match[1] === "png" ? ".png" : ".jpg"
    const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64")
    if (!buffer.length || buffer.length > MAX_BLOG_IMAGE_BYTES) return null

    const isPng = buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[buffer.length - 2] === 0xff && buffer[buffer.length - 1] === 0xd9
    if ((ext === ".png" && !isPng) || (ext === ".jpg" && !isJpeg)) return null

    return { buffer, ext }
}

export async function saveBlogImage(image: string): Promise<string | null> {
    const decodedImage = decodeBlogImage(image)
    if (!decodedImage) return null;
    const now = new Date()
    const blogsFolder = `/blogs-images/${now.getFullYear()}/${now.getMonth() + 1}`;
    const filepath = `${blogsFolder}/${createCUID()}${decodedImage.ext}`;
    const absoluteBlogsFolder = path.join(process.cwd(), "public", blogsFolder)
    try {
        if (!syncFs.existsSync(absoluteBlogsFolder)) {
            syncFs.mkdirSync(absoluteBlogsFolder, { recursive: true })
        }
        await fs.writeFile(
            path.join(process.cwd(), "public", filepath),
            decodedImage.buffer
        )
        return filepath
    } catch (error) {
        console.log("Image Saving To Static Folder Error = ", error)
        return null
    }
}

export async function readFileFromStaticFolder(filePath: string) {
    const absolutePath = path.join(process.cwd(), "static-files", filePath)
    try {
        return fs.readFile(absolutePath)
    } catch (error) {
        return undefined
    }
}

