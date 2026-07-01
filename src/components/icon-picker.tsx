"use client"

import { ICON_NAMES, getIcon } from "@/lib/icon-map"
import { cn } from "@/lib/utils"

export function IconPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 rounded-lg border p-2">
      {ICON_NAMES.map((name) => {
        const Icon = getIcon(name)
        return (
          <button
            key={name}
            type="button"
            onClick={() => onChange(name)}
            className={cn(
              "flex size-8 items-center justify-center rounded-md transition-colors",
              value === name
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Icon className="size-4" />
          </button>
        )
      })}
    </div>
  )
}

export function ColorPicker({
  value,
  onChange,
  colors,
}: {
  value: string
  onChange: (value: string) => void
  colors: string[]
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "size-7 rounded-full ring-offset-2 transition-all ring-offset-background",
            value === color && "ring-2 ring-foreground"
          )}
          style={{ backgroundColor: color }}
          aria-label={color}
        />
      ))}
    </div>
  )
}
