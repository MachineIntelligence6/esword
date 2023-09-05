import { User } from '@prisma/client'
import { NextRequestWithAuth, withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { canUserAccessPath } from './lib/roles-manager'
import { ApiResponse } from './shared/types/api.types'
import { SessionUser } from './shared/types/models.types'


const unauthorizedRes: ApiResponse<null> = {
    succeed: false,
    code: "UNAUTHORIZED"
}


export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        const user = (req.nextauth.token as { user: SessionUser | null }).user
        if (!user) return NextResponse.redirect(new URL("/login", req.url))
        // Dashboard Global Restrictions
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
            if (user?.role !== "ADMIN" && user?.role !== "EDITOR") {
                return NextResponse.redirect(new URL("/", req.url))
            }
            if (!canUserAccessPath(user, req.nextUrl.pathname)) {
                return NextResponse.redirect(new URL("/dashboard", req.url))
            }
        }
        // Api Global Restrictions
        if (req.nextUrl.pathname.startsWith("/api")) {
            if (req.method.toLowerCase() === "delete" && user.role !== "ADMIN") {
                return NextResponse.json(unauthorizedRes)
            }
        }
        if (req.nextUrl.pathname.startsWith("/api/activities") && user.role !== "ADMIN") {
            return NextResponse.json(unauthorizedRes)
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