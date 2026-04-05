"use client"
import { useState } from "react"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function RefreshButton({ cooldownSeconds }: { cooldownSeconds: number | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const onCooldown = cooldownSeconds !== null && cooldownSeconds > 0

  async function handleRefresh() {
    if (onCooldown) return
    setLoading(true)
    setError("")
    const res = await fetch("/api/instagram/fetch", { method: "POST" })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Fetch failed")
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const minutesLeft = onCooldown ? Math.ceil(cooldownSeconds! / 60) : 0

  return (
    <div>
      <button onClick={handleRefresh} disabled={loading || onCooldown}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: "var(--accent)", color: "#fff" }}>
        <RefreshCw size={16} strokeWidth={2} className={loading ? "animate-spin" : ""} />
        {loading ? "Refreshing…" : "Refresh Snapshot"}
      </button>
      {onCooldown && <p className="text-center text-[12px] mt-2" style={{ color: "var(--text-3)" }}>Next refresh in {minutesLeft} min</p>}
      {error && <p className="text-center text-[12px] mt-2" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  )
}
