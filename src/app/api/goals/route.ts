import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { goalSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const goals = await db.goal.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as "ACTIVE" | "COMPLETED" | "ARCHIVED" } : {}),
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ goals })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = goalSchema.parse(body)

    const goal = await db.goal.create({
      data: { ...data, userId: session.user.id },
    })

    return NextResponse.json({ goal }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
