"use client"

import { Minus, Plus, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import {
  FONT_SCALE_DEFAULT,
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  useFontScale,
} from "@/hooks/use-font-scale"

export function FontSizeControl() {
  const { percent, setScale } = useFontScale()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Text size</span>
        <span className="text-muted-foreground text-sm tabular-nums">
          {percent}%
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label="Decrease text size"
          disabled={percent <= FONT_SCALE_MIN}
          onClick={() => setScale(percent - FONT_SCALE_STEP)}
        >
          <Minus className="size-4" />
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
          size="icon"
          className="shrink-0"
          aria-label="Increase text size"
          disabled={percent >= FONT_SCALE_MAX}
          onClick={() => setScale(percent + FONT_SCALE_STEP)}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-xs">
          Adjusts the size of all text across the app.
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          disabled={percent === FONT_SCALE_DEFAULT}
          onClick={() => setScale(FONT_SCALE_DEFAULT)}
        >
          <RotateCcw className="size-3.5" />
          Reset
        </Button>
      </div>
    </div>
  )
}
