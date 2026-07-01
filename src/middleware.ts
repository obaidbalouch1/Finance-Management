import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by API route auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, other icons
     * - public files (png, jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
}
