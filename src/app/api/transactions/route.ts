import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { transactionSchema } from "@/lib/validations/finance"
import { applyBalanceEffect } from "@/lib/queries/transactions"
import { checkBudgetThresholds } from "@/lib/notifications"
import { handleApiError, jsonError, parsePagination, parseSort } from "@/lib/api-helpers"

const SORTABLE_FIELDS = ["date", "amount", "description", "createdAt"] as const

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const { page, pageSize, skip, take } = parsePagination(searchParams)
  const { field, direction } = parseSort(searchParams, SORTABLE_FIELDS, "date")

  const search = searchParams.get("search")?.trim()
  const type = searchParams.get("type")
  const accountId = searchParams.get("accountId")
  const categoryId = searchParams.get("categoryId")
  const dateFrom = searchParams.get("dateFrom")
  const dateTo = searchParams.get("dateTo")

  const where: Prisma.TransactionWhereInput = {
    userId: session.user.id,
    ...(search ? { description: { contains: search, mode: "insensitive" } } : {}),
    ...(type ? { type: type as Prisma.EnumTransactionTypeFilter } : {}),
    ...(accountId ? { accountId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          },
        }
      : {}),
  }

  const [transactions, total] = await Promise.all([
    db.transaction.findMany({
      where,
      include: { category: true, account: true, transferToAccount: true },
      orderBy: { [field]: direction },
      skip,
      take,
    }),
    db.transaction.count({ where }),
  ])

  return NextResponse.json({
    transactions,
    pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = transactionSchema.parse(body)

    if (data.type === "TRANSFER") {
      return jsonError("Use /api/transfers to create account transfers", 400)
    }
    const newType = data.type

    const account = await db.financialAccount.findUnique({
      where: { id: data.accountId },
    })
    if (!account || account.userId !== session.user.id) {
      return jsonError("Account not found", 404)
    }

    const transaction = await db.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId: session.user.id,
          accountId: data.accountId,
          categoryId: data.categoryId,
          type: data.type,
          amount: data.amount,
          currency: data.currency,
          description: data.description,
          notes: data.notes,
          date: data.date,
          tags: data.tags,
          receiptUrl: data.receiptUrl,
        },
        include: { category: true, account: true },
      })

      await applyBalanceEffect(tx, {
        accountId: data.accountId,
        type: newType,
        amount: data.amount,
      })

      return created
    })

    if (newType === "EXPENSE") {
      await checkBudgetThresholds(session.user.id, data.categoryId ?? null)
    }

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
