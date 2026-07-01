import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { investmentSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function GET() {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const investments = await db.investment.findMany({
    where: { userId: session.user.id },
    include: { account: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ investments })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = investmentSchema.parse(body)

    if (data.accountId) {
      const account = await db.financialAccount.findUnique({
        where: { id: data.accountId },
      })
      if (!account || account.userId !== session.user.id) {
        return jsonError("Account not found", 404)
      }
    }

    const investment = await db.investment.create({
      data: { ...data, userId: session.user.id },
      include: { account: true },
    })

    return NextResponse.json({ investment }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
