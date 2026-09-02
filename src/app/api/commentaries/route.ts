import defaults from "@/shared/constants/defaults"
import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { getSearchParams, parseIdListParam, parseIntegerParam, parseJsonParam } from "@/server/request-query"


export const GET = async (req: Request) => {
    const params = getSearchParams(req)
    const page = parseIntegerParam(params, "page", 1, { min: 1 })
    const perPage = parseIntegerParam(params, "perPage", defaults.PER_PAGE_ITEMS, { min: -1 })
    const author = parseIntegerParam(params, "author", -1, { min: -1 })
    const verse = parseIntegerParam(params, "verse", -1, { min: -1 })
    const include = parseJsonParam<Prisma.CommentaryInclude>(params, "include")
    const where = parseJsonParam<Prisma.CommentaryWhereInput>(params, "where")
    const orderBy = parseJsonParam<Prisma.CommentaryOrderByWithRelationInput>(params, "orderBy")

    const res = await serverApiHandlers.commentaries.getAll({ page, perPage, verse, author, include, where, orderBy })
    return NextResponse.json(res)
}


export async function POST(req: Request) {
    const res = await serverApiHandlers.commentaries.create(req)
    return NextResponse.json(res)
}

export async function DELETE(req: Request) {
    const params = getSearchParams(req)
    const ids = parseIdListParam(params, "ids")
    const res = await serverApiHandlers.commentaries.archiveMany(ids)
    return NextResponse.json(res)
}