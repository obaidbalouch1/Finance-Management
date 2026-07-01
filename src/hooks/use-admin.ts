import useSWR from "swr"

import { fetcher } from "@/lib/fetcher"
import type { AdminOverview } from "@/lib/queries/admin"
import type { SystemSettings } from "@/lib/queries/system-settings"

export function useAdminOverview() {
  const { data, isLoading } = useSWR<AdminOverview>("/api/admin/overview", fetcher, {
    refreshInterval: 30_000,
  })
  return { data, isLoading }
}

export type AdminUser = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: "ADMIN" | "USER"
  status: "ACTIVE" | "SUSPENDED"
  baseCurrency: string
  createdAt: string
  _count: { transactions: number; financialAccounts: number }
}

export function useAdminUsers(params: {
  page: number
  pageSize: number
  search?: string
  role?: string
  status?: string
}) {
  const query = new URLSearchParams()
  query.set("page", String(params.page))
  query.set("pageSize", String(params.pageSize))
  if (params.search) query.set("search", params.search)
  if (params.role) query.set("role", params.role)
  if (params.status) query.set("status", params.status)

  const { data, isLoading, mutate } = useSWR<{
    users: AdminUser[]
    pagination: { page: number; pageSize: number; total: number; pageCount: number }
  }>(`/api/admin/users?${query.toString()}`, fetcher)

  return {
    users: data?.users ?? [],
    pagination: data?.pagination,
    isLoading,
    mutate,
  }
}

export type AuditLogEntry = {
  id: string
  action: string
  entity: string
  entityId: string | null
  metadata: unknown
  createdAt: string
  user: { name: string | null; email: string; image: string | null } | null
}

export function useAuditLog(page: number, pageSize = 20) {
  const { data, isLoading } = useSWR<{
    logs: AuditLogEntry[]
    pagination: { page: number; pageSize: number; total: number; pageCount: number }
  }>(`/api/admin/audit-log?page=${page}&pageSize=${pageSize}`, fetcher)

  return { logs: data?.logs ?? [], pagination: data?.pagination, isLoading }
}

export function useSystemSettings() {
  const { data, isLoading, mutate } = useSWR<{ settings: SystemSettings }>(
    "/api/admin/settings",
    fetcher
  )
  return { settings: data?.settings, isLoading, mutate }
}
