import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { jsonError, parsePagination } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get("unreadOnly") === "true"
  const usePagination = searchParams.has("page")
  const { page, pageSize, skip, take } = parsePagination(searchParams)

  const where = {
    userId: session.user.id,
    ...(unreadOnly ? { isRead: false } : {}),
  }

  const [notifications, unreadCount, total] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: usePagination ? skip : 0,
      take: usePagination ? take : 20,
    }),
    db.notification.count({ where: { userId: session.user.id, isRead: false } }),
    usePagination ? db.notification.count({ where }) : Promise.resolve(0),
  ])

  return NextResponse.json({
    notifications,
    unreadCount,
    ...(usePagination
      ? { pagination: { page, pageSize, total, pageCount: Math.max(1, Math.ceil(total / pageSize)) } }
      : {}),
  })
}
