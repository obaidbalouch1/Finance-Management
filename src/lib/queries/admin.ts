import { db } from "@/lib/db"

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  return Number(value.toString())
}

export async function getAdminOverview() {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    newUsersThisMonth,
    totalTransactions,
    transactionsThisMonth,
    totalAccounts,
    volumeAgg,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { status: "SUSPENDED" } }),
    db.user.count({ where: { createdAt: { gte: monthStart } } }),
    db.transaction.count(),
    db.transaction.count({ where: { date: { gte: monthStart } } }),
    db.financialAccount.count(),
    db.transaction.aggregate({
      where: { date: { gte: thirtyDaysAgo }, type: { in: ["INCOME", "EXPENSE"] } },
      _sum: { amount: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, image: true },
    }),
  ])

  const userGrowth: { month: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const count = await db.user.count({ where: { createdAt: { gte: start, lt: end } } })
    userGrowth.push({
      month: start.toLocaleDateString("en-US", { month: "short" }),
      count,
    })
  }

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    newUsersThisMonth,
    totalTransactions,
    transactionsThisMonth,
    totalAccounts,
    volumeLast30Days: Math.round(toNumber(volumeAgg._sum.amount) * 100) / 100,
    userGrowth,
    recentUsers,
  }
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>
