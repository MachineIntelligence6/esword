import apiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: { id: string } }

// Get By Slug
export async function GET(req: Request, { params }: RouteParams) {
    const res = await apiHandlers.verses.getById(parseInt(params.id))
    return NextResponse.json(res)
}

// Update
export async function PUT(req: Request, { params }: RouteParams) {
    const res = await apiHandlers.verses.update(req, parseInt(params.id))
    return NextResponse.json(res)
}

// Delete
export async function DELETE(req: Request, { params }: RouteParams) {
    const res = await apiHandlers.verses.archive(parseInt(params.id))
    return NextResponse.json(res)
}

