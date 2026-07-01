import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { requireAdmin, parsePagination } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const { error } = await requireAdmin()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const { page, pageSize, skip, take } = parsePagination(searchParams)

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      include: { user: { select: { name: true, email: true, image: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    db.auditLog.count(),
  ])

  return NextResponse.json({
    logs,
    pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
  })
}
