import { type LucideIcon, ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"

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
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    destructive: "bg-destructive/10 text-destructive",
    warning: "bg-warning/10 text-warning",
  }

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div className="flex items-start justify-between">
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
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            accentClasses[accent]
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
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
          <div className="bg-muted h-3.5 w-20 animate-pulse rounded" />
          <div className="bg-muted h-7 w-28 animate-pulse rounded" />
        </div>
        <div className="bg-muted size-9 animate-pulse rounded-xl" />
      </div>
    </div>
  )
}
