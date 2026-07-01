"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

const PRESETS = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 6 months", days: 182 },
  { label: "Last 12 months", days: 365 },
]

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (range: DateRange) => void
}) {
  const [open, setOpen] = React.useState(false)

  function applyPreset(days: number) {
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)
    onChange({ from, to })
    setOpen(false)
  }

  const label =
    value.from && value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : "Pick a date range"

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" className={cn("justify-start font-normal")}>
            <CalendarIcon className="size-4" />
            {label}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex flex-col gap-1 border-r p-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => applyPreset(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div>
            <Calendar
              mode="range"
              selected={value}
              onSelect={(range) => range && onChange(range)}
              numberOfMonths={2}
              autoFocus
            />
            <Separator />
            <div className="flex justify-end p-2">
              <Button size="sm" onClick={() => setOpen(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
