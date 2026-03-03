import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@roastmyresume/db"

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await db.user.findUnique({
                    where: { email: credentials.email as string }
                })

                // If no user was found OR the user used Google OAuth (no password stored)
                // Note: For now, we mock the bcrypt.compare since we haven't implemented User registration hashing perfectly yet
                if (!user) return null

                // This simulates a hardcoded password for testing local dev easier before the signup flow is built
                if (credentials.password === 'password123' || credentials.password === 'test') {
                    return user
                }

                return null
            }
        }),
    ],
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // Add plan type or role to token if needed
            }
            return token
        },
        session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string
            }
            return session
        },
    },
})
