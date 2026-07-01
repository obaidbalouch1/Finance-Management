import { db } from "@/lib/db"
import { computeFinancialHealthScore } from "@/lib/financial-health"

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfMonthsAgo(date: Date, monthsAgo: number) {
  return new Date(date.getFullYear(), date.getMonth() - monthsAgo, 1)
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return value
  return Number(value.toString())
}

const LIQUID_TYPES = ["CHECKING", "SAVINGS", "CASH"] as const
const DEBT_TYPES = ["CREDIT_CARD", "LOAN"] as const

export async function getDashboardSummary(userId: string) {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const sixMonthsAgo = startOfMonthsAgo(now, 5)

  const [accounts, investments, monthTransactions, trendTransactions, budgets, recentTransactions] =
    await Promise.all([
      db.financialAccount.findMany({
        where: { userId, isArchived: false },
      }),
      db.investment.findMany({ where: { userId } }),
      db.transaction.findMany({
        where: { userId, date: { gte: monthStart } },
        select: { type: true, amount: true, categoryId: true },
      }),
      db.transaction.findMany({
        where: { userId, date: { gte: sixMonthsAgo }, type: { in: ["INCOME", "EXPENSE"] } },
        select: { type: true, amount: true, date: true },
      }),
      db.budget.findMany({
        where: { userId, period: "MONTHLY" },
        include: { category: true },
      }),
      db.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 8,
        include: { category: true, account: true },
      }),
    ])

  const totalBalance = accounts.reduce((sum, a) => sum + toNumber(a.balance), 0)
  const liquidBalance = accounts
    .filter((a) => (LIQUID_TYPES as readonly string[]).includes(a.type))
    .reduce((sum, a) => sum + Math.max(0, toNumber(a.balance)), 0)
  const savingsBalance = accounts
    .filter((a) => a.type === "SAVINGS")
    .reduce((sum, a) => sum + toNumber(a.balance), 0)
  const debtBalance = accounts
    .filter((a) => (DEBT_TYPES as readonly string[]).includes(a.type))
    .reduce((sum, a) => sum + Math.max(0, -toNumber(a.balance)), 0)

  const investmentsValue = investments.reduce(
    (sum, inv) => sum + toNumber(inv.quantity) * toNumber(inv.currentPrice),
    0
  )
  const investmentsCostBasis = investments.reduce(
    (sum, inv) => sum + toNumber(inv.quantity) * toNumber(inv.purchasePrice),
    0
  )
  const investmentsGain = investmentsValue - investmentsCostBasis
  const investmentsGainPercent =
    investmentsCostBasis > 0 ? (investmentsGain / investmentsCostBasis) * 100 : 0

  const monthlyIncome = monthTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + toNumber(t.amount), 0)
  const monthlyExpenses = monthTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + toNumber(t.amount), 0)

  const spentByCategory = new Map<string, number>()
  for (const t of monthTransactions) {
    if (t.type !== "EXPENSE" || !t.categoryId) continue
    spentByCategory.set(
      t.categoryId,
      (spentByCategory.get(t.categoryId) ?? 0) + toNumber(t.amount)
    )
  }

  const budgetSummaries = budgets.map((budget) => {
    const spent = spentByCategory.get(budget.categoryId) ?? 0
    const amount = toNumber(budget.amount)
    const percent = amount > 0 ? Math.round((spent / amount) * 100) : 0
    return {
      id: budget.id,
      categoryName: budget.category.name,
      categoryColor: budget.category.color,
      categoryIcon: budget.category.icon,
      amount,
      spent,
      percent,
      isOverBudget: spent > amount,
    }
  })

  const budgetsOverCount = budgetSummaries.filter((b) => b.isOverBudget).length

  const trendMap = new Map<string, { income: number; expenses: number }>()
  for (let i = 0; i < 6; i++) {
    const d = startOfMonthsAgo(now, 5 - i)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    trendMap.set(key, { income: 0, expenses: 0 })
  }
  for (const t of trendTransactions) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const bucket = trendMap.get(key)
    if (!bucket) continue
    if (t.type === "INCOME") bucket.income += toNumber(t.amount)
    else bucket.expenses += toNumber(t.amount)
  }

  const cashFlowTrend = Array.from(trendMap.entries()).map(([key, value]) => {
    const [year, month] = key.split("-").map(Number)
    const label = new Date(year, month, 1).toLocaleDateString("en-US", {
      month: "short",
    })
    return {
      month: label,
      income: Math.round(value.income * 100) / 100,
      expenses: Math.round(value.expenses * 100) / 100,
      net: Math.round((value.income - value.expenses) * 100) / 100,
    }
  })

  const health = computeFinancialHealthScore({
    monthlyIncome,
    monthlyExpenses,
    totalLiquidBalance: liquidBalance,
    totalDebtBalance: debtBalance,
    budgetsOverCount,
    budgetsTotalCount: budgetSummaries.length,
    emergencyFundBalance: savingsBalance,
  })

  return {
    totalBalance: Math.round(totalBalance * 100) / 100,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    netCashFlow: Math.round((monthlyIncome - monthlyExpenses) * 100) / 100,
    savingsBalance: Math.round(savingsBalance * 100) / 100,
    investmentsValue: Math.round(investmentsValue * 100) / 100,
    investmentsGain: Math.round(investmentsGain * 100) / 100,
    investmentsGainPercent: Math.round(investmentsGainPercent * 10) / 10,
    accountsCount: accounts.length,
    budgets: budgetSummaries,
    cashFlowTrend,
    financialHealth: health,
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id,
      description: t.description,
      amount: toNumber(t.amount),
      type: t.type,
      date: t.date,
      currency: t.currency,
      category: t.category
        ? { name: t.category.name, color: t.category.color, icon: t.category.icon }
        : null,
      account: { name: t.account.name, color: t.account.color },
    })),
  }
}

export type DashboardSummary = Awaited<ReturnType<typeof getDashboardSummary>>
