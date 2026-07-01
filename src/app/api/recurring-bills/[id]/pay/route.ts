import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { applyBalanceEffect } from "@/lib/queries/transactions"
import { getNextDueDate } from "@/lib/queries/recurring"
import { jsonError } from "@/lib/api-helpers"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const bill = await db.recurringBill.findUnique({ where: { id } })
  if (!bill || bill.userId !== session.user.id) {
    return jsonError("Recurring bill not found", 404)
  }

  const now = new Date()

  const result = await db.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId: session.user.id,
        accountId: bill.accountId,
        categoryId: bill.categoryId,
        type: "EXPENSE",
        amount: bill.amount,
        currency: bill.currency,
        description: bill.name,
        date: now,
        recurringBillId: bill.id,
      },
    })

    await applyBalanceEffect(tx, {
      accountId: bill.accountId,
      type: "EXPENSE",
      amount: Number(bill.amount),
    })

    const updatedBill = await tx.recurringBill.update({
      where: { id: bill.id },
      data: {
        lastPaidDate: now,
        nextDueDate: getNextDueDate(bill.nextDueDate, bill.frequency),
      },
      include: { category: true, account: true },
    })

    return { transaction, bill: updatedBill }
  })

  return NextResponse.json(result)
}
