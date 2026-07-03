"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { FinancialAccount } from "@prisma/client"

import { accountSchema, type AccountInput } from "@/lib/validations/finance"
import { CURRENCIES } from "@/lib/constants"
import { COLOR_PALETTE } from "@/lib/icon-map"
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
import { IconPicker, ColorPicker } from "@/components/icon-picker"

const ACCOUNT_TYPES = [
  { value: "CHECKING", label: "Checking" },
  { value: "SAVINGS", label: "Savings" },
  { value: "CREDIT_CARD", label: "Credit card" },
  { value: "CASH", label: "Cash" },
  { value: "INVESTMENT", label: "Investment" },
  { value: "LOAN", label: "Loan" },
  { value: "OTHER", label: "Other" },
]

export function AccountFormDialog({
  open,
  onOpenChange,
  account,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: FinancialAccount
  onSuccess: () => void
}) {
  const isEditing = !!account
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name ?? "",
      type: account?.type ?? "CHECKING",
      currency: "PKR",
      balance: account ? Number(account.balance) : 0,
      color: account?.color ?? "#6366f1",
      icon: account?.icon ?? "wallet",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: account?.name ?? "",
        type: account?.type ?? "CHECKING",
        currency: "PKR",
        balance: account ? Number(account.balance) : 0,
        color: account?.color ?? "#6366f1",
        icon: account?.icon ?? "wallet",
      })
    }
  }, [open, account, form])

  async function onSubmit(values: AccountInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        isEditing ? `/api/accounts/${account.id}` : "/api/accounts",
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
      toast.success(isEditing ? "Account updated" : "Account created")
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
          <DialogTitle>{isEditing ? "Edit account" : "Add account"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update this account's details."
              : "Add a bank account, credit card, or cash wallet to track."}
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
                    <Input placeholder="Main Checking" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
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
                        {ACCOUNT_TYPES.map((t) => (
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

              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.code} ({c.symbol})
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
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {isEditing ? "Balance" : "Starting balance"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <FormControl>
                    <IconPicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <ColorPicker
                      value={field.value}
                      onChange={field.onChange}
                      colors={COLOR_PALETTE}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isEditing ? "Save changes" : "Create account"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
