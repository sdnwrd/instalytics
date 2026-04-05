"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart2, Home, Users, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/dashboard",  label: "Dashboard", Icon: Home },
  { href: "/analytics",  label: "Analytics",  Icon: BarChart2 },
  { href: "/analytics?tab=followers", label: "Followers", Icon: Users },
  { href: "/settings",   label: "Settings",   Icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-end justify-around pb-safe border-t border-[var(--border)] bg-[rgba(8,8,14,0.92)] backdrop-blur-xl z-50"
      style={{ height: "var(--tab-h)" }}
    >
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname === href || pathname.startsWith(href.split("?")[0])
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-1 px-4 pt-2 pb-1 min-w-[60px] rounded-xl transition-colors",
              active ? "text-[var(--accent)]" : "text-[var(--text-3)]"
            )}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-medium tracking-wide">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
