"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Instagram, Shield, KeyRound } from "lucide-react"
import Link from "next/link"

type Step = "credentials" | "challenge"

export default function ConnectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("credentials")
  const [challengeType, setChallengeType] = useState<"2fa" | "security_code">("2fa")
  const [sessionId, setSessionId] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/instagram/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? "Login failed. Check your username and password.")
      return
    }

    if (data.requires_challenge) {
      setChallengeType(data.challenge_type)
      setSessionId(data.session_id)
      setStep("challenge")
      return
    }

    router.push("/dashboard")
  }

  async function handleResolve(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const res = await fetch("/api/instagram/resolve-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, code }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? "Incorrect code. Please try again.")
      return
    }

    router.push("/dashboard")
  }

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    color: "var(--text)",
  }

  return (
    <div className="max-w-[420px] mx-auto px-5 py-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] mb-8 transition-colors"
        style={{ color: "var(--text-3)" }}>
        <ArrowLeft size={14} strokeWidth={1.8} />Back
      </Link>

      {step === "credentials" ? (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "var(--accent-bg)", border: "1px solid rgba(74,124,247,0.2)" }}>
              <Instagram size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold tracking-tight" style={{ color: "var(--text)" }}>Connect Instagram</h1>
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>One-time setup</p>
            </div>
          </div>

          <div className="rounded-2xl p-4 mb-5 text-[12.5px] leading-relaxed"
            style={{ background: "rgba(74,124,247,0.06)", border: "1px solid rgba(74,124,247,0.14)", color: "var(--text-2)" }}>
            Your password is never stored — only an encrypted session token is saved after login.
          </div>

          <form onSubmit={handleConnect} className="flex flex-col gap-3">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Instagram username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_username"
                autoComplete="username"
                required
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none"
                style={inputStyle}
              />
            </div>

            {error && (
              <p className="text-[12.5px] px-1" style={{ color: "var(--danger)" }}>{error}</p>
            )}

            <button type="submit" disabled={loading || !username || !password}
              className="w-full rounded-2xl py-3.5 text-[14.5px] font-semibold transition-opacity disabled:opacity-50 mt-1"
              style={{ background: "var(--accent)", color: "#fff" }}>
              {loading ? "Connecting…" : "Connect account"}
            </button>
          </form>

          <div className="flex items-center justify-center gap-1.5 mt-4 text-[11.5px]" style={{ color: "var(--text-3)" }}>
            <Shield size={11} strokeWidth={1.5} />
            AES-256 encrypted · Not affiliated with Meta
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)" }}>
              <KeyRound size={18} style={{ color: "var(--warn)" }} />
            </div>
            <div>
              <h1 className="text-[18px] font-bold tracking-tight" style={{ color: "var(--text)" }}>
                {challengeType === "2fa" ? "Two-Factor Auth" : "Security Check"}
              </h1>
              <p className="text-[12px]" style={{ color: "var(--text-3)" }}>
                {challengeType === "2fa"
                  ? "Enter the code from your authenticator app or SMS"
                  : "Instagram sent a code to your phone or email"}
              </p>
            </div>
          </div>

          <form onSubmit={handleResolve} className="flex flex-col gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              required
              className="w-full rounded-xl px-4 py-3 text-[22px] font-mono tracking-[0.3em] text-center outline-none"
              style={inputStyle}
            />

            {error && (
              <p className="text-[12.5px] px-1" style={{ color: "var(--danger)" }}>{error}</p>
            )}

            <button type="submit" disabled={loading || code.length < 6}
              className="w-full rounded-2xl py-3.5 text-[14.5px] font-semibold transition-opacity disabled:opacity-50"
              style={{ background: "var(--accent)", color: "#fff" }}>
              {loading ? "Verifying…" : "Verify code"}
            </button>

            <button type="button" onClick={() => { setStep("credentials"); setError(""); setCode("") }}
              className="text-[13px] text-center py-2" style={{ color: "var(--text-3)" }}>
              Start over
            </button>
          </form>
        </>
      )}
    </div>
  )
}
