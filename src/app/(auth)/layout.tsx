import Link from "next/link"
import { Wallet } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-grid relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <div className="animate-float absolute top-1/4 left-1/4 -z-10 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="animate-float-delayed absolute right-1/4 bottom-1/4 -z-10 size-72 rounded-full bg-chart-2/20 blur-3xl" />
      <div className="animate-float absolute top-1/2 right-1/3 -z-10 size-56 rounded-full bg-chart-5/10 blur-3xl" />

      <Link
        href="/"
        className="animate-fade-up group mb-8 flex items-center gap-2 text-lg font-semibold tracking-tight"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform duration-300 motion-safe:group-hover:scale-110">
          <Wallet className="size-5" />
        </span>
        Finance Manager
      </Link>

      <div
        className="glass animate-fade-up w-full max-w-md rounded-2xl p-6 sm:p-8"
        style={{ animationDelay: "80ms" }}
      >
        {children}
      </div>
    </div>
  )
}
