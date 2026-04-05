import { Shield, Lock, Eye, Unplug } from "lucide-react"

const items = [
  { Icon: Shield, label: "AES-256 Encrypted", desc: "Session stored with military-grade encryption" },
  { Icon: Lock,   label: "No Password Stored", desc: "We capture a session token, not your credentials" },
  { Icon: Eye,    label: "Read-Only Access",    desc: "No posts, DMs, or account actions — ever" },
  { Icon: Unplug, label: "Disconnect Anytime",  desc: "Delete everything in one tap from Settings" },
]

export function TrustGrid() {
  return (
    <div className="grid grid-cols-2 gap-2.5 mb-5">
      {items.map(({ Icon, label, desc }) => (
        <div key={label} className="rounded-2xl p-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: "var(--accent-bg)" }}>
            <Icon size={15} style={{ color: "var(--accent)" }} strokeWidth={1.6} />
          </div>
          <div className="text-[13px] font-semibold mb-1" style={{ color: "var(--text)" }}>{label}</div>
          <div className="text-[11.5px] leading-relaxed" style={{ color: "var(--text-3)" }}>{desc}</div>
        </div>
      ))}
    </div>
  )
}
