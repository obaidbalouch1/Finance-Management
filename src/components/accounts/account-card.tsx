"use client"

import * as React from "react"
import { MoreVertical, Pencil, Archive, Trash2 } from "lucide-react"
import type { FinancialAccount } from "@prisma/client"

import { formatCurrency, toTitleCase } from "@/lib/format"
import { getIcon } from "@/lib/icon-map"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AccountCard({
  account,
  onEdit,
  onDelete,
}: {
  account: FinancialAccount
  onEdit: () => void
  onDelete: () => void
}) {
  const Icon = getIcon(account.icon)
  const balance = Number(account.balance)

  return (
    <div className="glass hover-lift group rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 motion-safe:group-hover:scale-110"
            style={{ backgroundColor: account.color }}
          >
            <Icon className="size-5" />
          </span>
          <div>
            <p className="font-medium">{account.name}</p>
            <Badge variant="outline" className="mt-0.5 text-[10px]">
              {toTitleCase(account.type)}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              {account.isArchived ? <Archive /> : <Trash2 />}
              {account.isArchived ? "Unarchive" : "Delete"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p
        className={`mt-4 text-2xl font-semibold ${balance < 0 ? "text-destructive" : ""}`}
      >
        {formatCurrency(balance, account.currency)}
      </p>
      {account.isArchived && (
        <Badge variant="secondary" className="mt-2">
          Archived
        </Badge>
      )}
    </div>
  )
}
