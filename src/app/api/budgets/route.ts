import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { budgetSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

function startOfPeriod(period: "WEEKLY" | "MONTHLY" | "YEARLY") {
  const now = new Date()
  if (period === "WEEKLY") {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.getFullYear(), now.getMonth(), diff)
  }
  if (period === "YEARLY") return new Date(now.getFullYear(), 0, 1)
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function GET() {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const budgets = await db.budget.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  })

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const periodStart = startOfPeriod(budget.period)
      const spentResult = await db.transaction.aggregate({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: periodStart },
        },
        _sum: { amount: true },
      })
      const spent = Number(spentResult._sum.amount ?? 0)
      const amount = Number(budget.amount)
      return {
        ...budget,
        amount,
        spent,
        percent: amount > 0 ? Math.round((spent / amount) * 100) : 0,
      }
    })
  )

  return NextResponse.json({ budgets: budgetsWithSpent })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = budgetSchema.parse(body)

    const category = await db.category.findUnique({ where: { id: data.categoryId } })
    if (!category || (category.userId && category.userId !== session.user.id)) {
      return jsonError("Category not found", 404)
    }

    const existing = await db.budget.findUnique({
      where: {
        userId_categoryId_period: {
          userId: session.user.id,
          categoryId: data.categoryId,
          period: data.period,
        },
      },
    })
    if (existing) {
      return jsonError("A budget for this category and period already exists", 409)
    }

    const budget = await db.budget.create({
      data: { ...data, userId: session.user.id },
      include: { category: true },
    })

    return NextResponse.json({ budget }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
