import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/settings/profile-form"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, image: true, baseCurrency: true, passwordHash: true },
  })

  if (!user) redirect("/login")

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your profile and account preferences"
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      {user.passwordHash && (
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your account password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePasswordForm />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
