import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { categorySchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")

  const categories = await db.category.findMany({
    where: {
      OR: [{ userId: session.user.id }, { isSystem: true }],
      ...(type ? { type: type as "INCOME" | "EXPENSE" } : {}),
    },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  })

  return NextResponse.json({ categories })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = categorySchema.parse(body)

    const category = await db.category.create({
      data: { ...data, userId: session.user.id },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
