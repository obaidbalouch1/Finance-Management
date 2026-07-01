import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { formatCurrency, formatDate } from "@/lib/format"
import {
  generateCsv,
  generateExcelBuffer,
  generatePdfBuffer,
  contentTypeFor,
  type ReportColumn,
} from "@/lib/reports"
import { jsonError } from "@/lib/api-helpers"

const COLUMNS: ReportColumn[] = [
  { key: "date", header: "Date", width: 14 },
  { key: "description", header: "Description", width: 30 },
  { key: "category", header: "Category", width: 20 },
  { key: "account", header: "Account", width: 20 },
  { key: "type", header: "Type", width: 12 },
  { key: "amount", header: "Amount", width: 14 },
]

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const format = (searchParams.get("format") ?? "csv") as "csv" | "xlsx" | "pdf"
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")
  const type = searchParams.get("type")
  const accountId = searchParams.get("accountId")
  const categoryId = searchParams.get("categoryId")

  const to = toParam ? new Date(toParam) : new Date()
  const from = fromParam
    ? new Date(fromParam)
    : new Date(to.getFullYear(), to.getMonth() - 1, to.getDate())

  const where: Prisma.TransactionWhereInput = {
    userId: session.user.id,
    date: { gte: from, lte: to },
    ...(type ? { type: type as Prisma.EnumTransactionTypeFilter } : {}),
    ...(accountId ? { accountId } : {}),
    ...(categoryId ? { categoryId } : {}),
  }

  const transactions = await db.transaction.findMany({
    where,
    include: { category: true, account: true },
    orderBy: { date: "desc" },
  })

  const rows = transactions.map((t) => ({
    date: formatDate(t.date),
    description: t.description,
    category: t.category?.name ?? "Transfer",
    account: t.account.name,
    type: t.type,
    amount: formatCurrency(Number(t.amount), t.currency),
  }))

  const subtitle = `${formatDate(from)} – ${formatDate(to)}`
  const filenameBase = `transactions-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}`

  let body: Buffer | string
  if (format === "csv") {
    body = generateCsv(COLUMNS, rows)
  } else if (format === "xlsx") {
    body = await generateExcelBuffer({
      title: "Transaction History",
      columns: COLUMNS,
      rows,
      sheetName: "Transactions",
    })
  } else {
    body = generatePdfBuffer({
      title: "Transaction History",
      subtitle,
      columns: COLUMNS,
      rows,
    })
  }

  return new NextResponse(typeof body === "string" ? body : new Uint8Array(body), {
    headers: {
      "Content-Type": contentTypeFor(format),
      "Content-Disposition": `attachment; filename="${filenameBase}.${format}"`,
    },
  })
}
