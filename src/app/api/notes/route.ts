import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"


export const GET = async (req: Request) => {
    const params = new URLSearchParams(req.url.split("?")[1])
    const page = parseInt(params.get("page") ?? "1")
    const perPage = parseInt(params.get("perPage") ?? `${defaults.PER_PAGE_ITEMS}`)
    const user = parseInt(params.get("user") ?? "-1")
    const verse = parseInt(params.get("verse") ?? "-1")
    const includeStr = params.get("include")
    let include: Prisma.NoteInclude | undefined;
    try {
        include = JSON.parse(includeStr ?? "")
    } catch (error) {
    }

    const res = await serverApiHandlers.notes.getAll({ page, perPage, verse: verse, user: user, include: include })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.notes.create(req)
    return NextResponse.json(res)
}