"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { CheckCircle } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [disconnecting, setDisconnecting] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [igUsername, setIgUsername] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/instagram/status")
      .then(r => r.json())
      .then(d => { setConnected(d.connected ?? false); setIgUsername(d.ig_username ?? null) })
      .catch(() => setConnected(false))
  }, [])

  async function handleDisconnect() {
    if (!confirm("Disconnect Instagram? Your snapshot history will be kept.")) return
    setDisconnecting(true)
    await fetch("/api/instagram/session", { method: "DELETE" })
    setConnected(false)
    setIgUsername(null)
    setDisconnecting(false)
  }

  async function handleDeleteAccount() {
    if (!confirm("Delete your account and all data permanently? This cannot be undone.")) return
    setDeletingAccount(true)
    await fetch("/api/account", { method: "DELETE" })
    await signOut({ callbackUrl: "/" })
  }

  return (
    <div>
      <header className="sticky top-0 z-10 px-5 py-4 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--border)", background: "rgba(8,8,14,0.85)" }}>
        <h1 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--text)" }}>Settings</h1>
      </header>

      <div className="px-5 py-5 space-y-4">
        <section className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Instagram Account</p>
          </div>
          <div className="px-4 py-4 flex items-center justify-between gap-3">
            {connected === null ? (
              <div className="h-4 w-32 rounded animate-pulse" style={{ background: "var(--border)" }} />
            ) : connected ? (
              <>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={16} strokeWidth={1.8} style={{ color: "var(--success)", flexShrink: 0 }} />
                  <div>
                    <p className="text-[14px] font-medium" style={{ color: "var(--text)" }}>
                      {igUsername ? `@${igUsername}` : "Connected"}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--text-3)" }}>Encrypted session active</p>
                  </div>
                </div>
                <button onClick={handleDisconnect} disabled={disconnecting}
                  className="text-[13px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                  style={{ color: "var(--danger)" }}>
                  {disconnecting ? "Disconnecting…" : "Disconnect"}
                </button>
              </>
            ) : (
              <>
                <p className="text-[14px]" style={{ color: "var(--text-2)" }}>No account connected</p>
                <a href="/connect" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>Connect</a>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Fetch Cooldown</p>
          </div>
          <div className="px-4 py-4">
            <p className="text-[14px]" style={{ color: "var(--text-2)" }}>1 hour between snapshots</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--text-3)" }}>Prevents Instagram rate limiting.</p>
          </div>
        </section>

        <section className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Account</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-left text-[14px] hover:opacity-80 transition-opacity"
              style={{ color: "var(--text-2)" }}>
              Sign out
            </button>
            <div className="border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <button onClick={handleDeleteAccount} disabled={deletingAccount}
                className="text-[13px] font-medium hover:opacity-80 transition-opacity disabled:opacity-50"
                style={{ color: "var(--danger)" }}>
                {deletingAccount ? "Deleting…" : "Delete account and all data"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
