"use client"

import { Cell, Pie, PieChart } from "recharts"

import { formatCurrency } from "@/lib/format"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

export function CategoryPieChart({
  data,
  currency = "USD",
}: {
  data: { name: string; value: number; color: string }[]
  currency?: string
}) {
  const chartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.color }
    return acc
  }, {} as ChartConfig)

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-72 items-center justify-center text-sm">
        No expense data for this period
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="mx-auto h-72 w-full">
      <PieChart>
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatCurrency(Number(value), currency)}
            />
          }
        />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  )
}
