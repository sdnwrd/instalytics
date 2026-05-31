export default function DashboardLoading() {
  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--border)", background: "rgba(8,8,14,0.85)" }}>
        <div className="h-5 w-28 rounded-md animate-pulse" style={{ background: "var(--card)" }} />
      </header>
      <div className="px-5 py-6 space-y-4">
        <div className="h-4 w-36 rounded animate-pulse" style={{ background: "var(--card)" }} />
        <div className="flex gap-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="h-16 w-24 rounded-2xl animate-pulse shrink-0" style={{ background: "var(--card)" }} />
          ))}
        </div>
        <div className="h-48 rounded-2xl animate-pulse mt-4" style={{ background: "var(--card)" }} />
        <div className="h-14 rounded-2xl animate-pulse mt-4" style={{ background: "var(--card)" }} />
      </div>
    </div>
  )
}
