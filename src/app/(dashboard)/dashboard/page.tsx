import { auth } from "@/auth"
import { PageHeader } from "@/components/dashboard/page-header"
import { DashboardOverview } from "@/components/dashboard/dashboard-overview"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Your financial snapshot at a glance"
      />
      <DashboardOverview currency={session?.user.baseCurrency ?? "USD"} />
    </div>
  )
}
