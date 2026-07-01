import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { getAnalyticsData } from "@/lib/queries/analytics"
import { jsonError } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")

  const to = toParam ? new Date(toParam) : new Date()
  const from = fromParam
    ? new Date(fromParam)
    : new Date(to.getFullYear(), to.getMonth() - 6, to.getDate())

  to.setHours(23, 59, 59, 999)
  from.setHours(0, 0, 0, 0)

  const data = await getAnalyticsData(session.user.id, from, to)

  return NextResponse.json(data)
}
