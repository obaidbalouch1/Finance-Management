"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Lock } from "lucide-react"
import type { Category } from "@prisma/client"

import { useCategories } from "@/hooks/use-categories"
import { getIcon } from "@/lib/icon-map"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CategoryFormDialog } from "@/components/categories/category-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"

function CategoryGrid({
  categories,
  onEdit,
  onDelete,
}: {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
}) {
  if (categories.length === 0) {
    return (
      <div className="glass rounded-2xl p-10 text-center">
        <p className="text-muted-foreground">No categories yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const Icon = getIcon(category.icon)
        return (
          <div
            key={category.id}
            className="glass flex items-center justify-between rounded-xl p-3"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex size-9 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: category.color }}
              >
                <Icon className="size-4" />
              </span>
              <span className="font-medium">{category.name}</span>
            </div>
            {category.isSystem ? (
              <Lock className="text-muted-foreground size-4" />
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onEdit(category)}
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDelete(category)}
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function CategoriesPage() {
  const { categories, isLoading, mutate } = useCategories()
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingCategory, setEditingCategory] = React.useState<Category | undefined>()
  const [deletingCategory, setDeletingCategory] = React.useState<Category | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("EXPENSE")

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE")
  const incomeCategories = categories.filter((c) => c.type === "INCOME")

  async function handleDelete() {
    if (!deletingCategory) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/categories/${deletingCategory.id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error ?? "Failed to delete category")
        return
      }
      toast.success("Category deleted")
      setDeletingCategory(undefined)
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
        title="Categories"
        description="Organize your income and expenses"
        actions={
          <Button
            onClick={() => {
              setEditingCategory(undefined)
              setFormOpen(true)
            }}
          >
            <Plus className="size-4" />
            Add category
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="EXPENSE">
            Expense ({expenseCategories.length})
          </TabsTrigger>
          <TabsTrigger value="INCOME">
            Income ({incomeCategories.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="EXPENSE" className="mt-4">
          {isLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : (
            <CategoryGrid
              categories={expenseCategories}
              onEdit={(c) => {
                setEditingCategory(c)
                setFormOpen(true)
              }}
              onDelete={setDeletingCategory}
            />
          )}
        </TabsContent>
        <TabsContent value="INCOME" className="mt-4">
          {isLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : (
            <CategoryGrid
              categories={incomeCategories}
              onEdit={(c) => {
                setEditingCategory(c)
                setFormOpen(true)
              }}
              onDelete={setDeletingCategory}
            />
          )}
        </TabsContent>
      </Tabs>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editingCategory}
        defaultType={activeTab as "INCOME" | "EXPENSE"}
        onSuccess={mutate}
      />
      <ConfirmDialog
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(undefined)}
        title="Delete category?"
        description="This will permanently delete this category. Categories in use by transactions cannot be deleted."
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
