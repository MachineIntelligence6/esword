import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: Promise<{ id: string }> }

// Get By Slug
export async function GET(req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.authors.getById(parseInt(id))
    return NextResponse.json(res)
}

// Update
export async function PUT(req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.authors.update(req, parseInt(id))
    return NextResponse.json(res)
}

// Delete
export async function DELETE(req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.authors.archive(parseInt(id))
    return NextResponse.json(res)
}

