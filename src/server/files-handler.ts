import 'server-only'
import syncFs from 'node:fs'
import fs from 'node:fs/promises'
import path from 'node:path'
import { createCUID } from '@/lib/cuid'





type FileExts = '.png' | '.jpg'

export async function saveBlogImage(image: string, ext: FileExts = ".jpg"): Promise<string | null> {
    const imageBlob = await fetch(image).then(res => res.blob(), () => null)
    if (!imageBlob) return null;
    const now = new Date()
    const blogsFolder = `/blogs-images/${now.getFullYear()}/${now.getMonth() + 1}`;
    const filepath = `${blogsFolder}/${createCUID()}${ext}`;
    const absoluteBlogsFolder = path.join(process.cwd(), "public", blogsFolder)
    try {
        if (!syncFs.existsSync(absoluteBlogsFolder)) {
            syncFs.mkdirSync(absoluteBlogsFolder, { recursive: true })
        }
        await fs.writeFile(
            path.join(process.cwd(), "public", filepath),
            Buffer.from(await imageBlob.arrayBuffer())
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

