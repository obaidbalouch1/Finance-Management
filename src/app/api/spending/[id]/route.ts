import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/lib/db"
import { z } from "zod"
import { handleApiError, jsonError } from "@/lib/api-helpers"

const spendingSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  date: z.string().optional(),
})

async function getOwnedSpending(id: string, userId: string) {
  const spending = await db.simpleSpending.findUnique({ where: { id } })
  if (!spending || spending.userId !== userId) return null
  return spending
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedSpending(id, session.user.id)
  if (!existing) return jsonError("Spending not found", 404)

  try {
    const body = await request.json()
    const data = spendingSchema.parse(body)

    const updateData: any = {}
    if (data.description) updateData.description = data.description
    if (data.amount) updateData.amount = data.amount
    if (data.currency) updateData.currency = data.currency
    if (data.date) updateData.date = new Date(data.date)

    const spending = await db.simpleSpending.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ spending })
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
  const existing = await getOwnedSpending(id, session.user.id)
  if (!existing) return jsonError("Spending not found", 404)

  await db.simpleSpending.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
