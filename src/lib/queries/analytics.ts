import { db } from "@/lib/db"

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  return Number(value.toString())
}

function bucketKey(date: Date, granularity: "day" | "week" | "month") {
  if (granularity === "month") {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
  }
  if (granularity === "week") {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.getFullYear(), d.getMonth(), diff)
    return monday.toISOString().slice(0, 10)
  }
  return date.toISOString().slice(0, 10)
}

function bucketLabel(key: string, granularity: "day" | "week" | "month") {
  if (granularity === "month") {
    const [year, month] = key.split("-").map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    })
  }
  return new Date(key).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function pickGranularity(from: Date, to: Date): "day" | "week" | "month" {
  const days = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 31) return "day"
  if (days <= 120) return "week"
  return "month"
}

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export async function getAnalyticsData(userId: string, from: Date, to: Date) {
  const transactions = await db.transaction.findMany({
    where: { userId, date: { gte: from, lte: to } },
    include: { category: true, account: true },
    orderBy: { date: "asc" },
  })

  const granularity = pickGranularity(from, to)

  const trendMap = new Map<string, { income: number; expenses: number }>()
  const categoryMap = new Map<string, { name: string; color: string; amount: number }>()
  const accountMap = new Map<string, { name: string; income: number; expenses: number }>()

  let totalIncome = 0
  let totalExpenses = 0

  for (const t of transactions) {
    if (t.type === "TRANSFER") continue

    const amount = toNumber(t.amount)
    const key = bucketKey(new Date(t.date), granularity)
    const bucket = trendMap.get(key) ?? { income: 0, expenses: 0 }
    if (t.type === "INCOME") {
      bucket.income += amount
      totalIncome += amount
    } else {
      bucket.expenses += amount
      totalExpenses += amount
    }
    trendMap.set(key, bucket)

    if (t.type === "EXPENSE" && t.category) {
      const existing = categoryMap.get(t.category.id) ?? {
        name: t.category.name,
        color: t.category.color,
        amount: 0,
      }
      existing.amount += amount
      categoryMap.set(t.category.id, existing)
    }

    const accountBucket = accountMap.get(t.accountId) ?? {
      name: t.account.name,
      income: 0,
      expenses: 0,
    }
    if (t.type === "INCOME") accountBucket.income += amount
    else accountBucket.expenses += amount
    accountMap.set(t.accountId, accountBucket)
  }

  const trend = Array.from(trendMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, value]) => ({
      period: bucketLabel(key, granularity),
      income: Math.round(value.income * 100) / 100,
      expenses: Math.round(value.expenses * 100) / 100,
      net: Math.round((value.income - value.expenses) * 100) / 100,
    }))

  const categoryBreakdown = Array.from(categoryMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((c, i) => ({
      name: c.name,
      value: Math.round(c.amount * 100) / 100,
      color: c.color || CHART_COLORS[i % CHART_COLORS.length],
    }))

  const accountBreakdown = Array.from(accountMap.values()).map((a) => ({
    name: a.name,
    income: Math.round(a.income * 100) / 100,
    expenses: Math.round(a.expenses * 100) / 100,
  }))

  return {
    granularity,
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netCashFlow: Math.round((totalIncome - totalExpenses) * 100) / 100,
    transactionCount: transactions.filter((t) => t.type !== "TRANSFER").length,
    averageTransaction:
      transactions.length > 0
        ? Math.round(((totalIncome + totalExpenses) / transactions.length) * 100) / 100
        : 0,
    trend,
    categoryBreakdown,
    accountBreakdown,
  }
}

export type AnalyticsData = Awaited<ReturnType<typeof getAnalyticsData>>
