// The app displays every amount in Pakistani Rupees (PKR), regardless of the
// currency code stored on the row — the `currency` parameter is kept so call
// sites don't break, but it is intentionally ignored.
export function formatCurrency(
  amount: number | string,
  _currency: string = "PKR",
  options?: Intl.NumberFormatOptions
) {
  const value = typeof amount === "string" ? Number(amount) : amount

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PKR",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 2,
      ...options,
    }).format(value)
  } catch {
    return `Rs ${value.toFixed(2)}`
  }
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(d)
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${value.toFixed(fractionDigits)}%`
}

export function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
