import useSWR from "swr"
import type { DateRange } from "react-day-picker"

import { fetcher } from "@/lib/fetcher"
import type { AnalyticsData } from "@/lib/queries/analytics"

export function useAnalytics(range: DateRange) {
  const params = new URLSearchParams()
  if (range.from) params.set("from", range.from.toISOString())
  if (range.to) params.set("to", range.to.toISOString())

  const { data, error, isLoading } = useSWR<AnalyticsData>(
    range.from && range.to ? `/api/analytics?${params.toString()}` : null,
    fetcher
  )

  return { data, isLoading, error }
}
