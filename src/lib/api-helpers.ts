import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { auth } from "@/auth"

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return { session: null, error: jsonError("Unauthorized", 401) } as const
  }
  if (session.user.role !== "ADMIN") {
    return { session: null, error: jsonError("Forbidden", 403) } as const
  }
  return { session, error: null } as const
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1)
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 10) || 10))
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

export function parseSort<T extends string>(
  searchParams: URLSearchParams,
  allowed: readonly T[],
  fallback: T
): { field: T; direction: "asc" | "desc" } {
  const sortParam = searchParams.get("sort")
  const direction = searchParams.get("order") === "asc" ? "asc" : "desc"
  const field = allowed.includes(sortParam as T) ? (sortParam as T) : fallback
  return { field, direction }
}

export function jsonError(message: string, status = 400, issues?: unknown) {
  return NextResponse.json({ error: message, issues }, { status })
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError("Validation failed", 422, error.flatten().fieldErrors)
  }
  console.error("[API_ERROR]", error)
  return jsonError("Something went wrong. Please try again.", 500)
}
