import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const notification = await db.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const updated = await db.notification.update({
    where: { id },
    data: { isRead: body.isRead ?? true },
  })

  return NextResponse.json({ notification: updated })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const notification = await db.notification.findUnique({ where: { id } })
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await db.notification.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
