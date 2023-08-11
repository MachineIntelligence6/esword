import { User as PUser } from "@prisma/client";



declare module 'next-auth' {
    interface Session {
        user: Omit<PUser, "password">
    }
}

