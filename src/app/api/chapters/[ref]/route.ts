import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: Promise<{ ref: string }> }

// Get By Slug
export async function GET(req: Request, { params }: RouteParams) {
    const { ref } = await params
    const res = await serverApiHandlers.chapters.getByRef(ref)
    return NextResponse.json(res)
}

// Update
export async function PUT(req: Request, { params }: RouteParams) {
    const { ref } = await params
    const res = await serverApiHandlers.chapters.update(req, parseInt(ref))
    return NextResponse.json(res)
}

// Delete
export async function DELETE(req: Request, { params }: RouteParams) {
    const { ref } = await params
    const res = await serverApiHandlers.chapters.archive(parseInt(ref))
    return NextResponse.json(res)
}

