export class FetchError extends Error {
  status: number
  info: unknown

  constructor(message: string, status: number, info: unknown) {
    super(message)
    this.status = status
    this.info = info
  }
}

export async function fetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url)

  if (!res.ok) {
    const info = await res.json().catch(() => undefined)
    throw new FetchError(
      (info as { error?: string })?.error ?? "An error occurred while fetching data",
      res.status,
      info
    )
  }

  return res.json()
}
