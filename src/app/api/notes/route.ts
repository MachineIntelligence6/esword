import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getSearchParams, parseIntegerParam, parseJsonParam } from "@/server/request-query"


export const GET = async (req: Request) => {
    const params = getSearchParams(req)
    const page = parseIntegerParam(params, "page", 1, { min: 1 })
    const perPage = parseIntegerParam(params, "perPage", defaults.PER_PAGE_ITEMS, { min: -1 })
    const user = parseIntegerParam(params, "user", -1, { min: -1 })
    const verse = parseIntegerParam(params, "verse", -1, { min: -1 })
    const include = parseJsonParam<Prisma.NoteInclude>(params, "include")
    const where = parseJsonParam<Prisma.NoteWhereInput>(params, "where")
    const orderBy = parseJsonParam<Prisma.NoteOrderByWithRelationInput>(params, "orderBy")

    const res = await serverApiHandlers.notes.getAll({ page, perPage, verse, user, include, where, orderBy })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.notes.create(req)
    return NextResponse.json(res)
}