import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { categorySchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

async function getOwnedCategory(id: string, userId: string) {
  const category = await db.category.findUnique({ where: { id } })
  if (!category || category.isSystem || category.userId !== userId) return null
  return category
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedCategory(id, session.user.id)
  if (!existing) return jsonError("Category not found", 404)

  try {
    const body = await request.json()
    const data = categorySchema.partial().parse(body)

    const category = await db.category.update({ where: { id }, data })
    return NextResponse.json({ category })
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
  const existing = await getOwnedCategory(id, session.user.id)
  if (!existing) return jsonError("Category not found", 404)

  const usageCount = await db.transaction.count({ where: { categoryId: id } })
  if (usageCount > 0) {
    return jsonError(
      "This category is used by existing transactions and cannot be deleted. Consider archiving it instead.",
      409
    )
  }

  await db.category.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
