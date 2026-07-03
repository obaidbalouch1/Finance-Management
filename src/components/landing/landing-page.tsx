"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Bell,
  CheckCircle2,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react"
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useInView,
  useReducedMotion,
  animate,
  type MotionValue,
} from "motion/react"

import { Button } from "@/components/ui/button"

/* ────────────────────────────────────────────────────────────────
   Animated counter — counts up when scrolled into view
   ──────────────────────────────────────────────────────────────── */
function Counter({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.6,
  className,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  const reduce = useReducedMotion()

  React.useEffect(() => {
    if (!inView || !ref.current) return
    if (reduce) {
      ref.current.textContent = `${prefix}${to.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`
      return
    }
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${v.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
          })}${suffix}`
        }
      },
    })
    return () => controls.stop()
  }, [inView, to, prefix, suffix, decimals, duration, reduce])

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

/* ────────────────────────────────────────────────────────────────
   Aurora background — slow-drifting gradient orbs + grid
   ──────────────────────────────────────────────────────────────── */
function Aurora() {
  const reduce = useReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_40%,transparent_100%)]" />
      <motion.div
        className="absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl"
        animate={
          reduce
            ? undefined
            : { x: ["-50%", "-42%", "-58%", "-50%"], y: [0, 30, -10, 0], scale: [1, 1.08, 0.96, 1] }
        }
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 -left-40 size-[30rem] rounded-full bg-[oklch(0.65_0.18_200/0.14)] blur-3xl"
        animate={reduce ? undefined : { x: [0, 60, -20, 0], y: [0, -40, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-72 -right-40 size-[32rem] rounded-full bg-[oklch(0.6_0.2_300/0.13)] blur-3xl"
        animate={reduce ? undefined : { x: [0, -50, 30, 0], y: [0, 30, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Mini visualisations inside the 3D dashboard mockup
   ──────────────────────────────────────────────────────────────── */
const BAR_DATA = [42, 58, 45, 70, 52, 78, 60, 88, 66, 95, 74, 100]

function MiniBars() {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-40px" })
  return (
    <div ref={ref} className="flex h-28 items-end gap-1.5 sm:h-32">
      {BAR_DATA.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-[3px] bg-gradient-to-t from-primary/50 to-primary"
          initial={{ scaleY: 0 }}
          animate={inView ? { scaleY: 1 } : undefined}
          style={{ height: `${h}%`, transformOrigin: "bottom" }}
          transition={{ delay: 0.5 + i * 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  )
}

function MiniSparkline() {
  const ref = React.useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })
  return (
    <svg ref={ref} viewBox="0 0 120 40" className="h-10 w-full" fill="none">
      <motion.path
        d="M2 32 C14 30 20 22 32 24 S52 34 62 26 82 8 94 12 112 6 118 4"
        stroke="var(--chart-3)"
        strokeWidth="2.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={inView ? { pathLength: 1 } : undefined}
        transition={{ delay: 0.9, duration: 1.6, ease: "easeInOut" }}
      />
      <motion.path
        d="M2 32 C14 30 20 22 32 24 S52 34 62 26 82 8 94 12 112 6 118 4 L118 40 L2 40 Z"
        fill="url(#spark-fill)"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : undefined}
        transition={{ delay: 1.6, duration: 0.8 }}
      />
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--chart-3)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--chart-3)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function HealthRing({ score = 82 }: { score?: number }) {
  const ref = React.useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <div className="relative flex items-center justify-center">
      <svg ref={ref} viewBox="0 0 64 64" className="size-16 -rotate-90">
        <circle cx="32" cy="32" r={r} stroke="var(--border)" strokeWidth="6" fill="none" />
        <motion.circle
          cx="32"
          cy="32"
          r={r}
          stroke="var(--chart-3)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={inView ? { strokeDashoffset: c * (1 - score / 100) } : undefined}
          transition={{ delay: 0.8, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <span className="absolute text-sm font-bold">
        <Counter to={score} duration={1.4} />
      </span>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Floating chip — bobs on its own depth layer inside the 3D scene
   ──────────────────────────────────────────────────────────────── */
function FloatingChip({
  children,
  className,
  depth = 50,
  delay = 0,
  float = 10,
}: {
  children: React.ReactNode
  className?: string
  depth?: number
  delay?: number
  float?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={`glass absolute z-10 hidden items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium shadow-xl md:flex ${className ?? ""}`}
      style={{ transform: `translateZ(${depth}px)`, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="flex items-center gap-2"
        animate={reduce ? undefined : { y: [0, -float, 0] }}
        transition={{ duration: 4 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────
   3D dashboard mockup — tilts toward the mouse
   ──────────────────────────────────────────────────────────────── */
function DashboardMockup({
  mouseX,
  mouseY,
}: {
  mouseX: MotionValue<number>
  mouseY: MotionValue<number>
}) {
  const reduce = useReducedMotion()
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 140,
    damping: 20,
  })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-9, 9]), {
    stiffness: 140,
    damping: 20,
  })
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["30%", "70%"])
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["20%", "80%"])
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(600px circle at ${x} ${y}, oklch(1 0 0 / 0.10), transparent 45%)`
  )

  return (
    <div style={{ perspective: 1400 }} className="relative mx-auto max-w-4xl">
      {/* glow ring behind the card */}
      <div className="absolute inset-x-8 -bottom-6 top-8 -z-10 rounded-[2rem] bg-primary/25 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 18 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.55, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          rotateX: reduce ? 0 : rotateX,
          rotateY: reduce ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="glass-panel relative rounded-2xl p-3 shadow-2xl shadow-primary/10 sm:p-4"
      >
        {/* glare overlay */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
          style={{ background: reduce ? undefined : glare }}
        />

        {/* window chrome */}
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="size-2.5 rounded-full bg-[oklch(0.65_0.2_25)]" />
          <span className="size-2.5 rounded-full bg-[oklch(0.8_0.16_80)]" />
          <span className="size-2.5 rounded-full bg-[oklch(0.7_0.17_145)]" />
          <span className="text-muted-foreground ml-3 text-xs font-medium">
            Finance Manager — Dashboard
          </span>
          <span className="ml-auto hidden items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary sm:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Live
          </span>
        </div>

        {/* stat cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3" style={{ transform: "translateZ(30px)" }}>
          {[
            {
              label: "Total balance",
              value: 24563,
              prefix: "$",
              icon: Wallet,
              trend: "+12.4%",
              up: true,
            },
            {
              label: "Income",
              value: 8420,
              prefix: "$",
              icon: ArrowUpRight,
              trend: "+8.1%",
              up: true,
            },
            {
              label: "Expenses",
              value: 5180,
              prefix: "$",
              icon: ArrowDownRight,
              trend: "-3.2%",
              up: false,
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className="bg-card/70 rounded-xl border border-border/50 p-2.5 sm:p-4"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="text-muted-foreground flex items-center gap-1.5 text-[10px] sm:text-xs">
                <s.icon className="size-3.5 text-primary" />
                {s.label}
              </div>
              <div className="mt-1 text-sm font-bold tabular-nums sm:text-xl">
                <Counter to={s.value} prefix={s.prefix} />
              </div>
              <div
                className={`mt-0.5 text-[10px] font-medium sm:text-xs ${
                  s.up ? "text-[var(--success)]" : "text-[var(--destructive)]"
                }`}
              >
                {s.trend} this month
              </div>
            </motion.div>
          ))}
        </div>

        {/* chart row */}
        <div
          className="mt-2 grid grid-cols-3 gap-2 sm:mt-3 sm:gap-3"
          style={{ transform: "translateZ(20px)" }}
        >
          <motion.div
            className="bg-card/70 col-span-2 rounded-xl border border-border/50 p-3 sm:p-4"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold">Cash flow</span>
              <span className="text-muted-foreground text-[10px]">Last 12 months</span>
            </div>
            <MiniBars />
          </motion.div>

          <motion.div
            className="bg-card/70 flex flex-col justify-between rounded-xl border border-border/50 p-3 sm:p-4"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-xs font-semibold">Health score</span>
            <div className="flex justify-center py-1">
              <HealthRing score={82} />
            </div>
            <MiniSparkline />
          </motion.div>
        </div>

        {/* floating chips (depth layers) */}
        <FloatingChip className="top-[60%] -left-16 lg:-left-28" depth={70} delay={1.3}>
          <span className="flex size-6 items-center justify-center rounded-full bg-[var(--success)]/15">
            <CheckCircle2 className="size-3.5 text-[var(--success)]" />
          </span>
          <div>
            <div className="font-semibold">Goal reached</div>
            <div className="text-muted-foreground text-[10px]">Vacation fund · $3,000</div>
          </div>
        </FloatingChip>

        <FloatingChip className="-top-7 -right-10 lg:-right-16" depth={90} delay={1.5} float={12}>
          <span className="flex size-6 items-center justify-center rounded-full bg-primary/15">
            <TrendingUp className="size-3.5 text-primary" />
          </span>
          <div>
            <div className="font-semibold">+$2,400</div>
            <div className="text-muted-foreground text-[10px]">Salary deposit</div>
          </div>
        </FloatingChip>

        <FloatingChip className="-bottom-5 -right-4 lg:-right-12" depth={60} delay={1.7} float={8}>
          <span className="flex size-6 items-center justify-center rounded-full bg-[var(--warning)]/15">
            <Bell className="size-3.5 text-[var(--warning)]" />
          </span>
          <div>
            <div className="font-semibold">Budget alert</div>
            <div className="text-muted-foreground text-[10px]">Dining at 92% of limit</div>
          </div>
        </FloatingChip>
      </motion.div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Feature card — mouse-spotlight + lift on hover
   ──────────────────────────────────────────────────────────────── */
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType
  title: string
  description: string
  index: number
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty("--spot-x", `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty("--spot-y", `${e.clientY - rect.top}px`)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: index * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      className="group bg-card/50 relative flex flex-col items-start gap-3 overflow-hidden rounded-2xl border border-border/60 p-6 text-left backdrop-blur transition-shadow hover:shadow-xl hover:shadow-primary/10"
    >
      {/* spotlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(280px circle at var(--spot-x, 50%) var(--spot-y, 50%), oklch(0.55 0.22 264 / 0.10), transparent 65%)",
        }}
      />
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        <Icon className="size-5" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  )
}

/* ────────────────────────────────────────────────────────────────
   Page
   ──────────────────────────────────────────────────────────────── */
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

const STATS = [
  { value: 15, suffix: "+", label: "Feature modules" },
  { value: 7, suffix: "", label: "Account types" },
  { value: 6, suffix: "", label: "Chart types" },
  { value: 3, suffix: "", label: "Export formats" },
]

const HEADLINE_1 = ["Take", "full", "control", "of", "your"]

export function LandingPage() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  return (
    <div
      className="relative min-h-svh overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      <Aurora />

      {/* header */}
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6"
      >
        <div className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <motion.span
            whileHover={{ rotate: -8, scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          >
            <Wallet className="size-5" />
          </motion.span>
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
      </motion.header>

      <main className="mx-auto max-w-6xl px-6 pt-14 pb-24 text-center sm:pt-20">
        {/* badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-border bg-card/60 text-muted-foreground mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs backdrop-blur"
        >
          <Sparkles className="size-3.5 text-primary" />
          Real-time financial insights
          <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
            New
          </span>
        </motion.div>

        {/* headline — word-by-word reveal */}
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
          {HEADLINE_1.map((word, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {word}
              {" "}
            </motion.span>
          ))}
          <br className="hidden sm:block" />
          <motion.span
            className="inline-block bg-gradient-to-r from-primary via-[oklch(0.65_0.18_200)] to-primary bg-[length:200%_auto] bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              backgroundPosition: ["0% center", "200% center"],
            }}
            transition={{
              delay: 0.55,
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              backgroundPosition: {
                delay: 1.4,
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              },
            }}
          >
            financial life
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-muted-foreground mx-auto mt-6 max-w-2xl text-balance text-lg"
        >
          Track spending, manage budgets, monitor investments, and hit your
          savings goals — all from one beautifully simple dashboard.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              className="h-11 px-6 shadow-lg shadow-primary/30"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Start for free <ArrowRight className="size-4" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 backdrop-blur"
              nativeButton={false}
              render={<Link href="/login" />}
            >
              Sign in
            </Button>
          </motion.div>
        </motion.div>

        {/* 3D dashboard */}
        <div className="mt-16 sm:mt-20">
          <DashboardMockup mouseX={mouseX} mouseY={mouseY} />
        </div>

        {/* stats strip */}
        <div className="mx-auto mt-20 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-1"
            >
              <span className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                <Counter to={s.value} suffix={s.suffix} />
              </span>
              <span className="text-muted-foreground text-sm">{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* features */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} {...feature} index={i} />
          ))}
        </div>

        {/* bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel relative mx-auto mt-24 max-w-3xl overflow-hidden rounded-3xl px-8 py-14"
        >
          <div className="absolute -top-24 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
          <Target className="mx-auto mb-4 size-10 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Ready to hit your financial goals?
          </h2>
          <p className="text-muted-foreground mx-auto mt-3 max-w-md">
            Join now and get a complete picture of your money in minutes — free
            to start, no credit card required.
          </p>
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="mt-7 inline-block"
          >
            <Button
              size="lg"
              className="h-11 px-8 shadow-lg shadow-primary/30"
              nativeButton={false}
              render={<Link href="/register" />}
            >
              Create your account <ArrowRight className="size-4" />
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <footer className="text-muted-foreground mx-auto max-w-6xl px-6 pb-10 text-center text-sm">
        © {new Date().getFullYear()} Finance Manager. All rights reserved.
      </footer>
    </div>
  )
}
