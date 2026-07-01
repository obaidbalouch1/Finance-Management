"use client"

import { CalendarIcon } from "lucide-react"

import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  value?: Date | null
  onChange: (date: Date | undefined) => void
  placeholder?: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="size-4" />
            {value ? formatDate(value) : placeholder}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={onChange}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
