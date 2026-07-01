import useSWR from "swr"
import type { Investment, FinancialAccount } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"

export type InvestmentWithRelations = Investment & {
  account: FinancialAccount | null
}

export function useInvestments() {
  const { data, error, isLoading, mutate } = useSWR<{
    investments: InvestmentWithRelations[]
  }>("/api/investments", fetcher)

  return {
    investments: data?.investments ?? [],
    isLoading,
    error,
    mutate,
  }
}
