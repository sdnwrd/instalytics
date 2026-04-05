"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, AlertCircle } from "lucide-react"

function SuccessContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get("token")
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Missing token — please try connecting again.")
      return
    }
    fetch("/api/instagram/verify-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.connected) {
          setStatus("success")
          setTimeout(() => router.push("/dashboard"), 1500)
        } else {
          setStatus("error")
          setMessage(data.error ?? "Verification failed. Please try again.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMessage("Network error. Please try again.")
      })
  }, [token, router])

  return (
    <div className="text-center max-w-[320px]">
      {status === "verifying" && (
        <>
          <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Verifying session…</h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-3)" }}>Just a moment.</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "var(--success)" }} strokeWidth={1.5} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Instagram connected</h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-3)" }}>Redirecting to your dashboard…</p>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: "var(--danger)" }} strokeWidth={1.5} />
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)" }}>Connection failed</h2>
          <p className="text-sm mt-2 mb-5" style={{ color: "var(--text-3)" }}>{message}</p>
          <button onClick={() => router.push("/connect")}
            className="rounded-xl px-6 py-2.5 text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Try again
          </button>
        </>
      )}
    </div>
  )
}

export default function ConnectSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-5">
      <Suspense fallback={<div style={{ color: "var(--text-3)" }}>Loading…</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
