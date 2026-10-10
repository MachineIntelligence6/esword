import serverApiHandlers from "@/server/handlers"
import { getSearchParams, parseJsonParam } from "@/server/request-query"
import { sanitizeClientInclude } from "@/server/sanitize-include";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server"




type RouteParams = { params: Promise<{ id: string }> }

// Get By Id
export async function GET(req: Request, { params }: RouteParams) {
    const { id } = await params
    const searchParams = getSearchParams(req)
    const include = await sanitizeClientInclude(parseJsonParam<Prisma.VerseInclude>(searchParams, "include"))
    const res = await serverApiHandlers.verses.getById(parseInt(id), include)
    return NextResponse.json(res)
}

// Update
export async function PUT(req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.verses.update(req, parseInt(id))
    return NextResponse.json(res)
}

// Delete
export async function DELETE(req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.verses.archive(parseInt(id))
    return NextResponse.json(res)
}

