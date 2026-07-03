import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "after:absolute after:inset-0 after:-translate-x-full after:bg-gradient-to-r after:from-transparent after:via-foreground/8 after:to-transparent motion-safe:after:animate-[shimmer_1.8s_ease-in-out_infinite] dark:after:via-foreground/6",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
