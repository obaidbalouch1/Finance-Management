import { describe, expect, it } from "vitest"

import {
  formatCurrency,
  formatCompactNumber,
  formatPercent,
  toTitleCase,
} from "./format"

// Intl separates "Rs" from the number with a non-breaking space (U+00A0).
const NBSP = " "

describe("formatCurrency", () => {
  it("formats a positive amount in PKR", () => {
    expect(formatCurrency(1234.5, "PKR")).toBe(`Rs${NBSP}1,234.5`)
  })

  it("formats a negative amount with a minus sign", () => {
    expect(formatCurrency(-42, "PKR")).toBe(`-Rs${NBSP}42`)
  })

  it("accepts string input", () => {
    expect(formatCurrency("99.99", "PKR")).toBe(`Rs${NBSP}99.99`)
  })

  it("always renders PKR even when another currency code is passed", () => {
    expect(formatCurrency(10, "USD")).toBe(`Rs${NBSP}10`)
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
