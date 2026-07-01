import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/api-helpers"
import { getAdminOverview } from "@/lib/queries/admin"

export async function GET() {
  const { error } = await requireAdmin()
  if (error) return error

  const overview = await getAdminOverview()
  return NextResponse.json(overview)
}
