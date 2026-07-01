import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { transferSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = transferSchema.parse(body)

    const [fromAccount, toAccount] = await Promise.all([
      db.financialAccount.findUnique({ where: { id: data.fromAccountId } }),
      db.financialAccount.findUnique({ where: { id: data.toAccountId } }),
    ])

    if (!fromAccount || fromAccount.userId !== session.user.id) {
      return jsonError("Source account not found", 404)
    }
    if (!toAccount || toAccount.userId !== session.user.id) {
      return jsonError("Destination account not found", 404)
    }

    const transaction = await db.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          userId: session.user.id,
          accountId: data.fromAccountId,
          transferToAccountId: data.toAccountId,
          type: "TRANSFER",
          amount: data.amount,
          currency: fromAccount.currency,
          description: data.description,
          date: data.date,
        },
      })

      await tx.financialAccount.update({
        where: { id: data.fromAccountId },
        data: { balance: { decrement: data.amount } },
      })

      await tx.financialAccount.update({
        where: { id: data.toAccountId },
        data: { balance: { increment: data.amount } },
      })

      return created
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
