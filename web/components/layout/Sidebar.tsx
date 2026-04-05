"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Home, Users, Settings, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", Icon: Home },
  { href: "/analytics", label: "Analytics",  Icon: BarChart2 },
  { href: "/analytics?tab=unfollowers", label: "Unfollowers", Icon: Users },
  { href: "/settings",  label: "Settings",   Icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden lg:flex flex-col w-[220px] shrink-0 border-r border-[var(--border)] sticky top-0 h-screen bg-[rgba(255,255,255,0.015)] backdrop-blur">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-semibold tracking-tight text-[var(--text)]">
            Insta<span className="text-[var(--accent)]">lytics</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13.5px] transition-colors",
                active
                  ? "bg-[var(--accent-bg)] text-[var(--accent)]"
                  : "text-[var(--text-2)] hover:bg-[var(--card-hover)] hover:text-[var(--text)]"
              )}
            >
              <Icon size={15} strokeWidth={1.8} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
