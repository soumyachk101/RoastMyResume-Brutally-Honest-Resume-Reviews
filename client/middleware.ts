import { auth } from "@/auth"
import { NextResponse } from "next/server"

// Define paths that require authentication
const protectedRoutes = ["/dashboard"]

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req

    const isProtectedRoute = protectedRoutes.some(route =>
        nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/", nextUrl))
    }

    return NextResponse.next()
})

// Optionally, don't invoke Middleware on some paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
