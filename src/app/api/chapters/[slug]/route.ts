import apiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




type RouteParams = { params: { slug: string } }

// Get By Slug
export async function GET(req: Request, { params }: RouteParams) {
    const res = await apiHandlers.chapters.getBySlug(params.slug)
    return NextResponse.json(res)
}

// Update
export async function PUT(req: Request, { params }: RouteParams) {
    const res = await apiHandlers.chapters.update(req, params.slug)
    return NextResponse.json(res)
}

