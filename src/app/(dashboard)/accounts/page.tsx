"use client"

import * as React from "react"
import { toast } from "sonner"
import { Plus, ArrowLeftRight } from "lucide-react"
import type { FinancialAccount } from "@prisma/client"

import { useAccounts } from "@/hooks/use-accounts"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { AccountCard } from "@/components/accounts/account-card"
import { AccountFormDialog } from "@/components/accounts/account-form-dialog"
import { TransferDialog } from "@/components/accounts/transfer-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function AccountsPage() {
  const { accounts, isLoading, mutate } = useAccounts({ includeArchived: true })
  const [formOpen, setFormOpen] = React.useState(false)
  const [transferOpen, setTransferOpen] = React.useState(false)
  const [editingAccount, setEditingAccount] = React.useState<FinancialAccount | undefined>()
  const [deletingAccount, setDeletingAccount] = React.useState<FinancialAccount | undefined>()
  const [isDeleting, setIsDeleting] = React.useState(false)

  const activeAccounts = accounts.filter((a) => !a.isArchived)

  async function handleDelete() {
    if (!deletingAccount) return
    setIsDeleting(true)
    try {
      const response = deletingAccount.isArchived
        ? await fetch(`/api/accounts/${deletingAccount.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isArchived: false }),
          })
        : await fetch(`/api/accounts/${deletingAccount.id}`, { method: "DELETE" })

      const data = await response.json()
      if (!response.ok) {
        toast.error(data.error ?? "Failed to update account")
        return
      }
      toast.success(
        deletingAccount.isArchived
          ? "Account unarchived"
          : data.archived
            ? "Account archived"
            : "Account deleted"
      )
      setDeletingAccount(undefined)
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
        title="Accounts"
        description="Manage your bank accounts, cards, and wallets"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setTransferOpen(true)}
              disabled={activeAccounts.length < 2}
            >
              <ArrowLeftRight className="size-4" />
              Transfer
            </Button>
            <Button
              onClick={() => {
                setEditingAccount(undefined)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Add account
            </Button>
          </>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted-foreground">
            No accounts yet. Add your first account to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={() => {
                setEditingAccount(account)
                setFormOpen(true)
              }}
              onDelete={() => setDeletingAccount(account)}
            />
          ))}
        </div>
      )}

      <AccountFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        account={editingAccount}
        onSuccess={mutate}
      />
      <TransferDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        accounts={activeAccounts}
        onSuccess={mutate}
      />
      <ConfirmDialog
        open={!!deletingAccount}
        onOpenChange={(open) => !open && setDeletingAccount(undefined)}
        title={
          deletingAccount?.isArchived ? "Unarchive account?" : "Delete account?"
        }
        description={
          deletingAccount?.isArchived
            ? "This will restore the account to your active list."
            : "This will permanently delete this account. If it has existing transactions, it will be archived instead."
        }
        confirmLabel={deletingAccount?.isArchived ? "Unarchive" : "Delete"}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  )
}
