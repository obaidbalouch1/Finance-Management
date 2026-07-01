import useSWR from "swr"
import type { Category } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"

export function useCategories(type?: "INCOME" | "EXPENSE") {
  const params = new URLSearchParams()
  if (type) params.set("type", type)

  const { data, error, isLoading, mutate } = useSWR<{ categories: Category[] }>(
    `/api/categories?${params.toString()}`,
    fetcher
  )

  return {
    categories: data?.categories ?? [],
    isLoading,
    error,
    mutate,
  }
}
