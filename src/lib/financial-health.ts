export type FinancialHealthInputs = {
  monthlyIncome: number
  monthlyExpenses: number
  totalLiquidBalance: number
  totalDebtBalance: number
  budgetsOverCount: number
  budgetsTotalCount: number
  emergencyFundBalance: number
}

export type FinancialHealthResult = {
  score: number
  label: "Excellent" | "Good" | "Fair" | "Needs attention"
  breakdown: {
    savingsRate: number
    budgetAdherence: number
    debtRatio: number
    emergencyFundMonths: number
  }
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Deterministic 0-100 financial health score blending four signals investors
 * commonly track: savings rate, budget adherence, debt-to-liquidity ratio,
 * and emergency fund runway. Weights sum to 1.
 */
export function computeFinancialHealthScore(
  inputs: FinancialHealthInputs
): FinancialHealthResult {
  const {
    monthlyIncome,
    monthlyExpenses,
    totalLiquidBalance,
    totalDebtBalance,
    budgetsOverCount,
    budgetsTotalCount,
    emergencyFundBalance,
  } = inputs

  const savingsRateRaw =
    monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0
  const savingsRateScore = clamp((savingsRateRaw / 0.2) * 100)

  const budgetAdherenceScore =
    budgetsTotalCount > 0
      ? clamp(((budgetsTotalCount - budgetsOverCount) / budgetsTotalCount) * 100)
      : 100

  const debtRatioRaw =
    totalLiquidBalance > 0
      ? totalDebtBalance / (totalLiquidBalance + totalDebtBalance)
      : totalDebtBalance > 0
        ? 1
        : 0
  const debtRatioScore = clamp(100 - debtRatioRaw * 100)

  const emergencyFundMonths =
    monthlyExpenses > 0 ? emergencyFundBalance / monthlyExpenses : 0
  const emergencyFundScore = clamp((emergencyFundMonths / 6) * 100)

  const score = Math.round(
    savingsRateScore * 0.3 +
      budgetAdherenceScore * 0.25 +
      debtRatioScore * 0.25 +
      emergencyFundScore * 0.2
  )

  let label: FinancialHealthResult["label"] = "Needs attention"
  if (score >= 80) label = "Excellent"
  else if (score >= 60) label = "Good"
  else if (score >= 40) label = "Fair"

  return {
    score,
    label,
    breakdown: {
      savingsRate: Math.round(savingsRateRaw * 100),
      budgetAdherence: Math.round(budgetAdherenceScore),
      debtRatio: Math.round(debtRatioRaw * 100),
      emergencyFundMonths: Math.round(emergencyFundMonths * 10) / 10,
    },
  }
}
