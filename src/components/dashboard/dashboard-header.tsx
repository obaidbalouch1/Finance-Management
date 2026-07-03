import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { FontSizeToggle } from "@/components/dashboard/font-size-toggle"
import { NotificationsBell } from "@/components/dashboard/notifications-bell"
import { UserMenu } from "@/components/dashboard/user-menu"

export function DashboardHeader({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null }
}) {
  return (
    <header className="bg-background/70 border-border/60 sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b px-4 backdrop-blur-xl backdrop-saturate-150">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="ml-auto flex items-center gap-1">
        <NotificationsBell />
        <FontSizeToggle />
        <ThemeToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
