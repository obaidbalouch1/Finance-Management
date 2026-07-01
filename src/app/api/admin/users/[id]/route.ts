import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { requireAdmin, jsonError } from "@/lib/api-helpers"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  if (id === session.user.id && (body.role === "USER" || body.status === "SUSPENDED")) {
    return jsonError("You cannot demote or suspend your own account", 400)
  }

  const target = await db.user.findUnique({ where: { id } })
  if (!target) return jsonError("User not found", 404)

  const data: { role?: "ADMIN" | "USER"; status?: "ACTIVE" | "SUSPENDED" } = {}
  if (body.role === "ADMIN" || body.role === "USER") data.role = body.role
  if (body.status === "ACTIVE" || body.status === "SUSPENDED") data.status = body.status

  const user = await db.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, status: true },
  })

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "user.update",
      entity: "User",
      entityId: id,
      metadata: { changes: data, targetEmail: target.email },
    },
  })

  return NextResponse.json({ user })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const { id } = await params

  if (id === session.user.id) {
    return jsonError("You cannot delete your own account", 400)
  }

  const target = await db.user.findUnique({ where: { id } })
  if (!target) return jsonError("User not found", 404)

  await db.user.delete({ where: { id } })

  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "user.delete",
      entity: "User",
      entityId: id,
      metadata: { targetEmail: target.email },
    },
  })

  return NextResponse.json({ success: true })
}
