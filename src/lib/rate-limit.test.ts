import { describe, expect, it } from "vitest"

import { checkRateLimit } from "./rate-limit"

function requestFrom(ip: string) {
  return new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": ip },
  })
}

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    const ip = "10.0.0.1"
    const result = checkRateLimit(requestFrom(ip), "test-key-1", 3, 60_000)
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(2)
  })

  it("blocks requests once the limit is exceeded", () => {
    const ip = "10.0.0.2"
    const key = "test-key-2"
    checkRateLimit(requestFrom(ip), key, 2, 60_000)
    checkRateLimit(requestFrom(ip), key, 2, 60_000)
    const third = checkRateLimit(requestFrom(ip), key, 2, 60_000)

    expect(third.allowed).toBe(false)
    expect(third.remaining).toBe(0)
  })

  it("tracks separate buckets per IP", () => {
    const key = "test-key-3"
    checkRateLimit(requestFrom("10.0.0.3"), key, 1, 60_000)
    const otherIp = checkRateLimit(requestFrom("10.0.0.4"), key, 1, 60_000)

    expect(otherIp.allowed).toBe(true)
  })

  it("tracks separate buckets per key for the same IP", () => {
    const ip = "10.0.0.5"
    checkRateLimit(requestFrom(ip), "key-a", 1, 60_000)
    const otherKey = checkRateLimit(requestFrom(ip), "key-b", 1, 60_000)

    expect(otherKey.allowed).toBe(true)
  })

  it("falls back to unknown when no IP header is present", () => {
    const request = new Request("http://localhost/api/test")
    const result = checkRateLimit(request, "test-key-anon", 1, 60_000)
    expect(result.allowed).toBe(true)
  })
})
