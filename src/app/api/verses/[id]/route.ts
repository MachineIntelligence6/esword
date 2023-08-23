import serverApiHandlers from "@/server/handlers"
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server"




type RouteParams = { params: { id: string } }

// Get By Id
export async function GET(req: Request, { params }: RouteParams) {
    const searchParams = new URLSearchParams(req.url.split("?")[1])
    const includeStr = searchParams.get("include")
    let include: Prisma.VerseInclude | undefined;
    try {
        include = JSON.parse(includeStr ?? "")
    } catch (error) {
    }
    const res = await serverApiHandlers.verses.getById(parseInt(params.id), include)
    return NextResponse.json(res)
}

// Update
export async function PUT(req: Request, { params }: RouteParams) {
    const res = await serverApiHandlers.verses.update(req, parseInt(params.id))
    return NextResponse.json(res)
}

// Delete
export async function DELETE(req: Request, { params }: RouteParams) {
    const res = await serverApiHandlers.verses.archive(parseInt(params.id))
    return NextResponse.json(res)
}

