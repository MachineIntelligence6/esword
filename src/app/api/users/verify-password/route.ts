import serverApiHandlers from "@/server/handlers"
import { NextResponse } from "next/server"




export async function POST(req: Request) {
    const res = await serverApiHandlers.users.verifyPassword(req)
    return NextResponse.json(res)
}


