import { Sidebar } from "./Sidebar"
import { BottomNav } from "./BottomNav"

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-w-0 pb-[var(--tab-h)] lg:pb-0">
        {children}
      </main>
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}
