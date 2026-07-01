import Link from "next/link"
import { PiggyBank } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/format"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

type BudgetSummary = {
  id: string
  categoryName: string
  categoryColor: string
  amount: number
  spent: number
  percent: number
  isOverBudget: boolean
}

export function BudgetsOverview({
  budgets,
  currency,
}: {
  budgets: BudgetSummary[]
  currency: string
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <PiggyBank className="size-4" />
          </span>
          <h3 className="font-medium">Budgets this month</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/budgets" />}
        >
          View all
        </Button>
      </div>

      {budgets.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">
          No budgets set up yet.
        </p>
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 5).map((budget) => (
            <div key={budget.id}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 font-medium">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: budget.categoryColor }}
                  />
                  {budget.categoryName}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatCurrency(budget.spent, currency)} /{" "}
                  {formatCurrency(budget.amount, currency)}
                </span>
              </div>
              <Progress
                value={Math.min(budget.percent, 100)}
                className={cn(
                  budget.isOverBudget &&
                    "[&_[data-slot=progress-indicator]]:bg-destructive"
                )}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
