"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import {
  recurringBillSchema,
  type RecurringBillInput,
} from "@/lib/validations/finance"
import { useAccounts } from "@/hooks/use-accounts"
import { useCategories } from "@/hooks/use-categories"
import type { RecurringBillWithRelations } from "@/hooks/use-recurring-bills"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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

const FREQUENCIES = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "BIWEEKLY", label: "Biweekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly" },
  { value: "YEARLY", label: "Yearly" },
]

export function RecurringBillFormDialog({
  open,
  onOpenChange,
  bill,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill?: RecurringBillWithRelations
  onSuccess: () => void
}) {
  const isEditing = !!bill
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const { accounts } = useAccounts()
  const { categories } = useCategories("EXPENSE")

  const form = useForm<RecurringBillInput>({
    resolver: zodResolver(recurringBillSchema),
    defaultValues: {
      accountId: bill?.accountId ?? "",
      categoryId: bill?.categoryId ?? null,
      name: bill?.name ?? "",
      amount: bill ? Number(bill.amount) : 0,
      currency: "PKR",
      frequency: bill?.frequency ?? "MONTHLY",
      nextDueDate: bill?.nextDueDate ? new Date(bill.nextDueDate) : new Date(),
      autoPay: bill?.autoPay ?? false,
      reminderDays: bill?.reminderDays ?? 3,
      isActive: bill?.isActive ?? true,
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        accountId: bill?.accountId ?? accounts[0]?.id ?? "",
        categoryId: bill?.categoryId ?? null,
        name: bill?.name ?? "",
        amount: bill ? Number(bill.amount) : 0,
        currency: "PKR",
        frequency: bill?.frequency ?? "MONTHLY",
        nextDueDate: bill?.nextDueDate ? new Date(bill.nextDueDate) : new Date(),
        autoPay: bill?.autoPay ?? false,
        reminderDays: bill?.reminderDays ?? 3,
        isActive: bill?.isActive ?? true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, bill])

  async function onSubmit(values: RecurringBillInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        isEditing ? `/api/recurring-bills/${bill.id}` : "/api/recurring-bills",
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
      toast.success(isEditing ? "Recurring bill updated" : "Recurring bill created")
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
            {isEditing ? "Edit recurring bill" : "Add recurring bill"}
          </DialogTitle>
          <DialogDescription>
            Track subscriptions and recurring payments.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix" {...field} />
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
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          <SelectValue placeholder="Optional" />
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
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nextDueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next due date</FormLabel>
                  <DatePicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="autoPay"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <FormLabel>Auto-pay enabled</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                {isEditing ? "Save changes" : "Create bill"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
