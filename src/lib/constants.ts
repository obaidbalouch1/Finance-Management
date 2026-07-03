import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tags,
  PiggyBank,
  Repeat,
  Target,
  TrendingUp,
  BarChart3,
  FileText,
  Bell,
  Settings,
  Users,
  ShieldCheck,
  Activity,
  Receipt,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Simple Spending", href: "/spending", icon: Receipt },
  { title: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { title: "Accounts", href: "/accounts", icon: Wallet },
  { title: "Categories", href: "/categories", icon: Tags },
  { title: "Budgets", href: "/budgets", icon: PiggyBank },
  { title: "Recurring Bills", href: "/recurring-bills", icon: Repeat },
  { title: "Goals", href: "/goals", icon: Target },
  { title: "Investments", href: "/investments", icon: TrendingUp },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Settings", href: "/settings", icon: Settings },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { title: "Admin Overview", href: "/admin", icon: ShieldCheck },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "System Analytics", href: "/admin/analytics", icon: Activity },
  { title: "Audit Log", href: "/admin/audit-log", icon: FileText },
  { title: "Settings", href: "/admin/settings", icon: Settings },
]

// The app is PKR-only: every amount is displayed in Pakistani Rupees.
export const CURRENCIES = [
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
]
