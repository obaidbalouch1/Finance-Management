type Bucket = { count: number; resetAt: number }

// In-memory limiter: effective per warm serverless instance. Good enough as a
// defense-in-depth layer without requiring an external store (Redis/Upstash).
const buckets = new Map<string, Bucket>()

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) return forwardedFor.split(",")[0].trim()
  return request.headers.get("x-real-ip") ?? "unknown"
}

export function checkRateLimit(
  request: Request,
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const ip = getClientIp(request)
  const bucketKey = `${key}:${ip}`
  const now = Date.now()

  const existing = buckets.get(bucketKey)

  if (!existing || existing.resetAt < now) {
    buckets.set(bucketKey, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  existing.count += 1
  return { allowed: true, remaining: limit - existing.count }
}

// Clears the caller's bucket, e.g. after a successful login so legitimate
// sign-ins never accumulate toward the brute-force lockout.
export function clearRateLimit(request: Request, key: string): void {
  buckets.delete(`${key}:${getClientIp(request)}`)
}
