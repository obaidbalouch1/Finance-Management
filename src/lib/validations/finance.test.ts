import { describe, expect, it } from "vitest"

import {
  transactionSchema,
  transferSchema,
  accountSchema,
  budgetSchema,
} from "./finance"

const baseTransaction = {
  accountId: "acc_1",
  categoryId: "cat_1",
  type: "EXPENSE" as const,
  amount: 42.5,
  currency: "USD",
  description: "Groceries",
  notes: null,
  date: new Date(),
  tags: [],
  transferToAccountId: null,
  receiptUrl: null,
}

describe("transactionSchema", () => {
  it("accepts a valid expense", () => {
    const result = transactionSchema.safeParse(baseTransaction)
    expect(result.success).toBe(true)
  })

  it("rejects an expense with no category", () => {
    const result = transactionSchema.safeParse({ ...baseTransaction, categoryId: null })
    expect(result.success).toBe(false)
  })

  it("rejects a zero or negative amount", () => {
    const result = transactionSchema.safeParse({ ...baseTransaction, amount: 0 })
    expect(result.success).toBe(false)
  })

  it("requires transferToAccountId when type is TRANSFER", () => {
    const result = transactionSchema.safeParse({
      ...baseTransaction,
      type: "TRANSFER",
      categoryId: null,
      transferToAccountId: null,
    })
    expect(result.success).toBe(false)
  })

  it("rejects a transfer to the same account", () => {
    const result = transactionSchema.safeParse({
      ...baseTransaction,
      type: "TRANSFER",
      categoryId: null,
      transferToAccountId: "acc_1",
    })
    expect(result.success).toBe(false)
  })

  it("accepts a valid transfer to a different account", () => {
    const result = transactionSchema.safeParse({
      ...baseTransaction,
      type: "TRANSFER",
      categoryId: null,
      transferToAccountId: "acc_2",
    })
    expect(result.success).toBe(true)
  })
})

describe("transferSchema", () => {
  it("rejects transferring to the same account", () => {
    const result = transferSchema.safeParse({
      fromAccountId: "acc_1",
      toAccountId: "acc_1",
      amount: 100,
      description: "test",
      date: new Date(),
    })
    expect(result.success).toBe(false)
  })

  it("accepts a valid transfer", () => {
    const result = transferSchema.safeParse({
      fromAccountId: "acc_1",
      toAccountId: "acc_2",
      amount: 100,
      description: "test",
      date: new Date(),
    })
    expect(result.success).toBe(true)
  })
})

describe("accountSchema", () => {
  it("rejects a currency code that is not 3 letters", () => {
    const result = accountSchema.safeParse({
      name: "Checking",
      type: "CHECKING",
      currency: "US",
      balance: 0,
      color: "#000",
      icon: "wallet",
    })
    expect(result.success).toBe(false)
  })

  it("accepts a negative balance (e.g. credit card debt)", () => {
    const result = accountSchema.safeParse({
      name: "Credit Card",
      type: "CREDIT_CARD",
      currency: "USD",
      balance: -500,
      color: "#000",
      icon: "credit-card",
    })
    expect(result.success).toBe(true)
  })
})

describe("budgetSchema", () => {
  it("rejects a non-positive amount", () => {
    const result = budgetSchema.safeParse({
      categoryId: "cat_1",
      amount: -10,
      period: "MONTHLY",
      rollover: false,
    })
    expect(result.success).toBe(false)
  })
})
