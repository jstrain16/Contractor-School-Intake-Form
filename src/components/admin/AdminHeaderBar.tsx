import Link from "next/link"
import { ArrowLeft, Bell, Cog, Shield, Users } from "lucide-react"

type Props = {
  title?: string
  subtitle?: string
  backHref?: string
  settingsHref?: string
}

export function AdminHeaderBar({
  title = "Admin Portal",
  subtitle = "Contractors School",
  backHref = "/dashboard",
  settingsHref = "/admin/settings",
}: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm md:px-6">
      <div className="flex items-center gap-3">
        <Link
          href={backHref}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white shadow-sm">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <div className="text-base font-semibold text-slate-900">{title}</div>
          <div className="text-sm text-slate-500">{subtitle}</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
          <span className="absolute right-2 top-2 block h-2 w-2 rounded-full bg-orange-500" />
        </div>
        <Link
          href={settingsHref}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
          aria-label="Settings"
        >
          <Cog className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-blue-500 px-3 py-2 text-white">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
            <Shield className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Admin</div>
            <div className="text-[11px] text-white/80">Super Admin</div>
          </div>
        </div>
      </div>
    </div>
  )
}

