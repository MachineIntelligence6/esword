import { User } from '@prisma/client'
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'


export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const user = (req.nextauth.token as { user: User | null }).user
        if (req.nextUrl.pathname.startsWith("/dashboard") && user?.role === "VIEWER") {
            return NextResponse.redirect(new URL("/", req.url))
        }
    },
    {
        callbacks: {
            authorized: (params) => {
                return !!params.token
            }
        },
        pages: {
            signIn: "/login"
        }
    }
)


// export const config = {
//     matcher: ["/((?!login|$).*)"],
// };