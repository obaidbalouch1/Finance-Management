import { NextResponse } from "next/server"
import { hash } from "bcryptjs"

import { db } from "@/lib/db"
import { resetPasswordSchema } from "@/lib/validations/auth"
import { checkRateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const rate = checkRateLimit(request, "reset-password", 10, 15 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  const body = await request.json()
  const parsed = resetPasswordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    )
  }

  const { email, token, password } = parsed.data
  const normalizedEmail = email.toLowerCase()

  const verificationToken = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier: normalizedEmail, token } },
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    return NextResponse.json(
      { error: "This reset link is invalid or has expired." },
      { status: 400 }
    )
  }

  const passwordHash = await hash(password, 12)

  await db.user.update({
    where: { email: normalizedEmail },
    data: { passwordHash },
  })

  await db.verificationToken.delete({
    where: { identifier_token: { identifier: normalizedEmail, token } },
  })

  return NextResponse.json({ message: "Password reset successfully." })
}
