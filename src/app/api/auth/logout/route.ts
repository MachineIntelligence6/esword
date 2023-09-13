import { NextResponse } from "next/server"




export const GET = async (req: Request) => {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("next-auth.session-token");
    return response
}
