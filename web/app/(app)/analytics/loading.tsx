export default function AnalyticsLoading() {
  return (
    <div>
      <header className="sticky top-0 z-10 px-5 py-4 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--border)", background: "rgba(8,8,14,0.85)" }}>
        <div className="h-5 w-24 rounded-md animate-pulse" style={{ background: "var(--card)" }} />
      </header>
      <div className="flex gap-1 overflow-x-auto px-5 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        {[1,2,3,4].map(i => (
          <div key={i} className="h-7 w-28 rounded-lg animate-pulse shrink-0" style={{ background: "var(--card)" }} />
        ))}
      </div>
      <div className="divide-y divide-[var(--border)]">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex items-center gap-3 px-5 py-3 min-h-[64px]">
            <div className="w-10 h-10 rounded-full animate-pulse shrink-0" style={{ background: "var(--card)" }} />
            <div className="space-y-1.5 flex-1">
              <div className="h-3.5 w-32 rounded animate-pulse" style={{ background: "var(--card)" }} />
              <div className="h-3 w-20 rounded animate-pulse" style={{ background: "var(--card)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
