import type { RecurringFrequency } from "@prisma/client"

export function getNextDueDate(current: Date, frequency: RecurringFrequency): Date {
  const next = new Date(current)
  switch (frequency) {
    case "DAILY":
      next.setDate(next.getDate() + 1)
      break
    case "WEEKLY":
      next.setDate(next.getDate() + 7)
      break
    case "BIWEEKLY":
      next.setDate(next.getDate() + 14)
      break
    case "MONTHLY":
      next.setMonth(next.getMonth() + 1)
      break
    case "QUARTERLY":
      next.setMonth(next.getMonth() + 3)
      break
    case "YEARLY":
      next.setFullYear(next.getFullYear() + 1)
      break
  }
  return next
}
