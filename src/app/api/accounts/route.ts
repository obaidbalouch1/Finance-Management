import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { accountSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search")?.trim()
  const includeArchived = searchParams.get("includeArchived") === "true"

  const accounts = await db.financialAccount.findMany({
    where: {
      userId: session.user.id,
      ...(includeArchived ? {} : { isArchived: false }),
      ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ accounts })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = accountSchema.parse(body)

    const account = await db.financialAccount.create({
      data: { ...data, userId: session.user.id },
    })

    return NextResponse.json({ account }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
