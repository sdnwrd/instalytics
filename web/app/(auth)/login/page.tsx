"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Zap } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Invalid email or password")
      setLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-8">
        <Zap size={18} style={{ color: "var(--accent)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          Insta<span style={{ color: "var(--accent)" }}>lytics</span>
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--text)" }}>Sign in</h1>
      <p className="text-sm mb-7" style={{ color: "var(--text-2)" }}>Welcome back.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Email</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-colors"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
            placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: "var(--text-3)" }}>Password</label>
          <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition-colors"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--text)" }}
            placeholder="••••••••" />
        </div>

        {error && <p className="text-xs pt-1" style={{ color: "var(--danger)" }}>{error}</p>}

        <button type="submit" disabled={loading}
          className="w-full rounded-lg py-3 text-sm font-semibold tracking-tight transition-colors disabled:opacity-60 mt-2"
          style={{ background: "var(--accent)", color: "#fff" }}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-3)" }}>
        No account?{" "}
        <Link href="/register" style={{ color: "var(--accent)" }} className="hover:underline">Create one</Link>
      </p>
    </div>
  )
}
