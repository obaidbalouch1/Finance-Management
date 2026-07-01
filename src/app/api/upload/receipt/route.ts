import { NextResponse } from "next/server"
import { put } from "@vercel/blob"

import { auth } from "@/auth"
import { jsonError } from "@/lib/api-helpers"

const MAX_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "application/pdf"]

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) return jsonError("Unauthorized", 401)

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return jsonError(
      "Receipt uploads are not configured. Set BLOB_READ_WRITE_TOKEN to enable this feature.",
      503
    )
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return jsonError("No file provided", 400)
  }

  if (file.size > MAX_SIZE_BYTES) {
    return jsonError("File must be smaller than 5MB", 400)
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return jsonError("Only PNG, JPEG, WEBP, and PDF files are allowed", 400)
  }

  const extension = file.name.split(".").pop() ?? "bin"
  const key = `receipts/${session.user.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`

  const blob = await put(key, file, {
    access: "public",
    contentType: file.type,
  })

  return NextResponse.json({ url: blob.url })
}
