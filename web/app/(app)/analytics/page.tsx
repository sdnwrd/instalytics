"use client"
import { useEffect, useState } from "react"
import { AvatarCircle } from "@/components/shared/UserAvatar"

type Tab = "unfollowers" | "new_followers" | "not_following_back" | "you_dont_follow_back"
interface IGUser { ig_user_id: string; username: string; full_name?: string }
interface DiffData {
  unfollowers: IGUser[]
  new_followers: IGUser[]
  not_following_back: IGUser[]
  you_dont_follow_back: IGUser[]
}

const tabs: { key: Tab; label: string }[] = [
  { key: "unfollowers",          label: "Unfollowers" },
  { key: "new_followers",        label: "New Followers" },
  { key: "not_following_back",   label: "Not Following Back" },
  { key: "you_dont_follow_back", label: "You Don't Follow Back" },
]

export default function AnalyticsPage() {
  const [active, setActive] = useState<Tab>("unfollowers")
  const [data, setData] = useState<DiffData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analytics/diff")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const users: IGUser[] = data ? data[active] : []

  return (
    <div>
      <header className="sticky top-0 z-10 px-5 py-4 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--border)", background: "rgba(8,8,14,0.85)" }}>
        <h1 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--text)" }}>Analytics</h1>
      </header>

      <div className="flex gap-1 overflow-x-auto px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        {tabs.map(({ key, label }) => (
          <button key={key} onClick={() => setActive(key)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
            style={active === key ? { background: "var(--accent-bg)", color: "var(--accent)" } : { color: "var(--text-3)" }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="px-5 py-8 text-[13px]" style={{ color: "var(--text-3)" }}>Loading…</div>
      ) : users.length === 0 ? (
        <div className="px-5 py-8 text-[13px]" style={{ color: "var(--text-3)" }}>No data in this category yet.</div>
      ) : (
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {users.map((u) => (
            <div key={u.ig_user_id} className="flex items-center gap-3 px-5 py-3 min-h-[64px]">
              <AvatarCircle username={u.username} size={40} />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium" style={{ color: "var(--text)" }}>@{u.username}</p>
                {u.full_name && <p className="text-[12px] truncate" style={{ color: "var(--text-3)" }}>{u.full_name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
