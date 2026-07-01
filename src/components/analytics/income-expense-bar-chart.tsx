"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  income: { label: "Income", color: "var(--chart-3)" },
  expenses: { label: "Expenses", color: "var(--chart-5)" },
} satisfies ChartConfig

export function IncomeExpenseBarChart({
  data,
}: {
  data: { period: string; income: number; expenses: number }[]
}) {
  return (
    <ChartContainer config={chartConfig} className="h-72 w-full">
      <BarChart data={data} margin={{ left: 0, right: 0, top: 10 }}>
        <CartesianGrid vertical={false} strokeOpacity={0.3} />
        <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} width={48} />
        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="income" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expenses" fill="var(--chart-5)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  )
}
