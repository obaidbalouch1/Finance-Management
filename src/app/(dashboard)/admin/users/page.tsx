"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import type { ColumnDef } from "@tanstack/react-table"
import { Plus, MoreHorizontal, ShieldCheck, ShieldOff, UserX, UserCheck, Trash2 } from "lucide-react"

import { useAdminUsers, type AdminUser } from "@/hooks/use-admin"
import { formatDate } from "@/lib/format"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { UserFormDialog } from "@/components/admin/user-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function AdminUsersPage() {
  const { data: currentSession } = useSession()
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [role, setRole] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [deletingUser, setDeletingUser] = React.useState<AdminUser | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { users, pagination, isLoading, mutate } = useAdminUsers({
    page,
    pageSize: 10,
    search: search || undefined,
    role: role === "all" ? undefined : role,
    status: status === "all" ? undefined : status,
  })

  async function updateUser(id: string, patch: Record<string, string>) {
    const response = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const data = await response.json()
    if (!response.ok) {
      toast.error(data.error ?? "Failed to update user")
      return
    }
    toast.success("User updated")
    mutate()
  }

  async function handleDelete() {
    if (!deletingUser) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/admin/users/${deletingUser.id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error ?? "Failed to delete user")
        return
      }
      toast.success("User deleted")
      setDeletingUser(undefined)
      mutate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "name",
      header: "User",
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8">
              <AvatarImage src={u.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {(u.name ?? u.email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{u.name ?? "—"}</p>
              <p className="text-muted-foreground truncate text-xs">{u.email}</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "ADMIN" ? "default" : "outline"}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          className={
            row.original.status === "ACTIVE"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "activity",
      header: "Activity",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">
          {row.original._count.transactions} txns · {row.original._count.financialAccounts} accounts
        </span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }) => formatDate(row.original.createdAt),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const u = row.original
        const isSelf = u.id === currentSession?.user?.id
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              {u.role === "USER" ? (
                <DropdownMenuItem onClick={() => updateUser(u.id, { role: "ADMIN" })}>
                  <ShieldCheck />
                  Make admin
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={isSelf}
                  onClick={() => updateUser(u.id, { role: "USER" })}
                >
                  <ShieldOff />
                  Remove admin
                </DropdownMenuItem>
              )}
              {u.status === "ACTIVE" ? (
                <DropdownMenuItem
                  disabled={isSelf}
                  onClick={() => updateUser(u.id, { status: "SUSPENDED" })}
                >
                  <UserX />
                  Suspend
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => updateUser(u.id, { status: "ACTIVE" })}>
                  <UserCheck />
                  Reactivate
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                disabled={isSelf}
                onClick={() => setDeletingUser(u)}
              >
                <Trash2 />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user accounts, roles, and access"
        actions={
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="size-4" />
            Add user
          </Button>
        }
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Search users..."
        filters={
          <>
            <Select
              value={role}
              onValueChange={(v) => {
                setRole(v ?? "all")
                setPage(1)
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v ?? "all")
                setPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        page={pagination?.page ?? 1}
        pageCount={pagination?.pageCount ?? 1}
        onPageChange={setPage}
        emptyMessage="No users found."
      />

      <UserFormDialog open={formOpen} onOpenChange={setFormOpen} onSuccess={mutate} />
      <ConfirmDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(undefined)}
        title="Delete user?"
        description={`This will permanently delete ${deletingUser?.email} and all of their data.`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
