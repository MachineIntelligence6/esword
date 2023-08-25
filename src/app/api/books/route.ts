import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"


export const GET = async (req: Request) => {
    const params = new URLSearchParams(req.url.split("?")[1])
    const page = parseInt(params.get("page") ?? "1")
    const perPage = parseInt(params.get("perPage") ?? `${defaults.PER_PAGE_ITEMS}`)
    const includeStr = params.get("include")
    let include: Prisma.BookInclude | undefined;
    try {
        include = JSON.parse(includeStr ?? "")
    } catch (error) {
    }
    const whereStr = params.get("where")
    let where: Prisma.BookWhereInput | undefined;
    try {
        where = JSON.parse(whereStr ?? "")
    } catch (error) {
    }
    const orderByStr = params.get("orderBy")
    let orderBy: Prisma.BookOrderByWithRelationAndSearchRelevanceInput | undefined;
    try {
        orderBy = JSON.parse(orderByStr ?? "")
    } catch (error) {
    }

    const res = await serverApiHandlers.books.getAll({ page, perPage, include, where, orderBy })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.books.create(req)
    return NextResponse.json(res)
}


export async function DELETE(req: Request) {
    const params = new URLSearchParams(req.url.split("?")[1])
    const ids = params.get("ids")?.split(",")?.map((s) => Number(s)) ?? []
    const res = await serverApiHandlers.books.archiveMany(ids)
    return NextResponse.json(res)
}