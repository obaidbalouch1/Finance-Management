import useSWR from "swr"
import type { RecurringBill, Category, FinancialAccount } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"

export type RecurringBillWithRelations = RecurringBill & {
  category: Category | null
  account: FinancialAccount
}

export function useRecurringBills() {
  const { data, error, isLoading, mutate } = useSWR<{
    bills: RecurringBillWithRelations[]
  }>("/api/recurring-bills", fetcher)

  return {
    bills: data?.bills ?? [],
    isLoading,
    error,
    mutate,
  }
}
