import { randomBytes, randomUUID } from "crypto"
import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import db from "@/server/db"
import bcrypt from 'bcryptjs'



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
            async authorize(credentials, req) {
                const { email, password } = credentials as { email: string, password: string }
                const user = await db.user.findFirst({
                    where: {
                        email: email,
                    },
                })
                console.log(password)
                if (!user) throw new Error("User not found.")
                if (user.password !== password) throw new Error("Wrong password.")
                return user
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60,
        generateSessionToken: () => {
            return randomUUID?.() ?? randomBytes(32).toString("hex")
        },
    },
    pages: {
        // signIn: "/auth/signin",
        // signOut: "/auth/signin",
        // error: "/auth/signin",
    },
    secret: process.env.NEXTAUTH_SECRET as string,
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.name = user.name
                token.email = user.email
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.name = token.name
                session.user.email = token.email
            }
            return session
        },
    },
}




export async function hashPassword(password: string) {
    try {
        return bcrypt.hash(password, 10)
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