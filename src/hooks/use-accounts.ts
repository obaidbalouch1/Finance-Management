import useSWR from "swr"
import type { FinancialAccount } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"

export function useAccounts(options?: { includeArchived?: boolean }) {
  const params = new URLSearchParams()
  if (options?.includeArchived) params.set("includeArchived", "true")

  const { data, error, isLoading, mutate } = useSWR<{ accounts: FinancialAccount[] }>(
    `/api/accounts?${params.toString()}`,
    fetcher
  )

  return {
    accounts: data?.accounts ?? [],
    isLoading,
    error,
    mutate,
  }
}
