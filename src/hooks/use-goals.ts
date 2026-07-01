import useSWR from "swr"
import type { Goal } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"

export function useGoals() {
  const { data, error, isLoading, mutate } = useSWR<{ goals: Goal[] }>(
    "/api/goals",
    fetcher
  )

  return {
    goals: data?.goals ?? [],
    isLoading,
    error,
    mutate,
  }
}
