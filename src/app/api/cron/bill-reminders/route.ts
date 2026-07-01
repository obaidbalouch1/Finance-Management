import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { createNotification } from "@/lib/notifications"
import { jsonError } from "@/lib/api-helpers"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return jsonError("Unauthorized", 401)
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const maxLookahead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const bills = await db.recurringBill.findMany({
    where: { isActive: true, nextDueDate: { lte: maxLookahead } },
  })

  let notified = 0

  for (const bill of bills) {
    const daysUntilDue = Math.ceil(
      (bill.nextDueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (daysUntilDue > bill.reminderDays) continue

    const isOverdue = daysUntilDue < 0
    const title = isOverdue ? "Bill overdue" : "Bill due soon"

    const alreadyNotifiedToday = await db.notification.findFirst({
      where: {
        userId: bill.userId,
        title,
        message: { contains: bill.name },
        createdAt: { gte: startOfToday },
      },
    })
    if (alreadyNotifiedToday) continue

    await createNotification({
      userId: bill.userId,
      title,
      message: isOverdue
        ? `${bill.name} was due ${Math.abs(daysUntilDue)} day(s) ago.`
        : `${bill.name} is due in ${daysUntilDue} day(s).`,
      type: isOverdue ? "ERROR" : "WARNING",
      link: "/recurring-bills",
    })
    notified++
  }

  return NextResponse.json({ checked: bills.length, notified })
}
