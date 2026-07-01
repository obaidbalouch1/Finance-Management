"use client"

import * as React from "react"
import type { DateRange } from "react-day-picker"
import { FileSpreadsheet, FileText, FileJson, Receipt, PieChart } from "lucide-react"

import { PageHeader } from "@/components/dashboard/page-header"
import { DateRangePicker } from "@/components/date-range-picker"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

function defaultRange(): DateRange {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 1)
  return { from, to }
}

function ReportCard({
  icon: Icon,
  title,
  description,
  endpoint,
  range,
}: {
  icon: React.ElementType
  title: string
  description: string
  endpoint: string
  range: DateRange
}) {
  function download(format: "csv" | "xlsx" | "pdf") {
    if (!range.from || !range.to) return
    const params = new URLSearchParams({
      format,
      from: range.from.toISOString(),
      to: range.to.toISOString(),
    })
    const url = `${endpoint}?${params.toString()}`
    window.location.href = url
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <span className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-lg">
            <Icon className="size-4.5" />
          </span>
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => download("csv")}>
          <FileJson className="size-3.5" />
          CSV
        </Button>
        <Button variant="outline" size="sm" onClick={() => download("xlsx")}>
          <FileSpreadsheet className="size-3.5" />
          Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => download("pdf")}>
          <FileText className="size-3.5" />
          PDF
        </Button>
      </CardContent>
    </Card>
  )
}

export default function ReportsPage() {
  const [range, setRange] = React.useState<DateRange>(defaultRange())

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Export your financial data for the selected period"
        actions={<DateRangePicker value={range} onChange={setRange} />}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ReportCard
          icon={Receipt}
          title="Transaction history"
          description="A detailed list of all transactions in the selected period"
          endpoint="/api/reports/transactions"
          range={range}
        />
        <ReportCard
          icon={PieChart}
          title="Financial summary"
          description="Income, expenses, and spending by category"
          endpoint="/api/reports/summary"
          range={range}
        />
      </div>
    </div>
  )
}
