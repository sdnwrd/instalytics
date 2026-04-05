const steps = [
  { n: 1, title: 'Tap "Continue to Instagram"', desc: "Opens Instagram's login on our secure proxy." },
  { n: 2, title: "Sign in normally",             desc: "2FA and Meta Verified accounts fully supported." },
  { n: 3, title: "You're redirected back",        desc: "Done — we've captured the session token, not your password." },
]

export function StepsCard() {
  return (
    <div className="rounded-2xl p-5 mb-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>How it works</p>
      <div className="space-y-0">
        {steps.map(({ n, title, desc }, i) => (
          <div key={n} className={`flex gap-3 py-3 ${i < steps.length - 1 ? "border-b" : ""}`} style={{ borderColor: "var(--border)" }}>
            <div className="w-[22px] h-[22px] rounded-full text-[10.5px] font-bold flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: "var(--accent-bg)", color: "var(--accent)" }}>{n}</div>
            <div>
              <div className="text-[13.5px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>{title}</div>
              <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-2)" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
