"use client"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useState } from "react"

interface DataPoint { taken_at: string; follower_count: number }
const ranges = ["7d", "30d", "All"] as const

export function GrowthChart({ data }: { data: DataPoint[] }) {
  const [range, setRange] = useState<typeof ranges[number]>("30d")

  const filtered = data.filter((d) => {
    if (range === "All") return true
    const days = range === "7d" ? 7 : 30
    return new Date(d.taken_at) >= new Date(Date.now() - days * 86400_000)
  })

  const formatted = filtered.map((d) => ({
    date: new Date(d.taken_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
    followers: d.follower_count,
  }))

  return (
    <div className="rounded-2xl p-4 mx-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[14px] font-semibold" style={{ color: "var(--text)" }}>Follower Growth</span>
        <div className="flex gap-0.5 rounded-lg p-0.5" style={{ background: "rgba(255,255,255,0.05)" }}>
          {ranges.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className="px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors"
              style={range === r ? { background: "var(--accent)", color: "#fff" } : { color: "var(--text-3)" }}>
              {r}
            </button>
          ))}
        </div>
      </div>
      {formatted.length < 2 ? (
        <div className="h-24 flex items-center justify-center text-[13px]" style={{ color: "var(--text-3)" }}>
          Take your first snapshot to start tracking growth.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={formatted} margin={{ top: 4, right: 0, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4A7CF7" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4A7CF7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "rgba(242,242,250,0.3)" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <Tooltip
              contentStyle={{ background: "#16161F", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "rgba(242,242,250,0.55)" }}
              itemStyle={{ color: "#4A7CF7" }}
            />
            <Area type="monotone" dataKey="followers" stroke="#4A7CF7" strokeWidth={1.8} fill="url(#grad)" dot={false} activeDot={{ r: 4, fill: "#4A7CF7" }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
