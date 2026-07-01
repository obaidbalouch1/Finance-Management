"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Category } from "@prisma/client"

import { categorySchema, type CategoryInput } from "@/lib/validations/finance"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconPicker, ColorPicker } from "@/components/icon-picker"

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  defaultType = "EXPENSE",
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: Category
  defaultType?: "INCOME" | "EXPENSE"
  onSuccess: () => void
}) {
  const isEditing = !!category
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      color: category?.color ?? "#6366f1",
      icon: category?.icon ?? "tag",
    },
  })

  React.useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? "",
        type: category?.type ?? defaultType,
        color: category?.color ?? "#6366f1",
        icon: category?.icon ?? "tag",
      })
    }
  }, [open, category, defaultType, form])

  async function onSubmit(values: CategoryInput) {
    setIsSubmitting(true)
    try {
      const response = await fetch(
        isEditing ? `/api/categories/${category.id}` : "/api/categories",
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
      toast.success(isEditing ? "Category updated" : "Category created")
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
          <DialogTitle>{isEditing ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            Categories help you organize income and expenses.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Tabs value={field.value} onValueChange={field.onChange}>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries" {...field} />
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
                {isEditing ? "Save changes" : "Create category"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
