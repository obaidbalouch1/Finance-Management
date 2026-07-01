import { db } from "@/lib/db"

type NotificationType = "INFO" | "SUCCESS" | "WARNING" | "ERROR"

export async function createNotification(input: {
  userId: string
  title: string
  message: string
  type?: NotificationType
  link?: string
}) {
  return db.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "INFO",
      link: input.link,
    },
  })
}

function startOfPeriod(period: "WEEKLY" | "MONTHLY" | "YEARLY") {
  const now = new Date()
  if (period === "WEEKLY") {
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    return new Date(now.getFullYear(), now.getMonth(), diff)
  }
  if (period === "YEARLY") return new Date(now.getFullYear(), 0, 1)
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

/**
 * Checks whether the category's budget(s) just crossed 80% or 100% of their
 * limit as a result of a new/updated expense, and notifies once per check
 * (best-effort; not deduplicated across rapid edits).
 */
export async function checkBudgetThresholds(userId: string, categoryId: string | null) {
  if (!categoryId) return

  const budgets = await db.budget.findMany({
    where: { userId, categoryId },
    include: { category: true },
  })

  for (const budget of budgets) {
    const periodStart = startOfPeriod(budget.period)
    const spentAgg = await db.transaction.aggregate({
      where: {
        userId,
        categoryId,
        type: "EXPENSE",
        date: { gte: periodStart },
      },
      _sum: { amount: true },
    })

    const spent = Number(spentAgg._sum.amount ?? 0)
    const amount = Number(budget.amount)
    if (amount <= 0) continue

    const percent = (spent / amount) * 100

    if (percent >= 100) {
      await createNotification({
        userId,
        title: "Budget exceeded",
        message: `You've spent ${Math.round(percent)}% of your ${budget.category.name} budget this ${budget.period.toLowerCase()}.`,
        type: "ERROR",
        link: "/budgets",
      })
    } else if (percent >= 80) {
      await createNotification({
        userId,
        title: "Budget alert",
        message: `You've used ${Math.round(percent)}% of your ${budget.category.name} budget this ${budget.period.toLowerCase()}.`,
        type: "WARNING",
        link: "/budgets",
      })
    }
  }
}

const MILESTONES = [25, 50, 75, 100]

/** Notifies when a goal's funded percentage crosses a 25/50/75/100 milestone. */
export async function checkGoalMilestone(
  userId: string,
  goalName: string,
  targetAmount: number,
  previousAmount: number,
  newAmount: number
) {
  if (targetAmount <= 0) return

  const previousPercent = (previousAmount / targetAmount) * 100
  const newPercent = (newAmount / targetAmount) * 100

  const crossed = MILESTONES.filter((m) => previousPercent < m && newPercent >= m)
  if (crossed.length === 0) return

  const highest = Math.max(...crossed)
  const isComplete = highest >= 100

  await createNotification({
    userId,
    title: isComplete ? "Goal achieved!" : "Goal milestone reached",
    message: isComplete
      ? `Congratulations! You've fully funded your "${goalName}" goal.`
      : `You've reached ${highest}% of your "${goalName}" goal.`,
    type: "SUCCESS",
    link: "/goals",
  })
}
