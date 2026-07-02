"use client"

import { ALargeSmall, Minus, Plus, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  useFontScale,
} from "@/hooks/use-font-scale"

export function FontSizeToggle() {
  const { percent, setScale } = useFontScale()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Text size">
            <ALargeSmall className="size-4" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-64">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Text size</span>
          <span className="text-muted-foreground text-sm tabular-nums">
            {percent}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0"
            aria-label="Decrease text size"
            disabled={percent <= FONT_SCALE_MIN}
            onClick={() => setScale(percent - FONT_SCALE_STEP)}
          >
            <Minus />
          </Button>

          <Slider
            value={[percent]}
            min={FONT_SCALE_MIN}
            max={FONT_SCALE_MAX}
            step={FONT_SCALE_STEP}
            aria-label="Text size"
            onValueChange={(value) =>
              setScale(Array.isArray(value) ? value[0] : value)
            }
          />

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0"
            aria-label="Increase text size"
            disabled={percent >= FONT_SCALE_MAX}
            onClick={() => setScale(percent + FONT_SCALE_STEP)}
          >
            <Plus />
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full gap-1.5"
          disabled={percent === FONT_SCALE_DEFAULT}
          onClick={() => setScale(FONT_SCALE_DEFAULT)}
        >
          <RotateCcw className="size-3.5" />
          Reset to default
        </Button>
      </PopoverContent>
    </Popover>
  )
}
