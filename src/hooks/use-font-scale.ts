"use client"

import * as React from "react"

// Font scale is stored as a percentage (100 = default). It is applied to the
// app as a decimal on the `--font-scale` CSS variable defined in globals.css,
// which scales all text (and layout) proportionally.
export const FONT_SCALE_STORAGE_KEY = "app-font-scale"
export const FONT_SCALE_MIN = 85
export const FONT_SCALE_MAX = 130
export const FONT_SCALE_STEP = 5
export const FONT_SCALE_DEFAULT = 100
// Fired on the window so every mounted control stays in sync.
const FONT_SCALE_EVENT = "app-font-scale-change"

function applyScale(percent: number) {
  document.documentElement.style.setProperty(
    "--font-scale",
    String(percent / 100),
  )
}

/**
 * Reads, applies, and persists the app-wide text size. Any number of controls
 * can use this hook simultaneously and they will stay in sync.
 */
export function useFontScale() {
  const [percent, setPercent] = React.useState(FONT_SCALE_DEFAULT)

  // Load the saved value on mount and subscribe to changes from other controls.
  React.useEffect(() => {
    const read = () => {
      const stored = Number(window.localStorage.getItem(FONT_SCALE_STORAGE_KEY))
      if (stored >= FONT_SCALE_MIN && stored <= FONT_SCALE_MAX) {
        setPercent(stored)
      }
    }
    read()
    window.addEventListener(FONT_SCALE_EVENT, read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener(FONT_SCALE_EVENT, read)
      window.removeEventListener("storage", read)
    }
  }, [])

  const setScale = React.useCallback((next: number) => {
    const clamped = Math.min(
      FONT_SCALE_MAX,
      Math.max(FONT_SCALE_MIN, next),
    )
    setPercent(clamped)
    applyScale(clamped)
    window.localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(clamped))
    window.dispatchEvent(new Event(FONT_SCALE_EVENT))
  }, [])

  return { percent, setScale }
}
