import { randomBytes, randomUUID } from "crypto"
import { AuthOptions, Session, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import db from "@/server/db"
import bcrypt from 'bcryptjs'
import { SessionUser } from "@/shared/types/models.types"

const MIN_NEXTAUTH_SECRET_LENGTH = 32
const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000
const MAX_LOGIN_ATTEMPTS = 5
const loginAttempts = new Map<string, { count: number, resetAt: number }>()

export function getValidatedNextAuthSecret() {
    const secret = process.env.NEXTAUTH_SECRET
    if (process.env.NODE_ENV === "production") {
        if (!secret || secret.length < MIN_NEXTAUTH_SECRET_LENGTH) {
            throw new Error("NEXTAUTH_SECRET must be set to at least 32 characters. Generate one with: openssl rand -base64 32")
        }
    }
    return secret || "development-only-nextauth-secret-change-before-production"
}

function normalizeLoginIdentifier(email?: string) {
    return (email ?? "").trim().toLowerCase()
}

function isLoginRateLimited(identifier: string) {
    const attempt = loginAttempts.get(identifier)
    if (!attempt) return false
    if (Date.now() > attempt.resetAt) {
        loginAttempts.delete(identifier)
        return false
    }
    return attempt.count >= MAX_LOGIN_ATTEMPTS
}

function recordFailedLogin(identifier: string) {
    const now = Date.now()
    const current = loginAttempts.get(identifier)
    if (!current || now > current.resetAt) {
        loginAttempts.set(identifier, { count: 1, resetAt: now + LOGIN_ATTEMPT_WINDOW_MS })
        return
    }
    loginAttempts.set(identifier, { count: current.count + 1, resetAt: current.resetAt })
}

function clearFailedLogins(identifier: string) {
    loginAttempts.delete(identifier)
}


export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            credentials: {
                email: {
                    type: "email",
                    label: "Email",
                    placeholder: "example@domain.com",
                },
                password: {
                    type: "password",
                    label: "Password",
                },
            },
            async authorize(credentials) {
                const { email, password } = credentials as { email: string, password: string }
                const loginIdentifier = normalizeLoginIdentifier(email)
                if (isLoginRateLimited(loginIdentifier)) throw new Error("RATE_LIMITED")
                const user = await db.user.findFirst({
                    where: {
                        email: loginIdentifier,
                        archived: false,
                    },
                })
                if (!user) {
                    recordFailedLogin(loginIdentifier)
                    throw new Error("INVALID_CREDENTIALS")
                }
                if (!(await comparePassword(password, user.password))) {
                    recordFailedLogin(loginIdentifier)
                    throw new Error("INVALID_CREDENTIALS")
                }
                clearFailedLogins(loginIdentifier)
                return { ...user, id: user.id.toString(), password: "" }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 4 * 60 * 60,
        generateSessionToken: () => {
            return randomUUID?.() ?? randomBytes(32).toString("hex")
        },
    },
    pages: {
        signIn: "/login",
        signOut: "/login",
        error: "/login",
    },
    secret: getValidatedNextAuthSecret(),
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user
            }
            return token
        },
        async session({ session, token }) {
            if (token.user) {
                session.user = token.user as SessionUser
            }
            return session
        },
    },
}


export async function getServerAuth(): Promise<Session | null | false> {
    const session = await getServerSession(authOptions)
    if (!session?.user) return null
    const user = await db.user.findFirst({ where: { id: Number(session.user.id) } })
    if (!user) return false;
    return {
        ...session,
        user: {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role,
            archived: user.archived,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            archivedAt: user.archivedAt,
            image: user.image
        }
    }
}



export async function hashPassword(password: string) {
    try {
        return bcrypt.hash(password, 12)
    } catch (error) {
        return null
    }
}
export async function comparePassword(plainPassword: string, hashedPassword: string) {
    try {
        return bcrypt.compare(plainPassword, hashedPassword)
    } catch (error) {
        return false
    }
}