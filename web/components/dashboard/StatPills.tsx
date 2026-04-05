"use client"
interface StatPillsProps {
  followerCount: number
  followingCount: number
  newFollowers: number
  unfollowers: number
  notFollowingBack: number
}

export function StatPills({ followerCount, followingCount, newFollowers, unfollowers, notFollowingBack }: StatPillsProps) {
  const pills = [
    { label: "Followers",   value: followerCount.toLocaleString(),   color: "var(--text)" },
    { label: "Following",   value: followingCount.toLocaleString(),   color: "var(--text)" },
    { label: "New",         value: `+${newFollowers}`,               color: "var(--success)" },
    { label: "Unfollowed",  value: unfollowers > 0 ? `−${unfollowers}` : "0", color: unfollowers > 0 ? "var(--danger)" : "var(--text)" },
    { label: "Not back",    value: notFollowingBack.toLocaleString(), color: "var(--warn)" },
  ]

  return (
    <div className="flex gap-2.5 overflow-x-auto px-5 pb-1">
      {pills.map(({ label, value, color }) => (
        <div key={label} className="shrink-0 rounded-2xl px-4 py-3.5 min-w-[110px]"
          style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <p className="text-[11px] mb-1.5" style={{ color: "var(--text-3)" }}>{label}</p>
          <p className="text-[22px] font-bold tracking-tight leading-none font-mono" style={{ color }}>{value}</p>
        </div>
      ))}
    </div>
  )
}
