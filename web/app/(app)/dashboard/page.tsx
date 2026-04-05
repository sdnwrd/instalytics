import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"
import { StatPills } from "@/components/dashboard/StatPills"
import { GrowthChart } from "@/components/dashboard/GrowthChart"
import { RecentChanges } from "@/components/dashboard/RecentChanges"
import { SessionBanner } from "@/components/shared/SessionBanner"
import { RefreshButton } from "@/components/dashboard/RefreshButton"
import { Shield } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id!

  const [status, diff, history] = await Promise.all([
    callFastAPI<any>(`/instagram/status?user_id=${userId}`).catch(() => null),
    callFastAPI<any>(`/analytics/diff?user_id=${userId}`).catch(() => ({ unfollowers: [], new_followers: [], not_following_back: [], you_dont_follow_back: [] })),
    callFastAPI<any[]>(`/analytics/history?user_id=${userId}&days=30`).catch(() => []),
  ])

  const latestSnap = history[history.length - 1]
  const needsReconnect = status?.status === "needs_reconnect"

  return (
    <div>
      <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--border)", background: "rgba(8,8,14,0.85)" }}>
        <div>
          <h1 className="text-[17px] font-bold tracking-tight" style={{ color: "var(--text)" }}>Dashboard</h1>
          {status?.ig_username && (
            <p className="text-[12px] mt-0.5" style={{ color: "var(--text-3)" }}>@{status.ig_username}</p>
          )}
        </div>
        {status?.connected && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--success)" }} />
            <span className="text-[11.5px] font-medium" style={{ color: "var(--success)" }}>Connected</span>
          </div>
        )}
      </header>

      {needsReconnect && <SessionBanner />}

      {!status?.connected ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm mb-4" style={{ color: "var(--text-2)" }}>Connect your Instagram account to start tracking.</p>
          <a href="/connect" className="inline-block rounded-xl px-6 py-2.5 text-sm font-semibold"
            style={{ background: "var(--accent)", color: "#fff" }}>
            Connect Instagram
          </a>
        </div>
      ) : (
        <>
          <div className="pt-4 pb-2">
            <p className="px-5 text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
              {latestSnap ? `Snapshot · ${new Date(latestSnap.taken_at).toLocaleDateString()}` : "No snapshots yet"}
            </p>
            <StatPills
              followerCount={latestSnap?.follower_count ?? 0}
              followingCount={latestSnap?.following_count ?? 0}
              newFollowers={diff.new_followers.length}
              unfollowers={diff.unfollowers.length}
              notFollowingBack={diff.not_following_back.length}
            />
          </div>

          <div className="mt-5"><GrowthChart data={history} /></div>

          <div className="mt-5">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-[16px] font-bold tracking-tight" style={{ color: "var(--text)" }}>Recent Changes</h2>
              <a href="/analytics" className="text-[13px]" style={{ color: "var(--accent)" }}>See all</a>
            </div>
            <RecentChanges unfollowers={diff.unfollowers} newFollowers={diff.new_followers} />
          </div>

          <div className="px-5 mt-5">
            <RefreshButton cooldownSeconds={status?.cooldown_seconds ?? null} />
          </div>

          <div className="mx-5 mt-4 mb-6 flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: "rgba(74,124,247,0.06)", border: "1px solid rgba(74,124,247,0.14)" }}>
            <Shield size={12} strokeWidth={1.5} style={{ color: "rgba(74,124,247,0.8)", flexShrink: 0 }} />
            <span className="text-[12px]" style={{ color: "rgba(74,124,247,0.8)" }}>
              Session encrypted with AES-256. We never store your password.
            </span>
          </div>
        </>
      )}
    </div>
  )
}
