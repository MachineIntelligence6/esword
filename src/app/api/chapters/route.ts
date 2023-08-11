import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"


export const GET = async (req: Request) => {
    const params = new URLSearchParams(req.url.split("?")[1])
    const page = parseInt(params.get("page") ?? "1")
    const perPage = parseInt(params.get("perPage") ?? `${defaults.PER_PAGE_ITEMS}`)
    const book = parseInt(params.get("book") ?? "-1")
    const includeStr = params.get("include")
    let include: Prisma.ChapterInclude | undefined;
    try {
        include = JSON.parse(includeStr ?? "")
    } catch (error) {
    }

    console.log(includeStr)

    const res = await serverApiHandlers.chapters.getAll({ page, perPage, book, include: include })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.chapters.create(req)
    return NextResponse.json(res)
}