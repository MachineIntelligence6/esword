import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: Promise<{ id: string }> }

// Get By Id
export async function GET(req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.highlights.getById(Number(id))
    return NextResponse.json(res)
}


// Delete
export async function DELETE(req: Request, { params }: RouteParams) {
    const { id } = await params
    const res = await serverApiHandlers.highlights.archive(Number(id))
    return NextResponse.json(res)
}

