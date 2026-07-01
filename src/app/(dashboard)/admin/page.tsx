"use client"

import Link from "next/link"
import { Users, UserCheck, UserX, Receipt, Wallet, TrendingUp } from "lucide-react"

import { useAdminOverview } from "@/hooks/use-admin"
import { formatCurrency, formatDate } from "@/lib/format"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard, StatCardSkeleton } from "@/components/dashboard/stat-card"
import { AdminUserGrowthChart } from "@/components/admin/admin-user-growth-chart"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminOverviewPage() {
  const { data, isLoading } = useAdminOverview()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Overview"
        description="Platform-wide statistics and health"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading || !data ? (
          Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total users"
              value={String(data.totalUsers)}
              icon={Users}
              accent="primary"
              subtext={`${data.newUsersThisMonth} new this month`}
            />
            <StatCard
              label="Active users"
              value={String(data.activeUsers)}
              icon={UserCheck}
              accent="success"
            />
            <StatCard
              label="Suspended users"
              value={String(data.suspendedUsers)}
              icon={UserX}
              accent="destructive"
            />
            <StatCard
              label="Total transactions"
              value={String(data.totalTransactions)}
              icon={Receipt}
              accent="primary"
              subtext={`${data.transactionsThisMonth} this month`}
            />
            <StatCard
              label="Total accounts"
              value={String(data.totalAccounts)}
              icon={Wallet}
              accent="primary"
            />
            <StatCard
              label="30-day volume"
              value={formatCurrency(data.volumeLast30Days, "USD")}
              icon={TrendingUp}
              accent="success"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="mb-4 font-medium">User growth (last 6 months)</h3>
          {isLoading || !data ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <AdminUserGrowthChart data={data.userGrowth} />
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <h3 className="mb-4 font-medium">Recent signups</h3>
          {isLoading || !data ? (
            <Skeleton className="h-64 rounded-xl" />
          ) : (
            <div className="space-y-3">
              {data.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarImage src={user.image ?? undefined} />
                    <AvatarFallback className="text-xs">
                      {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.name ?? user.email}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        Manage users in{" "}
        <Link href="/admin/users" className="text-foreground underline underline-offset-4">
          Users
        </Link>
      </p>
    </div>
  )
}
