"use client"

import * as React from "react"
import { toast } from "sonner"
import type { SortingState } from "@tanstack/react-table"
import { type ColumnDef } from "@tanstack/react-table"
import { Plus, MoreHorizontal, Pencil, Trash2, Receipt } from "lucide-react"

import { useTransactions, type TransactionWithRelations } from "@/hooks/use-transactions"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { formatCurrency, formatDate } from "@/lib/format"
import { getIcon } from "@/lib/icon-map"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { DataTable, SortableHeader } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function TransactionsPage() {
  const [page, setPage] = React.useState(1)
  const [search, setSearch] = React.useState("")
  const [type, setType] = React.useState<string>("all")
  const [accountId, setAccountId] = React.useState<string>("all")
  const [categoryId, setCategoryId] = React.useState<string>("all")
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "date", desc: true }])

  const [formOpen, setFormOpen] = React.useState(false)
  const [editingTransaction, setEditingTransaction] = React.useState<TransactionWithRelations | undefined>()
  const [deletingTransaction, setDeletingTransaction] = React.useState<TransactionWithRelations | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const { accounts } = useAccounts()
  const { categories } = useCategories()

  const { transactions, pagination, isLoading, mutate } = useTransactions({
    page,
    pageSize: 10,
    search: search || undefined,
    type: type === "all" ? undefined : type,
    accountId: accountId === "all" ? undefined : accountId,
    categoryId: categoryId === "all" ? undefined : categoryId,
    sort: sorting[0]?.id,
    order: sorting[0]?.desc ? "desc" : "asc",
  })

  async function handleDelete() {
    if (!deletingTransaction) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/transactions/${deletingTransaction.id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error ?? "Failed to delete transaction")
        return
      }
      toast.success("Transaction deleted")
      setDeletingTransaction(undefined)
      mutate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: ColumnDef<TransactionWithRelations>[] = [
    {
      accessorKey: "description",
      header: ({ column }) => (
        <SortableHeader column={column}>Description</SortableHeader>
      ),
      cell: ({ row }) => {
        const t = row.original
        const Icon = t.category ? getIcon(t.category.icon) : Receipt
        return (
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: `${t.category?.color ?? "#6366f1"}1a`,
                color: t.category?.color ?? "#6366f1",
              }}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium">{t.description}</p>
              <p className="text-muted-foreground truncate text-xs">
                {t.category?.name ?? "Transfer"}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "account",
      header: "Account",
      cell: ({ row }) => row.original.account.name,
    },
    {
      accessorKey: "date",
      header: ({ column }) => <SortableHeader column={column}>Date</SortableHeader>,
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <SortableHeader column={column}>Amount</SortableHeader>
      ),
      cell: ({ row }) => {
        const t = row.original
        const sign = t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "-" : ""
        return (
          <span
            className={
              t.type === "INCOME"
                ? "text-success font-medium"
                : t.type === "EXPENSE"
                  ? "font-medium"
                  : "text-primary font-medium"
            }
          >
            {sign}
            {formatCurrency(Number(t.amount), t.currency)}
          </span>
        )
      },
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.type}</Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const t = row.original
        const isTransfer = t.type === "TRANSFER"
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
              <DropdownMenuItem
                disabled={isTransfer}
                onClick={() => {
                  setEditingTransaction(t)
                  setFormOpen(true)
                }}
              >
                <Pencil />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeletingTransaction(t)}
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
        title="Transactions"
        description="All your income and expenses in one place"
        actions={
          <Button
            onClick={() => {
              setEditingTransaction(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add transaction
          </Button>
        }
      />

      <DataTableToolbar
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Search transactions..."
        filters={
          <>
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v ?? "all")
                setPage(1)
              }}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={accountId}
              onValueChange={(v) => {
                setAccountId(v ?? "all")
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All accounts</SelectItem>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={categoryId}
              onValueChange={(v) => {
                setCategoryId(v ?? "all")
                setPage(1)
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        page={pagination?.page ?? 1}
        pageCount={pagination?.pageCount ?? 1}
        onPageChange={setPage}
        sorting={sorting}
        onSortingChange={setSorting}
        emptyMessage="No transactions found. Add your first one to get started."
      />

      <TransactionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        transaction={editingTransaction}
        onSuccess={mutate}
      />
      <ConfirmDialog
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(undefined)}
        title="Delete transaction?"
        description="This will permanently delete this transaction and reverse its effect on the account balance."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
