"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, MoreHorizontal, PiggyBank } from "lucide-react"

import { useBudgets, type BudgetWithSpent } from "@/hooks/use-budgets"
import { formatCurrency, toTitleCase } from "@/lib/format"
import { getIcon } from "@/lib/icon-map"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"

export default function BudgetsPage() {
  const { budgets, isLoading, mutate } = useBudgets()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingBudget, setEditingBudget] = React.useState<BudgetWithSpent | undefined>()
  const [deletingBudget, setDeletingBudget] = React.useState<BudgetWithSpent | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete() {
    if (!deletingBudget) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/budgets/${deletingBudget.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error ?? "Failed to delete budget")
        return
      }
      toast.success("Budget deleted")
      setDeletingBudget(undefined)
      mutate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Budgets"
        description="Set spending limits and track your progress"
        actions={
          <Button
            onClick={() => {
              setEditingBudget(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Create budget
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No budgets yet"
          description="Set monthly spending limits per category and we'll track your progress automatically."
          action={
            <Button
              onClick={() => {
                setEditingBudget(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Create your first budget
            </Button>
          }
        />
      ) : (
        <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const Icon = getIcon(budget.category.icon)
            const isOver = budget.spent > budget.amount
            return (
              <div key={budget.id} className="glass hover-lift group rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-9 items-center justify-center rounded-lg text-white shadow-md transition-transform duration-300 motion-safe:group-hover:scale-110"
                      style={{ backgroundColor: budget.category.color }}
                    >
                      <Icon className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium">{budget.category.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {toTitleCase(budget.period)}
                      </p>
                    </div>
                  </div>
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
                          setEditingBudget(budget)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingBudget(budget)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span
                      className={cn(
                        "text-lg font-semibold",
                        isOver && "text-destructive"
                      )}
                    >
                      {formatCurrency(budget.spent, "PKR")}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      of {formatCurrency(budget.amount, "PKR")}
                    </span>
                  </div>
                  <Progress
                    value={Math.min(budget.percent, 100)}
                    className={cn(
                      isOver && "[&_[data-slot=progress-indicator]]:bg-destructive"
                    )}
                  />
                  <p className="text-muted-foreground mt-1.5 text-xs">
                    {isOver
                      ? `${formatCurrency(budget.spent - budget.amount, "PKR")} over budget`
                      : `${formatCurrency(budget.amount - budget.spent, "PKR")} remaining`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <BudgetFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        budget={editingBudget}
        onSuccess={mutate}
      />
      <ConfirmDialog
        open={!!deletingBudget}
        onOpenChange={(open) => !open && setDeletingBudget(undefined)}
        title="Delete budget?"
        description="This will permanently delete this budget."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
