"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, MoreHorizontal, Target } from "lucide-react"
import type { Goal } from "@prisma/client"

import { useGoals } from "@/hooks/use-goals"
import { formatCurrency, formatDate } from "@/lib/format"
import { getIcon } from "@/lib/icon-map"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GoalFormDialog } from "@/components/goals/goal-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { EmptyState } from "@/components/empty-state"

export default function GoalsPage() {
  const { goals, isLoading, mutate } = useGoals()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingGoal, setEditingGoal] = React.useState<Goal | undefined>()
  const [deletingGoal, setDeletingGoal] = React.useState<Goal | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)

  async function handleDelete() {
    if (!deletingGoal) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/goals/${deletingGoal.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error ?? "Failed to delete goal")
        return
      }
      toast.success("Goal deleted")
      setDeletingGoal(undefined)
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
        title="Goals"
        description="Save toward what matters most"
        actions={
          <Button
            onClick={() => {
              setEditingGoal(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Create goal
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No goals yet"
          description="Whether it's an emergency fund or a dream vacation, set a target and watch your savings grow."
          action={
            <Button
              onClick={() => {
                setEditingGoal(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Create your first goal
            </Button>
          }
        />
      ) : (
        <div className="stagger-children grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const Icon = getIcon(goal.icon)
            const target = Number(goal.targetAmount)
            const current = Number(goal.currentAmount)
            const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0

            return (
              <div key={goal.id} className="glass hover-lift group rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex size-10 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 motion-safe:group-hover:scale-110"
                      style={{ backgroundColor: goal.color }}
                    >
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="font-medium">{goal.name}</p>
                      {goal.status !== "ACTIVE" && (
                        <Badge variant="secondary" className="mt-0.5 text-[10px]">
                          {goal.status}
                        </Badge>
                      )}
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
                          setEditingGoal(goal)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingGoal(goal)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-lg font-semibold">
                      {formatCurrency(current, goal.currency)}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      of {formatCurrency(target, goal.currency)}
                    </span>
                  </div>
                  <Progress value={percent} />
                  <div className="text-muted-foreground mt-1.5 flex justify-between text-xs">
                    <span>{percent}% funded</span>
                    {goal.targetDate && (
                      <span>by {formatDate(goal.targetDate)}</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <GoalFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        goal={editingGoal}
        onSuccess={mutate}
      />
      <ConfirmDialog
        open={!!deletingGoal}
        onOpenChange={(open) => !open && setDeletingGoal(undefined)}
        title="Delete goal?"
        description="This will permanently delete this goal."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
