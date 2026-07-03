import { type LucideIcon, ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "primary",
  subtext,
}: {
  label: string
  value: string
  icon: LucideIcon
  trend?: { value: number; label?: string }
  accent?: "primary" | "success" | "destructive" | "warning"
  subtext?: string
}) {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary ring-primary/15",
    success: "bg-success/10 text-success ring-success/15",
    destructive: "bg-destructive/10 text-destructive ring-destructive/15",
    warning: "bg-warning/10 text-warning ring-warning/15",
  }

  const glowClasses: Record<string, string> = {
    primary: "bg-primary/20",
    success: "bg-success/20",
    destructive: "bg-destructive/20",
    warning: "bg-warning/20",
  }

  return (
    <div className="glass hover-lift group relative overflow-hidden rounded-2xl p-5">
      <div
        aria-hidden
        className={cn(
          "absolute -top-10 -right-10 size-28 rounded-full blur-2xl transition-opacity duration-300 opacity-0 group-hover:opacity-100",
          glowClasses[accent]
        )}
      />
      <div className="relative flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{label}</p>
          <p className="mt-1.5 truncate text-2xl font-semibold tracking-tight">
            {value}
          </p>
          {subtext && (
            <p className="text-muted-foreground mt-1 text-xs">{subtext}</p>
          )}
        </div>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl ring-2 transition-transform duration-300 motion-safe:group-hover:scale-110",
            accentClasses[accent]
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      {trend && (
        <div className="relative mt-3 flex items-center gap-1 text-xs">
          {trend.value >= 0 ? (
            <ArrowUpRight className="text-success size-3.5" />
          ) : (
            <ArrowDownRight className="text-destructive size-3.5" />
          )}
          <span
            className={cn(
              "font-medium",
              trend.value >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {Math.abs(trend.value)}%
          </span>
          <span className="text-muted-foreground">
            {trend.label ?? "vs last month"}
          </span>
        </div>
      )}
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="w-full space-y-2">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="size-9 rounded-xl" />
      </div>
    </div>
  )
}
