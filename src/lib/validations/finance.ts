import { z } from "zod"

export const financialAccountTypeEnum = z.enum([
  "CHECKING",
  "SAVINGS",
  "CREDIT_CARD",
  "CASH",
  "INVESTMENT",
  "LOAN",
  "OTHER",
])

export const categoryTypeEnum = z.enum(["INCOME", "EXPENSE"])

export const transactionTypeEnum = z.enum(["INCOME", "EXPENSE", "TRANSFER"])

export const budgetPeriodEnum = z.enum(["WEEKLY", "MONTHLY", "YEARLY"])

export const recurringFrequencyEnum = z.enum([
  "DAILY",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
  "YEARLY",
])

export const goalStatusEnum = z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"])

export const investmentTypeEnum = z.enum([
  "STOCK",
  "CRYPTO",
  "BOND",
  "MUTUAL_FUND",
  "ETF",
  "REAL_ESTATE",
  "OTHER",
])

// Note: fields intentionally avoid zod's `.default()` — the UI always
// supplies complete values via react-hook-form defaultValues, and mixing
// `.default()` with useForm<z.infer<...>> creates a well-known type
// mismatch between the pre-validation (input) and post-validation
// (output) shapes.

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(60),
  type: financialAccountTypeEnum,
  currency: z.string().length(3),
  balance: z.coerce.number().finite(),
  color: z.string().min(1),
  icon: z.string().min(1),
  isArchived: z.boolean().optional(),
})

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: categoryTypeEnum,
  color: z.string().min(1),
  icon: z.string().min(1),
  parentId: z.string().nullish(),
})

export const transactionSchema = z
  .object({
    accountId: z.string().min(1, "Account is required"),
    categoryId: z.string().nullish(),
    type: transactionTypeEnum,
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    currency: z.string().length(3),
    description: z.string().min(1, "Description is required").max(160),
    notes: z.string().max(1000).nullish(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    transferToAccountId: z.string().nullish(),
    receiptUrl: z.string().url().nullish(),
  })
  .refine(
    (data) => data.type !== "TRANSFER" || !!data.transferToAccountId,
    { message: "Destination account is required for transfers", path: ["transferToAccountId"] }
  )
  .refine(
    (data) =>
      data.type !== "TRANSFER" || data.transferToAccountId !== data.accountId,
    { message: "Destination account must differ from source account", path: ["transferToAccountId"] }
  )
  .refine((data) => data.type === "TRANSFER" || !!data.categoryId, {
    message: "Category is required",
    path: ["categoryId"],
  })

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  period: budgetPeriodEnum,
  rollover: z.boolean(),
})

export const recurringBillSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().nullish(),
  name: z.string().min(1, "Name is required").max(80),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  currency: z.string().length(3),
  frequency: recurringFrequencyEnum,
  nextDueDate: z.coerce.date(),
  autoPay: z.boolean(),
  reminderDays: z.coerce.number().int().min(0).max(30),
  isActive: z.boolean(),
})

export const goalSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().max(500).nullish(),
  targetAmount: z.coerce.number().positive("Target must be greater than 0"),
  currentAmount: z.coerce.number().min(0),
  currency: z.string().length(3),
  targetDate: z.coerce.date().nullish(),
  icon: z.string().min(1),
  color: z.string().min(1),
  status: goalStatusEnum,
})

export const investmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  symbol: z.string().max(20).nullish(),
  type: investmentTypeEnum,
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  purchasePrice: z.coerce.number().nonnegative(),
  currentPrice: z.coerce.number().nonnegative(),
  currency: z.string().length(3),
  purchaseDate: z.coerce.date(),
  accountId: z.string().nullish(),
})

export const transferSchema = z
  .object({
    fromAccountId: z.string().min(1, "Source account is required"),
    toAccountId: z.string().min(1, "Destination account is required"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    description: z.string().max(160),
    date: z.coerce.date(),
  })
  .refine((data) => data.fromAccountId !== data.toAccountId, {
    message: "Source and destination accounts must differ",
    path: ["toAccountId"],
  })

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  image: z.string().url().nullish().or(z.literal("")),
  baseCurrency: z.string().length(3),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type AccountInput = z.infer<typeof accountSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type RecurringBillInput = z.infer<typeof recurringBillSchema>
export type GoalInput = z.infer<typeof goalSchema>
export type InvestmentInput = z.infer<typeof investmentSchema>
export type TransferInput = z.infer<typeof transferSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
