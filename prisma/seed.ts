import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Housing", icon: "home", color: "#f97316" },
  { name: "Groceries", icon: "shopping-cart", color: "#22c55e" },
  { name: "Transportation", icon: "car", color: "#3b82f6" },
  { name: "Utilities", icon: "plug", color: "#eab308" },
  { name: "Dining Out", icon: "utensils", color: "#ef4444" },
  { name: "Entertainment", icon: "clapperboard", color: "#a855f7" },
  { name: "Healthcare", icon: "heart-pulse", color: "#ec4899" },
  { name: "Insurance", icon: "shield", color: "#14b8a6" },
  { name: "Shopping", icon: "shopping-bag", color: "#f59e0b" },
  { name: "Education", icon: "graduation-cap", color: "#6366f1" },
  { name: "Travel", icon: "plane", color: "#0ea5e9" },
  { name: "Subscriptions", icon: "repeat", color: "#8b5cf6" },
  { name: "Other Expense", icon: "more-horizontal", color: "#71717a" },
]

const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", icon: "briefcase", color: "#22c55e" },
  { name: "Freelance", icon: "laptop", color: "#3b82f6" },
  { name: "Investments", icon: "trending-up", color: "#a855f7" },
  { name: "Gifts", icon: "gift", color: "#ec4899" },
  { name: "Other Income", icon: "more-horizontal", color: "#71717a" },
]

async function seedSystemCategories() {
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: `system-expense-${cat.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `system-expense-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: cat.name,
        type: "EXPENSE",
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    })
  }

  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: `system-income-${cat.name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        id: `system-income-${cat.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: cat.name,
        type: "INCOME",
        icon: cat.icon,
        color: cat.color,
        isSystem: true,
      },
    })
  }
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com"
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!"
  const passwordHash = await hash(password, 12)

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash,
      baseCurrency: "USD",
    },
  })

  return admin
}

