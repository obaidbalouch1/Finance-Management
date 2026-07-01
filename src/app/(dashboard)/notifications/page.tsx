"use client"

import * as React from "react"
import useSWR from "swr"
import Link from "next/link"
import { toast } from "sonner"
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
} from "lucide-react"
import type { Notification } from "@prisma/client"

import { fetcher } from "@/lib/fetcher"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

const TYPE_ICON: Record<string, React.ElementType> = {
  INFO: Info,
  SUCCESS: CheckCircle2,
  WARNING: AlertTriangle,
  ERROR: XCircle,
}

const TYPE_COLOR: Record<string, string> = {
  INFO: "text-primary bg-primary/10",
  SUCCESS: "text-success bg-success/10",
  WARNING: "text-warning bg-warning/10",
  ERROR: "text-destructive bg-destructive/10",
}

export default function NotificationsPage() {
  const [filter, setFilter] = React.useState<"all" | "unread">("all")

  const { data, isLoading, mutate } = useSWR<{
    notifications: Notification[]
    unreadCount: number
  }>(
    `/api/notifications?page=1&pageSize=50${filter === "unread" ? "&unreadOnly=true" : ""}`,
    fetcher
  )

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    })
    mutate()
  }

  async function remove(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    mutate()
    toast.success("Notification removed")
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" })
    mutate()
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Stay on top of budgets, bills, and goals"
        actions={
          data && data.unreadCount > 0 ? (
            <Button variant="outline" size="sm" onClick={markAllRead}>
              <CheckCheck className="size-4" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">
            Unread {data?.unreadCount ? `(${data.unreadCount})` : ""}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !data?.notifications.length ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Bell className="text-muted-foreground mx-auto mb-3 size-8" />
          <p className="text-muted-foreground">
            {filter === "unread" ? "No unread notifications." : "No notifications yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.notifications.map((notification) => {
            const Icon = TYPE_ICON[notification.type] ?? Info
            const content = (
              <div
                className={cn(
                  "glass flex items-start gap-3 rounded-xl p-4 transition-colors",
                  !notification.isRead && "border-primary/30"
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full",
                    TYPE_COLOR[notification.type]
                  )}
                >
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.isRead && (
                      <span className="bg-primary size-1.5 rounded-full" />
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{notification.message}</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        markRead(notification.id)
                      }}
                    >
                      Mark read
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.preventDefault()
                      remove(notification.id)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            )

            return notification.link ? (
              <Link key={notification.id} href={notification.link} className="block">
                {content}
              </Link>
            ) : (
              <div key={notification.id}>{content}</div>
            )
          })}
        </div>
      )}
    </div>
  )
}
