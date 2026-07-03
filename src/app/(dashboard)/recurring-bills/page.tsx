"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, MoreHorizontal, CheckCircle2, CalendarClock, Loader2 } from "lucide-react"

import {
  useRecurringBills,
  type RecurringBillWithRelations,
} from "@/hooks/use-recurring-bills"
import { formatCurrency, formatDate, toTitleCase } from "@/lib/format"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RecurringBillFormDialog } from "@/components/recurring-bills/recurring-bill-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"

function isDueSoon(date: Date | string) {
  const due = new Date(date)
  const now = new Date()
  const diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 7
}

export default function RecurringBillsPage() {
  const { bills, isLoading, mutate } = useRecurringBills()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingBill, setEditingBill] = React.useState<RecurringBillWithRelations | undefined>()
  const [deletingBill, setDeletingBill] = React.useState<RecurringBillWithRelations | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [payingId, setPayingId] = React.useState<string | null>(null)

  async function handleDelete() {
    if (!deletingBill) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/recurring-bills/${deletingBill.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error ?? "Failed to delete recurring bill")
        return
      }
      toast.success("Recurring bill deleted")
      setDeletingBill(undefined)
      mutate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleMarkPaid(bill: RecurringBillWithRelations) {
    setPayingId(bill.id)
    try {
      const response = await fetch(`/api/recurring-bills/${bill.id}/pay`, {
        method: "POST",
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error ?? "Failed to mark as paid")
        return
      }
      toast.success(`${bill.name} marked as paid`)
      mutate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setPayingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Recurring Bills"
        description="Track subscriptions and recurring payments"
        actions={
          <Button
            onClick={() => {
              setEditingBill(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add bill
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No recurring bills yet"
          description="Track subscriptions, rent, and utilities so you never miss a due date."
          action={
            <Button
              onClick={() => {
                setEditingBill(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Add your first bill
            </Button>
          }
        />
      ) : (
        <div className="stagger-children space-y-3">
          {bills.map((bill) => {
            const dueSoon = isDueSoon(bill.nextDueDate)
            return (
              <div
                key={bill.id}
                className="glass hover-lift flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{bill.name}</p>
                    {!bill.isActive && (
                      <Badge variant="secondary">Paused</Badge>
                    )}
                    {bill.isActive && dueSoon && (
                      <Badge className="bg-warning/10 text-warning">
                        Due soon
                      </Badge>
                    )}
                    {bill.autoPay && (
                      <Badge variant="outline">Auto-pay</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {formatCurrency(Number(bill.amount), bill.currency)} ·{" "}
                    {toTitleCase(bill.frequency)} · Next due{" "}
                    {formatDate(bill.nextDueDate)} · {bill.account.name}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={payingId === bill.id}
                    onClick={() => handleMarkPaid(bill)}
                  >
                    {payingId === bill.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="size-3.5" />
                    )}
                    Mark paid
                  </Button>
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
                        onClick={() => {
                          setEditingBill(bill)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingBill(bill)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <RecurringBillFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        bill={editingBill}
        onSuccess={mutate}
      />
      <ConfirmDialog
        open={!!deletingBill}
        onOpenChange={(open) => !open && setDeletingBill(undefined)}
        title="Delete recurring bill?"
        description="This will permanently delete this recurring bill."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
