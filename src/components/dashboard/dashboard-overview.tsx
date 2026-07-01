"use client"

import useSWR from "swr"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  LineChart,
  ArrowLeftRight,
} from "lucide-react"

import { fetcher } from "@/lib/fetcher"
import { formatCurrency } from "@/lib/format"
import type { DashboardSummary } from "@/lib/queries/dashboard"
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card"
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart"
import { FinancialHealthCard } from "@/components/dashboard/financial-health-card"
import { BudgetsOverview } from "@/components/dashboard/budgets-overview"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardOverview({ currency }: { currency: string }) {
  const { data, isLoading } = useSWR<DashboardSummary>(
    "/api/dashboard/summary",
    fetcher,
    { refreshInterval: 20_000, revalidateOnFocus: true }
  )

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard
          label="Total balance"
          value={formatCurrency(data.totalBalance, currency)}
          icon={Wallet}
          accent="primary"
          subtext={`Across ${data.accountsCount} accounts`}
        />
        <StatCard
          label="Income this month"
          value={formatCurrency(data.monthlyIncome, currency)}
          icon={TrendingUp}
          accent="success"
        />
        <StatCard
          label="Expenses this month"
          value={formatCurrency(data.monthlyExpenses, currency)}
          icon={TrendingDown}
          accent="destructive"
        />
        <StatCard
          label="Net cash flow"
          value={formatCurrency(data.netCashFlow, currency)}
          icon={ArrowLeftRight}
          accent={data.netCashFlow >= 0 ? "success" : "destructive"}
        />
        <StatCard
          label="Savings"
          value={formatCurrency(data.savingsBalance, currency)}
          icon={PiggyBank}
          accent="primary"
        />
        <StatCard
          label="Investments"
          value={formatCurrency(data.investmentsValue, currency)}
          icon={LineChart}
          accent={data.investmentsGain >= 0 ? "success" : "destructive"}
          trend={{
            value: data.investmentsGainPercent,
            label: "all-time return",
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="mb-4 font-medium">Cash flow (last 6 months)</h3>
          <CashFlowChart data={data.cashFlowTrend} />
        </div>
        <FinancialHealthCard health={data.financialHealth} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BudgetsOverview budgets={data.budgets} currency={currency} />
        <RecentTransactions transactions={data.recentTransactions} />
      </div>
    </div>
  )
}
