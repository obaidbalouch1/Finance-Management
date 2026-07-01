import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { budgetSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

async function getOwnedBudget(id: string, userId: string) {
  const budget = await db.budget.findUnique({ where: { id } })
  if (!budget || budget.userId !== userId) return null
  return budget
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedBudget(id, session.user.id)
  if (!existing) return jsonError("Budget not found", 404)

  try {
    const body = await request.json()
    const data = budgetSchema.partial().parse(body)

    const budget = await db.budget.update({
      where: { id },
      data,
      include: { category: true },
    })
    return NextResponse.json({ budget })
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
  const existing = await getOwnedBudget(id, session.user.id)
  if (!existing) return jsonError("Budget not found", 404)

  await db.budget.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
