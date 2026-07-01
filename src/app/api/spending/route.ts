import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { handleApiError, jsonError } from "@/lib/api-helpers"

const spendingSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
  date: z.string().optional(),
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  const year = searchParams.get("year")

  const now = new Date()
  const targetMonth = month ? parseInt(month) : now.getMonth() + 1
  const targetYear = year ? parseInt(year) : now.getFullYear()

  const startDate = new Date(targetYear, targetMonth - 1, 1)
  const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999)

  const spendings = await db.simpleSpending.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { date: "desc" },
  })

  const total = spendings.reduce((sum, s) => sum + Number(s.amount), 0)

  return NextResponse.json({
    spendings,
    total,
    month: targetMonth,
    year: targetYear,
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = spendingSchema.parse(body)

    const spending = await db.simpleSpending.create({
      data: {
        userId: session.user.id,
        description: data.description,
        amount: data.amount,
        currency: data.currency,
        date: data.date ? new Date(data.date) : new Date(),
      },
    })

    return NextResponse.json({ spending }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
