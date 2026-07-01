import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { recurringBillSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

async function getOwnedBill(id: string, userId: string) {
  const bill = await db.recurringBill.findUnique({ where: { id } })
  if (!bill || bill.userId !== userId) return null
  return bill
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedBill(id, session.user.id)
  if (!existing) return jsonError("Recurring bill not found", 404)

  try {
    const body = await request.json()
    const data = recurringBillSchema.partial().parse(body)

    const bill = await db.recurringBill.update({
      where: { id },
      data,
      include: { category: true, account: true },
    })
    return NextResponse.json({ bill })
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
  const existing = await getOwnedBill(id, session.user.id)
  if (!existing) return jsonError("Recurring bill not found", 404)

  await db.recurringBill.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
