"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Goal } from "@prisma/client"

import { goalSchema, type GoalInput } from "@/lib/validations/finance"
import { COLOR_PALETTE } from "@/lib/icon-map"
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
import { DatePicker } from "@/components/date-picker"
import { IconPicker, ColorPicker } from "@/components/icon-picker"

export function GoalFormDialog({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: Goal
  onSuccess: () => void
}) {
  const isEditing = !!goal
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<GoalInput>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: goal?.name ?? "",
      description: goal?.description ?? "",
      targetAmount: goal ? Number(goal.targetAmount) : 0,
      currentAmount: goal ? Number(goal.currentAmount) : 0,
      currency: "PKR",
      targetDate: goal?.targetDate ? new Date(goal.targetDate) : null,
      icon: goal?.icon ?? "target",
      color: goal?.color ?? "#6366f1",
      status: goal?.status ?? "ACTIVE",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: goal?.name ?? "",
        description: goal?.description ?? "",
        targetAmount: goal ? Number(goal.targetAmount) : 0,
        currentAmount: goal ? Number(goal.currentAmount) : 0,
        currency: "PKR",
        targetDate: goal?.targetDate ? new Date(goal.targetDate) : null,
        icon: goal?.icon ?? "target",
        color: goal?.color ?? "#6366f1",
        status: goal?.status ?? "ACTIVE",
      })
    }
  }, [open, goal, form])

  async function onSubmit(values: GoalInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        isEditing ? `/api/goals/${goal.id}` : "/api/goals",
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
      toast.success(isEditing ? "Goal updated" : "Goal created")
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
          <DialogTitle>{isEditing ? "Edit goal" : "Create goal"}</DialogTitle>
          <DialogDescription>
            Set a savings target and track your progress.
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
                    <Input placeholder="Emergency Fund" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="targetAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="targetDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target date (optional)</FormLabel>
                  <DatePicker value={field.value} onChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea rows={2} {...field} value={field.value ?? ""} />
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
                {isEditing ? "Save changes" : "Create goal"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
