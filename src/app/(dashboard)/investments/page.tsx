"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react"

import { useInvestments, type InvestmentWithRelations } from "@/hooks/use-investments"
import { formatCurrency, toTitleCase } from "@/lib/format"
import { PageHeader } from "@/components/dashboard/page-header"
import { StatCard } from "@/components/dashboard/stat-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { InvestmentFormDialog } from "@/components/investments/investment-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function InvestmentsPage() {
  const { investments, isLoading, mutate } = useInvestments()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingInvestment, setEditingInvestment] = React.useState<InvestmentWithRelations | undefined>()
  const [deletingInvestment, setDeletingInvestment] = React.useState<InvestmentWithRelations | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const totalValue = investments.reduce(
    (sum, inv) => sum + Number(inv.quantity) * Number(inv.currentPrice),
    0
  )
  const totalCost = investments.reduce(
    (sum, inv) => sum + Number(inv.quantity) * Number(inv.purchasePrice),
    0
  )
  const totalGain = totalValue - totalCost
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  async function handleDelete() {
    if (!deletingInvestment) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/investments/${deletingInvestment.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const data = await response.json()
        toast.error(data.error ?? "Failed to delete investment")
        return
      }
      toast.success("Investment deleted")
      setDeletingInvestment(undefined)
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
        title="Investments"
        description="Track your portfolio performance"
        actions={
          <Button
            onClick={() => {
              setEditingInvestment(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add investment
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Portfolio value"
          value={formatCurrency(totalValue, "PKR")}
          icon={TrendingUp}
          accent="primary"
        />
        <StatCard
          label="Total invested"
          value={formatCurrency(totalCost, "PKR")}
          icon={TrendingUp}
          accent="primary"
        />
        <StatCard
          label="All-time gain"
          value={formatCurrency(totalGain, "PKR")}
          icon={totalGain >= 0 ? TrendingUp : TrendingDown}
          accent={totalGain >= 0 ? "success" : "destructive"}
          trend={{ value: Math.round(totalGainPercent * 10) / 10 }}
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : investments.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">
            No investments yet. Add your first holding to track performance.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => {
            const value = Number(investment.quantity) * Number(investment.currentPrice)
            const cost = Number(investment.quantity) * Number(investment.purchasePrice)
            const gain = value - cost
            const gainPercent = cost > 0 ? (gain / cost) * 100 : 0

            return (
              <div key={investment.id} className="glass rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{investment.name}</p>
                    <div className="mt-1 flex items-center gap-1.5">
                      {investment.symbol && (
                        <Badge variant="outline" className="text-[10px]">
                          {investment.symbol}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {toTitleCase(investment.type)}
                      </Badge>
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
                          setEditingInvestment(investment)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeletingInvestment(investment)}
                      >
                        <Trash2 />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <p className="mt-4 text-2xl font-semibold">
                  {formatCurrency(value, investment.currency)}
                </p>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  {gain >= 0 ? (
                    <TrendingUp className="text-success size-3.5" />
                  ) : (
                    <TrendingDown className="text-destructive size-3.5" />
                  )}
                  <span className={gain >= 0 ? "text-success" : "text-destructive"}>
                    {formatCurrency(Math.abs(gain), investment.currency)} (
                    {Math.abs(Math.round(gainPercent * 10) / 10)}%)
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {Number(investment.quantity)} units @{" "}
                  {formatCurrency(Number(investment.currentPrice), investment.currency)}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <InvestmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        investment={editingInvestment}
        onSuccess={mutate}
      />
      <ConfirmDialog
        open={!!deletingInvestment}
        onOpenChange={(open) => !open && setDeletingInvestment(undefined)}
        title="Delete investment?"
        description="This will permanently delete this investment from your portfolio."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
