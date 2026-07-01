import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"

import { authConfig } from "@/auth.config"
import { db } from "@/lib/db"
import { loginSchema } from "@/lib/validations/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { getSystemSettings } from "@/lib/queries/system-settings"

const oauthProviders = []

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  )
}

if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
  oauthProviders.push(
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    })
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    ...oauthProviders,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const rate = checkRateLimit(request, "login", 10, 15 * 60 * 1000)
        if (!rate.allowed) return null

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await db.user.findUnique({
          where: { email: email.toLowerCase() },
        })

        if (!user || !user.passwordHash) return null
        if (user.status === "SUSPENDED") return null

        const passwordsMatch = await compare(password, user.passwordHash)
        if (!passwordsMatch) return null

        if (user.role !== "ADMIN") {
          const settings = await getSystemSettings()
          if (settings.maintenanceMode) return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          baseCurrency: user.baseCurrency,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as { role?: "ADMIN" | "USER" }).role ?? "USER"
        token.baseCurrency =
          (user as { baseCurrency?: string }).baseCurrency ?? "USD"
      }

      if (trigger === "update" && session) {
        if (session.name) token.name = session.name
        if (session.image) token.picture = session.image
        if (session.baseCurrency) token.baseCurrency = session.baseCurrency
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "USER"
        session.user.baseCurrency = token.baseCurrency as string
      }
      return session
    },
  },
})
