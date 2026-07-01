import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/api-helpers"

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  return Number(value.toString())
}

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const now = new Date()

  const monthlyVolume: { month: string; income: number; expenses: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
    const [income, expenses] = await Promise.all([
      db.transaction.aggregate({
        where: { type: "INCOME", date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
      db.transaction.aggregate({
        where: { type: "EXPENSE", date: { gte: start, lt: end } },
        _sum: { amount: true },
      }),
    ])
    monthlyVolume.push({
      month: start.toLocaleDateString("en-US", { month: "short" }),
      income: Math.round(toNumber(income._sum.amount) * 100) / 100,
      expenses: Math.round(toNumber(expenses._sum.amount) * 100) / 100,
    })
  }

  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const categoryAgg = await db.transaction.groupBy({
    by: ["categoryId"],
    where: { type: "EXPENSE", date: { gte: thirtyDaysAgo }, categoryId: { not: null } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 8,
  })

  const categoryIds = categoryAgg.map((c) => c.categoryId).filter((id): id is string => !!id)
  const categories = await db.category.findMany({ where: { id: { in: categoryIds } } })
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  const topCategories = categoryAgg.map((c) => {
    const category = c.categoryId ? categoryMap.get(c.categoryId) : undefined
    return {
      name: category?.name ?? "Unknown",
      color: category?.color ?? "#6366f1",
      value: Math.round(toNumber(c._sum.amount) * 100) / 100,
    }
  })

  const [accountTypeCounts, investmentTypeCounts] = await Promise.all([
    db.financialAccount.groupBy({ by: ["type"], _count: { _all: true } }),
    db.investment.groupBy({ by: ["type"], _count: { _all: true } }),
  ])

  return NextResponse.json({
    monthlyVolume,
    topCategories,
    accountTypeCounts: accountTypeCounts.map((a) => ({ type: a.type, count: a._count._all })),
    investmentTypeCounts: investmentTypeCounts.map((i) => ({ type: i.type, count: i._count._all })),
  })
}
