import type { Metadata } from "next"
import { Suspense } from "react"

import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Sign in",
}

export default function LoginPage() {
  const enabledOAuthProviders = {
    google: Boolean(
      process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    ),
    github: Boolean(
      process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET
    ),
  }

  return (
    <Suspense>
      <LoginForm enabledOAuthProviders={enabledOAuthProviders} />
    </Suspense>
  )
}
