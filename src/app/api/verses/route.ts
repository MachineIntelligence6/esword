import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"


export const GET = async (req: Request) => {
    const params = new URLSearchParams(req.url.split("?")[1])
    const page = parseInt(params.get("page") ?? "1")
    const perPage = parseInt(params.get("perPage") ?? `${defaults.PER_PAGE_ITEMS}`)
    const topic = parseInt(params.get("topic") ?? "-1")
    const includeStr = params.get("include")
    let include: Prisma.VerseInclude | undefined;
    try {
        include = JSON.parse(includeStr ?? "")
    } catch (error) {
    }

    const res = await serverApiHandlers.verses.getAll({ page, perPage, topic, include: include })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.verses.create(req)
    return NextResponse.json(res)
}