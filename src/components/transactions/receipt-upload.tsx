"use client"

import * as React from "react"
import { toast } from "sonner"
import { FileText, Loader2, Paperclip, X } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ReceiptUpload({
  value,
  onChange,
}: {
  value?: string | null
  onChange: (url: string | null) => void
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error ?? "Upload failed")
        return
      }

      onChange(data.url)
      toast.success("Receipt uploaded")
    } catch {
      toast.error("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        className="hidden"
        onChange={handleFileSelect}
      />
      {value ? (
        <div className="flex items-center gap-2 rounded-lg border p-2">
          <FileText className="text-muted-foreground size-4 shrink-0" />
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="flex-1 truncate text-sm underline underline-offset-2"
          >
            View receipt
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onChange(null)}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Paperclip className="size-4" />
          )}
          Attach receipt
        </Button>
      )}
    </div>
  )
}
