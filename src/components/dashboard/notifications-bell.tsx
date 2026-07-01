"use client"

import * as React from "react"
import useSWR from "swr"
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import type { Notification } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const TYPE_ICON: Record<string, React.ElementType> = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: XCircle,
}

const TYPE_COLOR: Record<string, string> = {
  INFO: "text-primary",
  SUCCESS: "text-success",
  WARNING: "text-warning",
  ERROR: "text-destructive",
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function NotificationsBell() {
  const { data, mutate } = useSWR<{
    notifications: Notification[]
    unreadCount: number
  }>("/api/notifications", fetcher, {
    refreshInterval: 30_000,
  })

  const unreadCount = data?.unreadCount ?? 0

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" })
    mutate()
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    })
    mutate()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex size-2 rounded-full bg-destructive" />
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <span className="text-sm font-medium">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={markAllRead}
              className="text-xs"
            >
              <CheckCheck className="size-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {!data?.notifications.length ? (
            <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {data.notifications.map((notification) => {
                const Icon = TYPE_ICON[notification.type] ?? Info
                return (
                  <button
                    key={notification.id}
                    onClick={() => !notification.isRead && markRead(notification.id)}
                    className={cn(
                      "hover:bg-muted/50 flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors",
                      !notification.isRead && "bg-primary/5"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mt-0.5 size-4 shrink-0",
                        TYPE_COLOR[notification.type]
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {notification.title}
                      </p>
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {notification.message}
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        {timeAgo(notification.createdAt.toString())}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <Badge className="size-1.5 shrink-0 rounded-full p-0" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
