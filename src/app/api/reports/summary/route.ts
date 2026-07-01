import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { getAnalyticsData } from "@/lib/queries/analytics"
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
  { key: "category", header: "Category", width: 24 },
  { key: "amount", header: "Amount spent", width: 16 },
  { key: "percentOfTotal", header: "% of total expenses", width: 18 },
]

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  const { searchParams } = new URL(request.url)
  const format = (searchParams.get("format") ?? "csv") as "csv" | "xlsx" | "pdf"
  const fromParam = searchParams.get("from")
  const toParam = searchParams.get("to")

  const to = toParam ? new Date(toParam) : new Date()
  const from = fromParam
    ? new Date(fromParam)
    : new Date(to.getFullYear(), to.getMonth() - 1, to.getDate())

  const data = await getAnalyticsData(session.user.id, from, to)

  const rows = data.categoryBreakdown.map((c) => ({
    category: c.name,
    amount: formatCurrency(c.value, "USD"),
    percentOfTotal:
      data.totalExpenses > 0
        ? `${Math.round((c.value / data.totalExpenses) * 1000) / 10}%`
        : "0%",
  }))

  const subtitle = `${formatDate(from)} – ${formatDate(to)}`
  const summary = [
    { label: "Total income", value: formatCurrency(data.totalIncome, "USD") },
    { label: "Total expenses", value: formatCurrency(data.totalExpenses, "USD") },
    { label: "Net cash flow", value: formatCurrency(data.netCashFlow, "USD") },
  ]
  const filenameBase = `financial-summary-${from.toISOString().slice(0, 10)}-to-${to.toISOString().slice(0, 10)}`

  let body: Buffer | string
  if (format === "csv") {
    body = generateCsv(COLUMNS, rows)
  } else if (format === "xlsx") {
    body = await generateExcelBuffer({
      title: "Financial Summary",
      columns: COLUMNS,
      rows,
      sheetName: "Summary",
    })
  } else {
    body = generatePdfBuffer({
      title: "Financial Summary",
      subtitle,
      summary,
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
