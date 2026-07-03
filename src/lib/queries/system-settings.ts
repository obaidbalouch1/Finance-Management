import { db } from "@/lib/db"

export const DEFAULT_SYSTEM_SETTINGS = {
  maintenanceMode: false,
  allowRegistration: true,
  defaultCurrency: "PKR",
  supportEmail: "support@example.com",
}

export type SystemSettings = typeof DEFAULT_SYSTEM_SETTINGS

export async function getSystemSettings(): Promise<SystemSettings> {
  const rows = await db.systemSetting.findMany()
  const overrides = Object.fromEntries(rows.map((r) => [r.key, r.value]))
  return { ...DEFAULT_SYSTEM_SETTINGS, ...overrides } as SystemSettings
}

export async function updateSystemSettings(
  updates: Partial<SystemSettings>
): Promise<SystemSettings> {
  await Promise.all(
    Object.entries(updates).map(([key, value]) =>
      db.systemSetting.upsert({
        where: { key },
        update: { value: value as never },
        create: { key, value: value as never },
      })
    )
  )
  return getSystemSettings()
}
