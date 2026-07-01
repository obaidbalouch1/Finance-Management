import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  ShieldCheck,
  Wallet,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const FEATURES = [
  {
    icon: Wallet,
    title: "Unified accounts",
    description:
      "Track checking, savings, credit cards, and investments in one place with real-time balances.",
  },
  {
    icon: BarChart3,
    title: "Deep analytics",
    description:
      "Interactive charts break down cash flow, spending by category, and trends over any date range.",
  },
  {
    icon: PiggyBank,
    title: "Budgets & goals",
    description:
      "Set monthly budgets and savings goals, and get notified before you overspend.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-grade security",
    description:
      "Role-based access, encrypted credentials, and audit logs keep your financial data safe.",
  },
]

export default function Home() {
  return (
    <div className="bg-grid relative min-h-svh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <div className="absolute top-0 left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Wallet className="size-5" />
          </span>
          Finance Manager
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
          <Button nativeButton={false} render={<Link href="/register" />}>
            Get started <ArrowRight className="size-4" />
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-20 pb-24 text-center">
        <div className="border-border bg-card/60 text-muted-foreground mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          Real-time financial insights
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Take full control of your{" "}
          <span className="text-primary">financial life</span>
        </h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-balance text-lg">
          Track spending, manage budgets, monitor investments, and hit your
          savings goals — all from one beautifully simple dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button
            size="lg"
            className="h-11 px-6"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Start for free <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6"
            nativeButton={false}
            render={<Link href="/login" />}
          >
            Sign in
          </Button>
        </div>

        <div className="glass mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-card/40 flex flex-col items-start gap-3 p-6 text-left"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="size-5" />
              </span>
              <h3 className="font-medium">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="text-muted-foreground mx-auto max-w-6xl px-6 pb-10 text-center text-sm">
        © {new Date().getFullYear()} Finance Manager. All rights reserved.
      </footer>
    </div>
  )
}
