import { describe, expect, it } from "vitest"

import {
  formatCurrency,
  formatCompactNumber,
  formatPercent,
  toTitleCase,
} from "./format"

describe("formatCurrency", () => {
  it("formats a positive USD amount", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50")
  })

  it("formats a negative amount with a minus sign", () => {
    expect(formatCurrency(-42, "USD")).toBe("-$42.00")
  })

  it("accepts string input", () => {
    expect(formatCurrency("99.99", "USD")).toBe("$99.99")
  })

  it("falls back gracefully for an invalid currency code", () => {
    expect(formatCurrency(10, "NOT_REAL")).toContain("10.00")
  })
})

describe("formatCompactNumber", () => {
  it("compacts large numbers", () => {
    expect(formatCompactNumber(1500)).toBe("1.5K")
    expect(formatCompactNumber(2_000_000)).toBe("2M")
  })
})

describe("formatPercent", () => {
  it("formats with default one decimal place", () => {
    expect(formatPercent(42.567)).toBe("42.6%")
  })

  it("respects custom fraction digits", () => {
    expect(formatPercent(42.567, 0)).toBe("43%")
  })
})

describe("toTitleCase", () => {
  it("converts SCREAMING_SNAKE_CASE to Title Case", () => {
    expect(toTitleCase("CREDIT_CARD")).toBe("Credit Card")
  })

  it("handles a single word", () => {
    expect(toTitleCase("MONTHLY")).toBe("Monthly")
  })
})
