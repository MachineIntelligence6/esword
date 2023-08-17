import { SessionUser } from "./models.types";

declare module 'next-auth' {
    interface Session {
        user: SessionUser
    }
}

