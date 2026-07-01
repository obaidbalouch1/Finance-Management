import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { profileSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function GET() {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      baseCurrency: true,
      role: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ user })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = profileSchema.parse(body)

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        image: data.image || null,
        baseCurrency: data.baseCurrency,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        baseCurrency: true,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    return handleApiError(error)
  }
}
