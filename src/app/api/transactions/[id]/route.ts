import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { transactionSchema } from "@/lib/validations/finance"
import { applyBalanceEffect, reverseBalanceEffect } from "@/lib/queries/transactions"
import { checkBudgetThresholds } from "@/lib/notifications"
import { handleApiError, jsonError } from "@/lib/api-helpers"

async function getOwnedTransaction(id: string, userId: string) {
  const transaction = await db.transaction.findUnique({ where: { id } })
  if (!transaction || transaction.userId !== userId) return null
  return transaction
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const transaction = await db.transaction.findUnique({
    where: { id },
    include: { category: true, account: true, transferToAccount: true },
  })
  if (!transaction || transaction.userId !== session.user.id) {
    return jsonError("Transaction not found", 404)
  }

  return NextResponse.json({ transaction })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedTransaction(id, session.user.id)
  if (!existing) return jsonError("Transaction not found", 404)

  if (existing.type === "TRANSFER") {
    return jsonError(
      "Transfers can't be edited. Delete this transfer and create a new one instead.",
      400
    )
  }

  try {
    const body = await request.json()
    const data = transactionSchema.parse(body)

    if (data.type === "TRANSFER") {
      return jsonError("Cannot change an existing transaction into a transfer", 400)
    }
    const newType = data.type

    const account = await db.financialAccount.findUnique({
      where: { id: data.accountId },
    })
    if (!account || account.userId !== session.user.id) {
      return jsonError("Account not found", 404)
    }

    const transaction = await db.$transaction(async (tx) => {
      await reverseBalanceEffect(tx, {
        accountId: existing.accountId,
        type: existing.type as "INCOME" | "EXPENSE",
        amount: Number(existing.amount),
      })

      const updated = await tx.transaction.update({
        where: { id },
        data: {
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

      return updated
    })

    if (newType === "EXPENSE") {
      await checkBudgetThresholds(session.user.id, data.categoryId ?? null)
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedTransaction(id, session.user.id)
  if (!existing) return jsonError("Transaction not found", 404)

  await db.$transaction(async (tx) => {
    if (existing.type === "TRANSFER" && existing.transferToAccountId) {
      await tx.financialAccount.update({
        where: { id: existing.accountId },
        data: { balance: { increment: Number(existing.amount) } },
      })
      await tx.financialAccount.update({
        where: { id: existing.transferToAccountId },
        data: { balance: { decrement: Number(existing.amount) } },
      })
    } else {
      await reverseBalanceEffect(tx, {
        accountId: existing.accountId,
        type: existing.type as "INCOME" | "EXPENSE",
        amount: Number(existing.amount),
      })
    }

    await tx.transaction.delete({ where: { id } })
  })

  return NextResponse.json({ success: true })
}
