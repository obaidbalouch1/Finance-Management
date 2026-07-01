import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { hash } from "bcryptjs"
import { z } from "zod"

import { db } from "@/lib/db"
import { requireAdmin, jsonError, handleApiError, parsePagination } from "@/lib/api-helpers"

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  role: z.enum(["ADMIN", "USER"]),
})

export async function GET(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const { page, pageSize, skip, take } = parsePagination(searchParams)
  const search = searchParams.get("search")?.trim()
  const role = searchParams.get("role")
  const status = searchParams.get("status")

  const where: Prisma.UserWhereInput = {
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(role ? { role: role as "ADMIN" | "USER" } : {}),
    ...(status ? { status: status as "ACTIVE" | "SUSPENDED" } : {}),
  }

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        baseCurrency: true,
        createdAt: true,
        _count: { select: { transactions: true, financialAccounts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.user.count({ where }),
  ])

  return NextResponse.json({
    users,
    pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
  })
}

export async function POST(request: Request) {
  const { error: adminError } = await requireAdmin()
  if (adminError) return adminError

  try {
    const body = await request.json()
    const data = createUserSchema.parse(body)
    const normalizedEmail = data.email.toLowerCase()

    const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) return jsonError("A user with this email already exists", 409)

    const passwordHash = await hash(data.password, 12)

    const user = await db.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        passwordHash,
        role: data.role,
      },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
