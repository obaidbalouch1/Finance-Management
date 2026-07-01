"use client"

import useSWR from "swr"

import { fetcher } from "@/lib/fetcher"
import { toTitleCase } from "@/lib/format"
import { PageHeader } from "@/components/dashboard/page-header"
import { IncomeExpenseBarChart } from "@/components/analytics/income-expense-bar-chart"
import { CategoryPieChart } from "@/components/analytics/category-pie-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type AdminAnalytics = {
  monthlyVolume: { month: string; income: number; expenses: number }[]
  topCategories: { name: string; color: string; value: number }[]
  accountTypeCounts: { type: string; count: number }[]
  investmentTypeCounts: { type: string; count: number }[]
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useSWR<AdminAnalytics>("/api/admin/analytics", fetcher)

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Analytics"
        description="Platform-wide financial activity"
      />

      <div className="glass rounded-2xl p-5">
        <h3 className="mb-4 font-medium">Platform volume (last 6 months)</h3>
        {isLoading || !data ? (
          <Skeleton className="h-72 rounded-xl" />
        ) : (
          <IncomeExpenseBarChart
            data={data.monthlyVolume.map((m) => ({ period: m.month, ...m }))}
          />
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-medium">Top spending categories (30d)</h3>
          {isLoading || !data ? (
            <Skeleton className="h-72 rounded-xl" />
          ) : (
            <CategoryPieChart data={data.topCategories} />
          )}
        </div>

        <div className="glass space-y-4 rounded-2xl p-5">
          <div>
            <h3 className="mb-3 font-medium">Accounts by type</h3>
            {isLoading || !data ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.accountTypeCounts.map((a) => (
                  <Badge key={a.type} variant="outline">
                    {toTitleCase(a.type)}: {a.count}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div>
            <h3 className="mb-3 font-medium">Investments by type</h3>
            {isLoading || !data ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.investmentTypeCounts.map((i) => (
                  <Badge key={i.type} variant="outline">
                    {toTitleCase(i.type)}: {i.count}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
