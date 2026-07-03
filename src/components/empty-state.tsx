import { type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "glass animate-fade-up flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center",
        className
      )}
    >
      <div className="bg-primary/10 ring-primary/15 flex size-14 items-center justify-center rounded-2xl ring-4">
        <Icon className="text-primary size-6" />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      {description && (
        <p className="text-muted-foreground mt-1 max-w-sm text-sm text-balance">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
