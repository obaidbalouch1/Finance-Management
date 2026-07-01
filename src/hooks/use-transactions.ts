import useSWR from "swr"
import type { Transaction, Category, FinancialAccount } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"

export type TransactionWithRelations = Transaction & {
  category: Category | null
  account: FinancialAccount
  transferToAccount: FinancialAccount | null
}

export type TransactionFilters = {
  page: number
  pageSize: number
  search?: string
  type?: string
  accountId?: string
  categoryId?: string
  dateFrom?: string
  dateTo?: string
  sort?: string
  order?: "asc" | "desc"
}

export function useTransactions(filters: TransactionFilters) {
  const params = new URLSearchParams()
  params.set("page", String(filters.page))
  params.set("pageSize", String(filters.pageSize))
  if (filters.search) params.set("search", filters.search)
  if (filters.type) params.set("type", filters.type)
  if (filters.accountId) params.set("accountId", filters.accountId)
  if (filters.categoryId) params.set("categoryId", filters.categoryId)
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom)
  if (filters.dateTo) params.set("dateTo", filters.dateTo)
  if (filters.sort) params.set("sort", filters.sort)
  if (filters.order) params.set("order", filters.order)

  const { data, error, isLoading, mutate } = useSWR<{
    transactions: TransactionWithRelations[]
    pagination: { page: number; pageSize: number; total: number; pageCount: number }
  }>(`/api/transactions?${params.toString()}`, fetcher)

  return {
    transactions: data?.transactions ?? [],
    pagination: data?.pagination,
    isLoading,
    error,
    mutate,
  }
}
