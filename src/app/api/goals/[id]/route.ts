import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { goalSchema } from "@/lib/validations/finance"
import { checkGoalMilestone } from "@/lib/notifications"
import { handleApiError, jsonError } from "@/lib/api-helpers"

async function getOwnedGoal(id: string, userId: string) {
  const goal = await db.goal.findUnique({ where: { id } })
  if (!goal || goal.userId !== userId) return null
  return goal
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedGoal(id, session.user.id)
  if (!existing) return jsonError("Goal not found", 404)

  try {
    const body = await request.json()
    const data = goalSchema.partial().parse(body)

    const goal = await db.goal.update({ where: { id }, data })

    if (data.currentAmount !== undefined) {
      await checkGoalMilestone(
        session.user.id,
        goal.name,
        Number(goal.targetAmount),
        Number(existing.currentAmount),
        Number(goal.currentAmount)
      )
    }

    return NextResponse.json({ goal })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { id } = await params
  const existing = await getOwnedGoal(id, session.user.id)
  if (!existing) return jsonError("Goal not found", 404)

  await db.goal.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
