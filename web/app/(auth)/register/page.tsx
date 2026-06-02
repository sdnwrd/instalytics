"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? "Registration failed")
      setLoading(false)
      return
    }
    await signIn("credentials", { email, password, callbackUrl: "/connect", redirect: true })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <Zap size={18} style={{ color: "var(--accent)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          Insta<span style={{ color: "var(--accent)" }}>lytics</span>
        </span>
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>Create account</h1>
      <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Start tracking your Instagram followers.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {[
          { label: "Name", type: "text", value: name, onChange: setName, placeholder: "Your name", autoComplete: "name", required: false },
          { label: "Email", type: "email", value: email, onChange: setEmail, placeholder: "you@example.com", autoComplete: "email", required: true },
          { label: "Password", type: "password", value: password, onChange: setPassword, placeholder: "Min 8 characters", autoComplete: "new-password", required: true },
        ].map(({ label, type, value, onChange, placeholder, autoComplete, required }) => (
          <div key={label}>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-3)" }}>{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
              autoComplete={autoComplete} required={required} minLength={type === "password" ? 8 : undefined}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }} />
          </div>
        ))}
        {error && <p className="text-xs pt-1" style={{ color: "var(--danger)" }}>{error}</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded-lg py-3 text-sm font-semibold tracking-tight disabled:opacity-60 mt-2"
          style={{ background: "var(--accent)", color: "#fff" }}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)" }} className="hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
