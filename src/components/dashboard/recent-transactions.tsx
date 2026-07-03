import Link from "next/link"
import { ArrowDownLeft, ArrowRightLeft, ArrowUpRight, Receipt } from "lucide-react"

import { formatCurrency, formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"

type Transaction = {
  id: string
  description: string
  amount: number
  type: "INCOME" | "EXPENSE" | "TRANSFER"
  date: string | Date
  currency: string
  category: { name: string; color: string; icon: string } | null
  account: { name: string; color: string }
}

const TYPE_ICON = {
  INCOME: ArrowDownLeft,
  EXPENSE: ArrowUpRight,
  TRANSFER: ArrowRightLeft,
}

const TYPE_COLOR = {
  INCOME: "bg-success/10 text-success",
  EXPENSE: "bg-destructive/10 text-destructive",
  TRANSFER: "bg-primary/10 text-primary",
}

export function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[]
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
            <Receipt className="size-4" />
          </span>
          <h3 className="font-medium">Recent transactions</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/transactions" />}
        >
          View all
        </Button>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="bg-muted flex size-11 items-center justify-center rounded-full">
            <Receipt className="text-muted-foreground size-5" />
          </span>
          <p className="mt-3 text-sm font-medium">No transactions yet</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Your latest activity will show up here.
          </p>
        </div>
      ) : (
        <div className="divide-y">
          {transactions.map((transaction) => {
            const Icon = TYPE_ICON[transaction.type]
            const isNegative = transaction.type === "EXPENSE"
            const sign = transaction.type === "INCOME" ? "+" : transaction.type === "EXPENSE" ? "-" : ""
            return (
              <div
                key={transaction.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-full ${TYPE_COLOR[transaction.type]}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {transaction.description}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {transaction.category?.name ?? "Transfer"} ·{" "}
                    {transaction.account.name} ·{" "}
                    {formatDate(transaction.date, { month: "short", day: "numeric", year: undefined })}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${isNegative ? "text-foreground" : "text-success"}`}
                >
                  {sign}
                  {formatCurrency(transaction.amount, transaction.currency)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
