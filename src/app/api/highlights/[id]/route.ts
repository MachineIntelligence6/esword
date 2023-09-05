import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: { id: string } }

// Get By Id
export async function GET(req: Request, { params }: RouteParams) {
    const res = await serverApiHandlers.bookmarks.getById(Number(params.id))
    return NextResponse.json(res)
}


// Delete
export async function DELETE(req: Request, { params }: RouteParams) {
    const res = await serverApiHandlers.bookmarks.archive(Number(params.id))
    return NextResponse.json(res)
}

