"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Shield } from "lucide-react"
import Link from "next/link"
import { TrustGrid } from "@/components/connect/TrustGrid"
import { StepsCard } from "@/components/connect/StepsCard"

export default function ConnectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleConnect() {
    setLoading(true)
    setError("")
    const res = await fetch("/api/instagram/init-connect", { method: "POST" })
    if (!res.ok) {
      setError("Failed to start connection. Please try again.")
      setLoading(false)
      return
    }
    const { proxy_url } = await res.json()
    window.location.href = proxy_url
  }

  return (
    <div className="max-w-[480px] mx-auto px-5 py-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] mb-8 transition-colors"
        style={{ color: "var(--text-3)" }}>
        <ArrowLeft size={14} strokeWidth={1.8} />Back
      </Link>

      <p className="text-[13px] font-semibold mb-4" style={{ color: "var(--text-3)" }}>Instalytics</p>
      <h1 className="text-[24px] font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>Connect Instagram</h1>
      <p className="text-[14.5px] leading-relaxed mb-6" style={{ color: "var(--text-2)" }}>
        Link your account to start tracking. One-time setup — takes about 30 seconds.
      </p>

      <TrustGrid />
      <StepsCard />

      {error && <p className="text-xs mb-3" style={{ color: "var(--danger)" }}>{error}</p>}

      <button onClick={handleConnect} disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold tracking-tight transition-colors disabled:opacity-60 mb-3"
        style={{ background: "var(--accent)", color: "#fff" }}>
        <ArrowRight size={16} strokeWidth={2} />
        {loading ? "Opening Instagram…" : "Continue to Instagram"}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-[12px]" style={{ color: "var(--text-3)" }}>
        <Shield size={12} strokeWidth={1.5} />Secured over HTTPS
      </div>
      <p className="text-center text-[11.5px] mt-4 leading-relaxed" style={{ color: "var(--text-3)" }}>
        Not affiliated with Instagram or Meta.
      </p>
    </div>
  )
}
