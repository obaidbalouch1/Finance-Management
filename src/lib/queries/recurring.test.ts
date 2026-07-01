import { describe, expect, it } from "vitest"

import { getNextDueDate } from "./recurring"

describe("getNextDueDate", () => {
  const base = new Date(2026, 0, 15) // Jan 15, 2026

  it("advances by one day for DAILY", () => {
    expect(getNextDueDate(base, "DAILY")).toEqual(new Date(2026, 0, 16))
  })

  it("advances by seven days for WEEKLY", () => {
    expect(getNextDueDate(base, "WEEKLY")).toEqual(new Date(2026, 0, 22))
  })

  it("advances by fourteen days for BIWEEKLY", () => {
    expect(getNextDueDate(base, "BIWEEKLY")).toEqual(new Date(2026, 0, 29))
  })

  it("advances by one month for MONTHLY", () => {
    expect(getNextDueDate(base, "MONTHLY")).toEqual(new Date(2026, 1, 15))
  })

  it("advances by three months for QUARTERLY", () => {
    expect(getNextDueDate(base, "QUARTERLY")).toEqual(new Date(2026, 3, 15))
  })

  it("advances by one year for YEARLY", () => {
    expect(getNextDueDate(base, "YEARLY")).toEqual(new Date(2027, 0, 15))
  })

  it("correctly rolls over into the next year for MONTHLY in December", () => {
    const december = new Date(2026, 11, 20)
    expect(getNextDueDate(december, "MONTHLY")).toEqual(new Date(2027, 0, 20))
  })

  it("does not mutate the input date", () => {
    const original = new Date(2026, 5, 1)
    const copy = new Date(original)
    getNextDueDate(original, "MONTHLY")
    expect(original).toEqual(copy)
  })
})
