"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { TrendingUp, TrendingDown, ArrowLeftRight, Receipt } from "lucide-react"

import { useAnalytics } from "@/hooks/use-analytics"
import { formatCurrency } from "@/lib/format"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card"
import { DateRangePicker } from "@/components/date-range-picker"
import { TrendChart } from "@/components/analytics/trend-chart"
import { IncomeExpenseBarChart } from "@/components/analytics/income-expense-bar-chart"
import { CategoryPieChart } from "@/components/analytics/category-pie-chart"
import { Skeleton } from "@/components/ui/skeleton"

function defaultRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 90)
  return { from, to }
}

export default function AnalyticsPage() {
  const [range, setRange] = React.useState<DateRange>(defaultRange())
  const { data, isLoading } = useAnalytics(range)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Deep dive into your spending patterns and trends"
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total income"
              value={formatCurrency(data.totalIncome, "PKR")}
              icon={TrendingUp}
              accent="success"
            />
            <StatCard
              label="Total expenses"
              value={formatCurrency(data.totalExpenses, "PKR")}
              icon={TrendingDown}
              accent="destructive"
            />
            <StatCard
              label="Net cash flow"
              value={formatCurrency(data.netCashFlow, "PKR")}
              icon={ArrowLeftRight}
              accent={data.netCashFlow >= 0 ? "success" : "destructive"}
            />
            <StatCard
              label="Transactions"
              value={String(data.transactionCount)}
              icon={Receipt}
              accent="primary"
              subtext={`Avg ${formatCurrency(data.averageTransaction, "PKR")}`}
            />
          </>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 font-medium">Income vs. expenses over time</h3>
        {isLoading || !data ? (
          <Skeleton className="h-80 rounded-xl" />
        ) : (
          <TrendChart data={data.trend} />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-medium">Spending by category</h3>
          {isLoading || !data ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <CategoryPieChart data={data.categoryBreakdown} />
          )}
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-medium">Income vs. expenses by period</h3>
          {isLoading || !data ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <IncomeExpenseBarChart data={data.trend} />
          )}
        </div>
      </div>
    </div>
  )
}