async function seedDemoUser() {
  const email = "demo@example.com"
  const passwordHash = await hash("Demo1234!", 12)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Demo User",
      role: "USER",
      passwordHash,
      baseCurrency: "USD",
    },
  })

  const existingAccounts = await prisma.financialAccount.count({ where: { userId: user.id } })
  if (existingAccounts > 0) return

  const checking = await prisma.financialAccount.create({
    data: {
      userId: user.id,
      name: "Main Checking",
      type: "CHECKING",
      currency: "USD",
      balance: 4250.75,
      color: "#6366f1",
      icon: "landmark",
    },
  })

  const savings = await prisma.financialAccount.create({
    data: {
      userId: user.id,
      name: "Emergency Savings",
      type: "SAVINGS",
      currency: "USD",
      balance: 12500,
      color: "#22c55e",
      icon: "piggy-bank",
    },
  })

  const creditCard = await prisma.financialAccount.create({
    data: {
      userId: user.id,
      name: "Rewards Credit Card",
      type: "CREDIT_CARD",
      currency: "USD",
      balance: -845.32,
      color: "#ef4444",
      icon: "credit-card",
    },
  })

  const salaryCategory = await prisma.category.findFirstOrThrow({ where: { name: "Salary", isSystem: true } })
  const groceriesCategory = await prisma.category.findFirstOrThrow({ where: { name: "Groceries", isSystem: true } })
  const diningCategory = await prisma.category.findFirstOrThrow({ where: { name: "Dining Out", isSystem: true } })
  const housingCategory = await prisma.category.findFirstOrThrow({ where: { name: "Housing", isSystem: true } })
  const entertainmentCategory = await prisma.category.findFirstOrThrow({ where: { name: "Entertainment", isSystem: true } })
  const transportCategory = await prisma.category.findFirstOrThrow({ where: { name: "Transportation", isSystem: true } })

  const now = new Date()
  const daysAgo = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  await prisma.transaction.createMany({
    data: [
      // Anchored to the current calendar month so "this month" totals are
      // always populated regardless of which day the seed script runs on.
      {
        userId: user.id,
        accountId: checking.id,
        categoryId: salaryCategory.id,
        type: "INCOME",
        amount: 5200,
        description: "Monthly salary",
        date: startOfThisMonth,
      },
      {
        userId: user.id,
        accountId: checking.id,
        categoryId: housingCategory.id,
        type: "EXPENSE",
        amount: 1450,
        description: "Rent",
        date: startOfThisMonth,
      },
      {
        userId: user.id,
        accountId: creditCard.id,
        categoryId: groceriesCategory.id,
        type: "EXPENSE",
        amount: 142.3,
        description: "Grocery run",
        date: now,
      },
      {
        userId: user.id,
        accountId: creditCard.id,
        categoryId: diningCategory.id,
        type: "EXPENSE",
        amount: 38.9,
        description: "Coffee & lunch",
        date: now,
      },
      // Historical transactions (may land in earlier months) to give the
      // 6-month cash flow trend chart some variety.
      {
        userId: user.id,
        accountId: checking.id,
        categoryId: salaryCategory.id,
        type: "INCOME",
        amount: 5200,
        description: "Monthly salary",
        date: daysAgo(28),
      },
      {
        userId: user.id,
        accountId: checking.id,
        categoryId: housingCategory.id,
        type: "EXPENSE",
        amount: 1450,
        description: "Rent",
        date: daysAgo(27),
      },
      {
        userId: user.id,
        accountId: creditCard.id,
        categoryId: groceriesCategory.id,
        type: "EXPENSE",
        amount: 132.4,
        description: "Weekly groceries",
        date: daysAgo(20),
      },
      {
        userId: user.id,
        accountId: creditCard.id,
        categoryId: diningCategory.id,
        type: "EXPENSE",
        amount: 64.5,
        description: "Dinner with friends",
        date: daysAgo(15),
      },
      {
        userId: user.id,
        accountId: creditCard.id,
        categoryId: entertainmentCategory.id,
        type: "EXPENSE",
        amount: 45,
        description: "Movie night",
        date: daysAgo(12),
      },
      {
        userId: user.id,
        accountId: checking.id,
        categoryId: transportCategory.id,
        type: "EXPENSE",
        amount: 89.2,
        description: "Gas",
        date: daysAgo(8),
      },
      {
        userId: user.id,
        accountId: checking.id,
        categoryId: groceriesCategory.id,
        type: "EXPENSE",
        amount: 156.8,
        description: "Grocery run",
        date: daysAgo(3),
      },
      {
        userId: user.id,
        accountId: checking.id,
        type: "TRANSFER",
        transferToAccountId: savings.id,
        amount: 500,
        description: "Transfer to savings",
        date: daysAgo(2),
      },
    ],
  })

  await prisma.budget.createMany({
    data: [
      { userId: user.id, categoryId: groceriesCategory.id, amount: 500, period: "MONTHLY" },
      { userId: user.id, categoryId: diningCategory.id, amount: 200, period: "MONTHLY" },
      { userId: user.id, categoryId: entertainmentCategory.id, amount: 150, period: "MONTHLY" },
      { userId: user.id, categoryId: transportCategory.id, amount: 200, period: "MONTHLY" },
    ],
  })

  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        name: "Emergency Fund",
        targetAmount: 20000,
        currentAmount: 12500,
        targetDate: new Date(now.getFullYear() + 1, now.getMonth(), 1),
        icon: "shield",
        color: "#22c55e",
      },
      {
        userId: user.id,
        name: "Vacation to Japan",
        targetAmount: 5000,
        currentAmount: 1200,
        targetDate: new Date(now.getFullYear() + 1, 5, 1),
        icon: "plane",
        color: "#0ea5e9",
      },
    ],
  })

  await prisma.recurringBill.createMany({
    data: [
      {
        userId: user.id,
        accountId: checking.id,
        categoryId: housingCategory.id,
        name: "Rent",
        amount: 1450,
        frequency: "MONTHLY",
        nextDueDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
      {
        userId: user.id,
        accountId: creditCard.id,
        name: "Streaming Subscriptions",
        amount: 32.97,
        frequency: "MONTHLY",
        nextDueDate: new Date(now.getFullYear(), now.getMonth(), 15),
      },
    ],
  })

  await prisma.investment.createMany({
    data: [
      {
        userId: user.id,
        name: "Vanguard S&P 500 ETF",
        symbol: "VOO",
        type: "ETF",
        quantity: 12,
        purchasePrice: 380,
        currentPrice: 452,
      },
      {
        userId: user.id,
        name: "Bitcoin",
        symbol: "BTC",
        type: "CRYPTO",
        quantity: 0.15,
        purchasePrice: 38000,
        currentPrice: 61000,
      },
    ],
  })

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Welcome to Finance Manager",
        message: "Your account has been set up with sample data to explore the dashboard.",
        type: "INFO",
      },
      {
        userId: user.id,
        title: "Budget alert",
        message: "You've used 80% of your Dining Out budget this month.",
        type: "WARNING",
      },
    ],
  })
}

async function main() {
  await seedSystemCategories()
  const admin = await seedAdmin()
  await seedDemoUser()
  console.log(`Seed complete. Admin: ${admin.email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
