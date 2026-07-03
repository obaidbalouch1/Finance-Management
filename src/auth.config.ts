import type { NextAuthConfig } from "next-auth"

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const { pathname } = request.nextUrl

      // Defense-in-depth CSRF guard: reject cross-origin mutating requests to
      // our own API. Auth.js's SameSite=Lax session cookie already blocks the
      // classic cross-site form-POST attack; this catches the rest (fetch()
      // from another origin with credentials, misconfigured proxies, etc).
      if (pathname.startsWith("/api/") && UNSAFE_METHODS.has(request.method)) {
        const isNextAuthRoute = pathname.startsWith("/api/auth/")
        const isCronRoute = pathname.startsWith("/api/cron/")
        if (!isNextAuthRoute && !isCronRoute) {
          const origin = request.headers.get("origin")
          if (origin && origin !== request.nextUrl.origin) {
            return Response.json({ error: "Invalid origin" }, { status: 403 })
          }
        }
      }

      
      const isProtectedRoute =
        pathname.startsWith("/dashboard") || pathname.startsWith("/admin")
      const isAdminRoute = pathname.startsWith("/admin")
      const isAuthPage =
        pathname.startsWith("/login") || pathname.startsWith("/register")

      if (pathname.startsWith("/api/")) {
        return true
      }

      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", request.nextUrl))
        }
        return true
      }

      if (isAdminRoute) {
        return isLoggedIn && auth.user.role === "ADMIN"
      }

      if (isProtectedRoute) {
        return isLoggedIn
      }

      return true
    },
  },
  providers: [],
} satisfies NextAuthConfig
