"use client"

import * as React from "react"
import { Area, AreaChart, Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const chartConfig = {
  income: { label: "Income", color: "var(--chart-3)" },
  expenses: { label: "Expenses", color: "var(--chart-5)" },
  net: { label: "Net", color: "var(--chart-1)" },
} satisfies ChartConfig

export function TrendChart({
  data,
}: {
  data: { period: string; income: number; expenses: number; net: number }[]
}) {
  const [mode, setMode] = React.useState<"area" | "line">("area")

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <Tabs value={mode} onValueChange={(v) => setMode(v as "area" | "line")}>
          <TabsList>
            <TabsTrigger value="area">Area</TabsTrigger>
            <TabsTrigger value="line">Line</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        {mode === "area" ? (
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10 }}>
            <defs>
              <linearGradient id="fillIncomeA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillExpensesA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-5)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--chart-5)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <Area
              dataKey="income"
              type="monotone"
              fill="url(#fillIncomeA)"
              stroke="var(--chart-3)"
              strokeWidth={2}
            />
            <Area
              dataKey="expenses"
              type="monotone"
              fill="url(#fillExpensesA)"
              stroke="var(--chart-5)"
              strokeWidth={2}
            />
          </AreaChart>
        ) : (
          <LineChart data={data} margin={{ left: 0, right: 0, top: 10 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.3} />
            <XAxis dataKey="period" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} width={48} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            <Line
              dataKey="income"
              type="monotone"
              stroke="var(--chart-3)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="expenses"
              type="monotone"
              stroke="var(--chart-5)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="net"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </LineChart>
        )}
      </ChartContainer>
    </div>
  )
}
