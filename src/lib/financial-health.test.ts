import { describe, expect, it } from "vitest"

import { computeFinancialHealthScore } from "./financial-health"

describe("computeFinancialHealthScore", () => {
  it("returns a perfect-ish score for a healthy financial profile", () => {
    const result = computeFinancialHealthScore({
      monthlyIncome: 5000,
      monthlyExpenses: 3000,
      totalLiquidBalance: 20000,
      totalDebtBalance: 0,
      budgetsOverCount: 0,
      budgetsTotalCount: 4,
      emergencyFundBalance: 20000,
    })

    expect(result.score).toBeGreaterThanOrEqual(80)
    expect(result.label).toBe("Excellent")
  })

  it("returns a low score when spending exceeds income and debt is high", () => {
    const result = computeFinancialHealthScore({
      monthlyIncome: 2000,
      monthlyExpenses: 2500,
      totalLiquidBalance: 100,
      totalDebtBalance: 5000,
      budgetsOverCount: 3,
      budgetsTotalCount: 3,
      emergencyFundBalance: 0,
    })

    expect(result.score).toBeLessThan(40)
    expect(result.label).toBe("Needs attention")
  })

  it("does not divide by zero when income is zero", () => {
    const result = computeFinancialHealthScore({
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalLiquidBalance: 0,
      totalDebtBalance: 0,
      budgetsOverCount: 0,
      budgetsTotalCount: 0,
      emergencyFundBalance: 0,
    })

    expect(Number.isFinite(result.score)).toBe(true)
    expect(result.breakdown.savingsRate).toBe(0)
    expect(result.breakdown.emergencyFundMonths).toBe(0)
  })

  it("treats a fully budget-compliant month as 100% adherence", () => {
    const result = computeFinancialHealthScore({
      monthlyIncome: 4000,
      monthlyExpenses: 2000,
      totalLiquidBalance: 5000,
      totalDebtBalance: 0,
      budgetsOverCount: 0,
      budgetsTotalCount: 5,
      emergencyFundBalance: 5000,
    })

    expect(result.breakdown.budgetAdherence).toBe(100)
  })

  it("clamps score to the 0-100 range even with extreme inputs", () => {
    const result = computeFinancialHealthScore({
      monthlyIncome: 100,
      monthlyExpenses: 100000,
      totalLiquidBalance: 0,
      totalDebtBalance: 1_000_000,
      budgetsOverCount: 10,
      budgetsTotalCount: 10,
      emergencyFundBalance: 0,
    })

    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(100)
  })
})
