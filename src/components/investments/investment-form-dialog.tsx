"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { investmentSchema, type InvestmentInput } from "@/lib/validations/finance"
import { useAccounts } from "@/hooks/use-accounts"
import type { InvestmentWithRelations } from "@/hooks/use-investments"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/date-picker"

const INVESTMENT_TYPES = [
  { value: "STOCK", label: "Stock" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "BOND", label: "Bond" },
  { value: "MUTUAL_FUND", label: "Mutual fund" },
  { value: "ETF", label: "ETF" },
  { value: "REAL_ESTATE", label: "Real estate" },
  { value: "OTHER", label: "Other" },
]

export function InvestmentFormDialog({
  open,
  onOpenChange,
  investment,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  investment?: InvestmentWithRelations
  onSuccess: () => void
}) {
  const isEditing = !!investment
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { accounts } = useAccounts()

  const form = useForm<InvestmentInput>({
    resolver: zodResolver(investmentSchema),
    defaultValues: {
      name: investment?.name ?? "",
      symbol: investment?.symbol ?? "",
      type: investment?.type ?? "STOCK",
      quantity: investment ? Number(investment.quantity) : 1,
      purchasePrice: investment ? Number(investment.purchasePrice) : 0,
      currentPrice: investment ? Number(investment.currentPrice) : 0,
      currency: "PKR",
      purchaseDate: investment?.purchaseDate ? new Date(investment.purchaseDate) : new Date(),
      accountId: investment?.accountId ?? null,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: investment?.name ?? "",
        symbol: investment?.symbol ?? "",
        type: investment?.type ?? "STOCK",
        quantity: investment ? Number(investment.quantity) : 1,
        purchasePrice: investment ? Number(investment.purchasePrice) : 0,
        currentPrice: investment ? Number(investment.currentPrice) : 0,
        currency: "PKR",
        purchaseDate: investment?.purchaseDate
          ? new Date(investment.purchaseDate)
          : new Date(),
        accountId: investment?.accountId ?? null,
      })
    }
  }, [open, investment, form])

  async function onSubmit(values: InvestmentInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        isEditing ? `/api/investments/${investment.id}` : "/api/investments",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error ?? "Something went wrong")
        return
      }
      toast.success(isEditing ? "Investment updated" : "Investment added")
      onOpenChange(false)
      onSuccess()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit investment" : "Add investment"}
          </DialogTitle>
          <DialogDescription>
            Track stocks, crypto, and other assets.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Apple Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="AAPL" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INVESTMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buy price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase date</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked account</FormLabel>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {accounts.map((a) => (
                          <SelectItem key={a.id} value={a.id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Save changes" : "Add investment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
