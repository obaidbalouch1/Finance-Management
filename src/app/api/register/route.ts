import { NextResponse } from "next/server"
import { hash } from "bcryptjs"

import { db } from "@/lib/db"
import { registerSchema } from "@/lib/validations/auth"
import { checkRateLimit } from "@/lib/rate-limit"
import { getSystemSettings } from "@/lib/queries/system-settings"

export async function POST(request: Request) {
  const rate = checkRateLimit(request, "register", 5, 15 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    )
  }

  try {
    const settings = await getSystemSettings()
    if (!settings.allowRegistration) {
      return NextResponse.json(
        { error: "New account registration is currently disabled." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase()

    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      )
    }

    const passwordHash = await hash(password, 12)

    const user = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}
