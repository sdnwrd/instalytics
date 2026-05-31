"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

const messages = [
  "Connecting to Instagram…",
  "Fetching your followers…",
  "Fetching who you follow…",
  "Crunching the numbers…",
  "Almost there…",
]

export default function OnboardingPage() {
  const router = useRouter()
  const [msgIndex, setMsgIndex] = useState(0)
  const [error, setError] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch("/api/instagram/fetch", { method: "POST" })
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          router.push("/dashboard")
        }
      })
      .catch(() => setError("Something went wrong. You can refresh your data from the dashboard."))
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center gap-4">
        <p className="text-[14px]" style={{ color: "var(--text-2)" }}>{error}</p>
        <button onClick={() => router.push("/dashboard")}
          className="rounded-2xl px-6 py-3 text-[14px] font-semibold"
          style={{ background: "var(--accent)", color: "#fff" }}>
          Go to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center gap-6">
      <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
      <p className="text-[15px] font-medium transition-all duration-500" style={{ color: "var(--text)" }}>
        {messages[msgIndex]}
      </p>
      <p className="text-[12px]" style={{ color: "var(--text-3)" }}>This takes about 10–20 seconds</p>
    </div>
  )
}
