import useSWR from "swr"
import type { Budget, Category } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"

export type BudgetWithSpent = Budget & {
  category: Category
  amount: number
  spent: number
  percent: number
}

export function useBudgets() {
  const { data, error, isLoading, mutate } = useSWR<{ budgets: BudgetWithSpent[] }>(
    "/api/budgets",
    fetcher
  )

  return {
    budgets: data?.budgets ?? [],
    isLoading,
    error,
    mutate,
  }
}
