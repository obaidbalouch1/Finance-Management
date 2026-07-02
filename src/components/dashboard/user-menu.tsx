"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { LogOut, Minus, Plus, Settings, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  FONT_SCALE_MAX,
  FONT_SCALE_MIN,
  FONT_SCALE_STEP,
  useFontScale,
} from "@/hooks/use-font-scale"

function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }
  return email?.slice(0, 2).toUpperCase() ?? "U"
}

function FontSizeMenuControl() {
  const { percent, setScale } = useFontScale()

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <span className="text-muted-foreground text-xs">Text size</span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label="Decrease text size"
          disabled={percent <= FONT_SCALE_MIN}
          onClick={() => setScale(percent - FONT_SCALE_STEP)}
        >
          <Minus />
        </Button>
        <span className="w-9 text-center text-xs tabular-nums">{percent}%</span>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          aria-label="Increase text size"
          disabled={percent >= FONT_SCALE_MAX}
          onClick={() => setScale(percent + FONT_SCALE_STEP)}
        >
          <Plus />
        </Button>
      </div>
    </div>
  )
}

export function UserMenu({
  user,
}: {
  user: { name?: string | null; email?: string | null; image?: string | null }
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-8">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm font-medium">
            {user.name ?? "User"}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <FontSizeMenuControl />
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>
          <User />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
