"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Transaction } from "@prisma/client"

import { transactionSchema, type TransactionInput } from "@/lib/validations/finance"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatePicker } from "@/components/date-picker"
import { ReceiptUpload } from "@/components/transactions/receipt-upload"

type TransactionWithRelations = Transaction & {
  category?: { id: string } | null
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: TransactionWithRelations
  onSuccess: () => void
}) {
  const isEditing = !!transaction
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { accounts } = useAccounts()

  const form = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      accountId: transaction?.accountId ?? "",
      categoryId: transaction?.categoryId ?? null,
      type: transaction?.type === "TRANSFER" ? "EXPENSE" : (transaction?.type ?? "EXPENSE"),
      amount: transaction ? Number(transaction.amount) : 0,
      currency: "PKR",
      description: transaction?.description ?? "",
      notes: transaction?.notes ?? "",
      date: transaction?.date ? new Date(transaction.date) : new Date(),
      tags: transaction?.tags ?? [],
      receiptUrl: transaction?.receiptUrl ?? null,
    },
  })

  const type = form.watch("type") as "INCOME" | "EXPENSE"
  const { categories } = useCategories(type)

  React.useEffect(() => {
    if (open) {
      form.reset({
        accountId: transaction?.accountId ?? accounts[0]?.id ?? "",
        categoryId: transaction?.categoryId ?? null,
        type: transaction?.type === "TRANSFER" ? "EXPENSE" : (transaction?.type ?? "EXPENSE"),
        amount: transaction ? Number(transaction.amount) : 0,
        currency: "PKR",
        description: transaction?.description ?? "",
        notes: transaction?.notes ?? "",
        date: transaction?.date ? new Date(transaction.date) : new Date(),
        tags: transaction?.tags ?? [],
        receiptUrl: transaction?.receiptUrl ?? null,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transaction])

  async function onSubmit(values: TransactionInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        isEditing ? `/api/transactions/${transaction.id}` : "/api/transactions",
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
      toast.success(isEditing ? "Transaction updated" : "Transaction added")
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
            {isEditing ? "Edit transaction" : "Add transaction"}
          </DialogTitle>
          <DialogDescription>
            Record an income or expense transaction.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <Tabs
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v)
                      form.setValue("categoryId", null)
                    }}
                  >
                    <TabsList className="w-full">
                      <TabsTrigger value="EXPENSE" className="flex-1">
                        Expense
                      </TabsTrigger>
                      <TabsTrigger value="INCOME" className="flex-1">
                        Income
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Grocery run" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <DatePicker value={field.value} onChange={field.onChange} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="accountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select account" />
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="receiptUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Receipt (optional)</FormLabel>
                  <ReceiptUpload value={field.value} onChange={field.onChange} />
                </FormItem>
              )}
            />

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
                {isEditing ? "Save changes" : "Add transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
