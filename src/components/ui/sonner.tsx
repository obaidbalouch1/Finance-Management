"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "color-mix(in oklab, var(--popover) 78%, transparent)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "color-mix(in oklab, var(--border) 60%, transparent)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "cn-toast backdrop-blur-2xl backdrop-saturate-200 shadow-[inset_0_1px_1px_oklch(1_0_0/0.5),0_16px_48px_-16px_rgb(0_0_0/0.35)] dark:shadow-[inset_0_1px_1px_oklch(1_0_0/0.12),0_16px_48px_-16px_rgb(0_0_0/0.7)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
