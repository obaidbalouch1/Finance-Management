import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { accountSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

async function getOwnedAccount(id: string, userId: string) {
  const account = await db.financialAccount.findUnique({ where: { id } })
  if (!account || account.userId !== userId) return null
  return account
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const account = await getOwnedAccount(id, session.user.id)
  if (!account) return jsonError("Account not found", 404)

  return NextResponse.json({ account })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedAccount(id, session.user.id)
  if (!existing) return jsonError("Account not found", 404)

  try {
    const body = await request.json()
    const data = accountSchema.partial().parse(body)

    const account = await db.financialAccount.update({ where: { id }, data })
    return NextResponse.json({ account })
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
  const existing = await getOwnedAccount(id, session.user.id)
  if (!existing) return jsonError("Account not found", 404)

  const usageCount = await db.transaction.count({ where: { accountId: id } })
  if (usageCount > 0) {
    await db.financialAccount.update({
      where: { id },
      data: { isArchived: true },
    })
    return NextResponse.json({ archived: true })
  }

  await db.financialAccount.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
