import { HeartPulse } from "lucide-react"

import { cn } from "@/lib/utils"
import type { FinancialHealthResult } from "@/lib/financial-health"

const LABEL_COLOR: Record<FinancialHealthResult["label"], string> = {
  Excellent: "text-success",
  Good: "text-chart-2",
  Fair: "text-warning",
  "Needs attention": "text-destructive",
}

const RING_COLOR: Record<FinancialHealthResult["label"], string> = {
  Excellent: "stroke-success",
  Good: "stroke-chart-2",
  Fair: "stroke-warning",
  "Needs attention": "stroke-destructive",
}

export function FinancialHealthCard({
  health,
}: {
  health: FinancialHealthResult
}) {
  const circumference = 2 * Math.PI * 42
  const offset = circumference * (1 - health.score / 100)

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
          <HeartPulse className="size-4" />
        </span>
        <h3 className="font-medium">Financial Health Score</h3>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex size-28 shrink-0 items-center justify-center">
          <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="8"
              className="stroke-muted"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={cn("transition-all duration-700", RING_COLOR[health.label])}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-semibold">{health.score}</span>
            <span className="text-muted-foreground text-[10px]">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <p className={cn("text-sm font-semibold", LABEL_COLOR[health.label])}>
            {health.label}
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <dt className="text-muted-foreground">Savings rate</dt>
            <dd className="text-right font-medium">
              {health.breakdown.savingsRate}%
            </dd>
            <dt className="text-muted-foreground">Budget adherence</dt>
            <dd className="text-right font-medium">
              {health.breakdown.budgetAdherence}%
            </dd>
            <dt className="text-muted-foreground">Debt ratio</dt>
            <dd className="text-right font-medium">
              {health.breakdown.debtRatio}%
            </dd>
            <dt className="text-muted-foreground">Emergency fund</dt>
            <dd className="text-right font-medium">
              {health.breakdown.emergencyFundMonths}mo
            </dd>
          </dl>
        </div>
      </div>
    </div>
  )
}
