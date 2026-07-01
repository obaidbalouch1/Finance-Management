import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/api-helpers"
import { getSystemSettings, updateSystemSettings } from "@/lib/queries/system-settings"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const settings = await getSystemSettings()
  return NextResponse.json({ settings })
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAdmin()
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const settings = await updateSystemSettings(body)

  const { db } = await import("@/lib/db")
  await db.auditLog.create({
    data: {
      userId: session.user.id,
      action: "settings.update",
      entity: "SystemSetting",
      metadata: { changes: body },
    },
  })

  return NextResponse.json({ settings })
}
