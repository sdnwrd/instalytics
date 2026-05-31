"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Shield, KeyRound, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

type Step = "credentials" | "challenge"

function InstagramLogo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-g" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#ig-g)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" />
      <circle cx="17.8" cy="6.2" r="1.1" fill="white" />
    </svg>
  )
}

export default function ConnectPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("credentials")
  const [challengeType, setChallengeType] = useState<"2fa" | "security_code">("2fa")
  const [sessionId, setSessionId] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

    router.push("/connect/onboarding")
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

    router.push("/connect/onboarding")
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
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0">
              <InstagramLogo size={36} />
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

          <form onSubmit={handleConnect} className="flex flex-col gap-3" autoComplete="off">
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Instagram username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="your_username"
                autoComplete="off"
                disabled={loading}
                required
                className="w-full rounded-xl px-4 py-3 text-[14px] outline-none disabled:opacity-60"
                style={inputStyle}
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: "var(--text-2)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  disabled={loading}
                  required
                  className="w-full rounded-xl px-4 py-3 pr-11 text-[14px] outline-none disabled:opacity-60"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  tabIndex={-1}
                  style={{ color: "var(--text-3)" }}
                >
                  {showPassword ? <EyeOff size={16} strokeWidth={1.8} /> : <Eye size={16} strokeWidth={1.8} />}
                </button>
              </div>
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
              disabled={loading}
              required
              className="w-full rounded-xl px-4 py-3 text-[22px] font-mono tracking-[0.3em] text-center outline-none disabled:opacity-60"
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
