import { NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { changePasswordSchema } from "@/lib/validations/finance"
import { handleApiError, jsonError } from "@/lib/api-helpers"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  try {
    const body = await request.json()
    const data = changePasswordSchema.parse(body)

    const user = await db.user.findUnique({ where: { id: session.user.id } })
    if (!user?.passwordHash) {
      return jsonError(
        "This account signs in via a social provider and has no password to change",
        400
      )
    }

    const isValid = await compare(data.currentPassword, user.passwordHash)
    if (!isValid) {
      return jsonError("Current password is incorrect", 400)
    }

    const passwordHash = await hash(data.newPassword, 12)
    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
