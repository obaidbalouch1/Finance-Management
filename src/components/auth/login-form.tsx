"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { loginSchema, type LoginInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export function LoginForm({
  enabledOAuthProviders,
}: {
  enabledOAuthProviders: { google: boolean; github: boolean }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: LoginInput) {
    setIsSubmitting(true)
    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      })

      if (result?.error) {
        toast.error("Invalid email or password")
        return
      }

      toast.success("Welcome back!")
      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to your account to continue
        </p>
      </div>

      {(enabledOAuthProviders.google || enabledOAuthProviders.github) && (
        <div className="grid gap-2">
          {enabledOAuthProviders.google && (
            <Button
              type="button"
              variant="outline"
              disabled={oauthLoading !== null}
              onClick={() => {
                setOauthLoading("google")
                signIn("google", { callbackUrl })
              }}
            >
              {oauthLoading === "google" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Continue with Google
            </Button>
          )}
          {enabledOAuthProviders.github && (
            <Button
              type="button"
              variant="outline"
              disabled={oauthLoading !== null}
              onClick={() => {
                setOauthLoading("github")
                signIn("github", { callbackUrl })
              }}
            >
              {oauthLoading === "github" && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Continue with GitHub
            </Button>
          )}
          <div className="relative my-2 text-center text-xs">
            <span className="bg-card text-muted-foreground relative z-10 px-2">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="bg-border absolute top-1/2 right-0 left-0 h-px" />
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Sign in
          </Button>
        </form>
      </Form>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-foreground font-medium underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
