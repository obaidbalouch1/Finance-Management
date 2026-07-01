import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { investmentSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

async function getOwnedInvestment(id: string, userId: string) {
  const investment = await db.investment.findUnique({ where: { id } })
  if (!investment || investment.userId !== userId) return null
  return investment
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedInvestment(id, session.user.id)
  if (!existing) return jsonError("Investment not found", 404)

  try {
    const body = await request.json()
    const data = investmentSchema.partial().parse(body)

    const investment = await db.investment.update({
      where: { id },
      data,
      include: { account: true },
    })
    return NextResponse.json({ investment })
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
  const existing = await getOwnedInvestment(id, session.user.id)
  if (!existing) return jsonError("Investment not found", 404)

  await db.investment.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
