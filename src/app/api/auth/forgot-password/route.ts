import { NextResponse } from "next/server"
import { nanoid } from "nanoid"

import { db } from "@/lib/db"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { sendEmail, passwordResetEmailHtml } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

const GENERIC_MESSAGE =
  "If an account with that email exists, we've sent a password reset link."

export async function POST(request: Request) {
  const rate = checkRateLimit(request, "forgot-password", 5, 15 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  const body = await request.json()
  const parsed = forgotPasswordSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email address" },
      { status: 422 }
    )
  }

  const email = parsed.data.email.toLowerCase()
  const user = await db.user.findUnique({ where: { email } })

  if (user && user.passwordHash) {
    const token = nanoid(48)
    const expires = new Date(Date.now() + 60 * 60 * 1000)

    await db.verificationToken.deleteMany({ where: { identifier: email } })
    await db.verificationToken.create({
      data: { identifier: email, token, expires },
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`

    await sendEmail({
      to: email,
      subject: "Reset your Finance Manager password",
      html: passwordResetEmailHtml(resetUrl),
    })
  }

  return NextResponse.json({ message: GENERIC_MESSAGE })
}
