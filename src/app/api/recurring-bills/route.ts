import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { recurringBillSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const activeOnly = searchParams.get("activeOnly") === "true"

  const bills = await db.recurringBill.findMany({
    where: {
      userId: session.user.id,
      ...(activeOnly ? { isActive: true } : {}),
    },
    include: { category: true, account: true },
    orderBy: { nextDueDate: "asc" },
  })

  return NextResponse.json({ bills })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = recurringBillSchema.parse(body)

    const account = await db.financialAccount.findUnique({
      where: { id: data.accountId },
    })
    if (!account || account.userId !== session.user.id) {
      return jsonError("Account not found", 404)
    }

    const bill = await db.recurringBill.create({
      data: { ...data, userId: session.user.id },
      include: { category: true, account: true },
    })

    return NextResponse.json({ bill }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
