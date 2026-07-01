"use client"

import * as React from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { useSystemSettings } from "@/hooks/use-admin"
import { PageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminSettingsPage() {
  const { settings, isLoading, mutate } = useSystemSettings()
  const [isSaving, setIsSaving] = React.useState(false)
  const [form, setForm] = React.useState(settings)

  React.useEffect(() => {
    if (settings) setForm(settings)
  }, [settings])

  async function save() {
    if (!form) return
    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!response.ok) {
        toast.error("Failed to save settings")
        return
      }
      toast.success("Settings saved")
      mutate()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure platform-wide behavior"
      />

      {isLoading || !form ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>
              Changes apply immediately to all users.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Maintenance mode</Label>
                <p className="text-muted-foreground text-xs">
                  Temporarily block non-admin sign-ins
                </p>
              </div>
              <Switch
                checked={form.maintenanceMode}
                onCheckedChange={(checked) =>
                  setForm({ ...form, maintenanceMode: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <Label>Allow new registrations</Label>
                <p className="text-muted-foreground text-xs">
                  Let new users sign up for an account
                </p>
              </div>
              <Switch
                checked={form.allowRegistration}
                onCheckedChange={(checked) =>
                  setForm({ ...form, allowRegistration: checked })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label>Default currency</Label>
              <Input
                value={form.defaultCurrency}
                onChange={(e) =>
                  setForm({ ...form, defaultCurrency: e.target.value.toUpperCase() })
                }
                maxLength={3}
                className="w-32"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Support email</Label>
              <Input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
              />
            </div>

            <Button onClick={save} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin" />}
              Save changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
