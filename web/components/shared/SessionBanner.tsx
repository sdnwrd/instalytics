"use client"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export function SessionBanner() {
  return (
    <div className="mx-5 mt-4 flex items-center gap-2.5 rounded-xl px-4 py-3"
      style={{ background: "rgba(251,113,133,0.08)", border: "1px solid rgba(251,113,133,0.2)" }}>
      <AlertTriangle size={14} strokeWidth={1.8} style={{ color: "var(--danger)", flexShrink: 0 }} />
      <span className="text-[13px] flex-1" style={{ color: "var(--danger)" }}>
        Your Instagram session expired.{" "}
        <Link href="/connect" className="underline font-medium">Reconnect to continue.</Link>
      </span>
    </div>
  )
}
