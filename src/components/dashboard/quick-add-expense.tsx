"use client"

import * as React from "react"
import { mutate } from "swr"
import { toast } from "sonner"
import { Loader2, Plus, Receipt } from "lucide-react"

import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function QuickAddExpense() {
  const { accounts } = useAccounts()
  const { categories } = useCategories("EXPENSE")

  const [amount, setAmount] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [categoryId, setCategoryId] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (categoryId || categories.length === 0) return
    const other = categories.find((c) => c.name === "Other Expense")
    setCategoryId(other?.id ?? categories[0].id)
  }, [categories, categoryId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Enter an amount greater than 0")
      return
    }
    if (!accounts[0]) {
      toast.error("Add an account first")
      return
    }
    if (!categoryId) {
      toast.error("No category available")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accounts[0].id,
          categoryId,
          type: "EXPENSE",
          amount: parsedAmount,
          currency: accounts[0].currency,
          description: description.trim() || "Quick expense",
          date: new Date().toISOString(),
          tags: [],
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Failed to add expense")
        return
      }

      toast.success(`Expense of ${parsedAmount} added`)
      setAmount("")
      setDescription("")
      mutate("/api/dashboard/summary")
      mutate((key) => typeof key === "string" && key.startsWith("/api/transactions"))
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="bg-destructive/10 text-destructive flex size-8 items-center justify-center rounded-lg">
          <Receipt className="size-4" />
        </span>
        <h3 className="font-medium">Quick add expense</h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <div className="flex-1 space-y-1.5">
          <label className="text-muted-foreground text-xs">Amount</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex-[2] space-y-1.5">
          <label className="text-muted-foreground text-xs">What was it for?</label>
          <Input
            placeholder="e.g. Coffee"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-muted-foreground text-xs">Category</label>
          <Select value={categoryId} onValueChange={(v) => v && setCategoryId(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isSubmitting} className="sm:w-auto">
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Add
        </Button>
      </form>
    </div>
  )
}
