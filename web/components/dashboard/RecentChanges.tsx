import { AvatarCircle } from "@/components/shared/UserAvatar"
import { Badge } from "@/components/ui/Badge"

interface IGUser { ig_user_id: string; username: string; full_name?: string }

export function RecentChanges({ unfollowers, newFollowers }: { unfollowers: IGUser[]; newFollowers: IGUser[] }) {
  const combined = [
    ...unfollowers.slice(0, 3).map((u) => ({ ...u, kind: "unfollowed" as const })),
    ...newFollowers.slice(0, 2).map((u) => ({ ...u, kind: "new" as const })),
  ]

  if (combined.length === 0) {
    return (
      <div className="px-5 py-4 text-[13px]" style={{ color: "var(--text-3)" }}>
        No changes yet. Refresh your snapshot to see who unfollowed you.
      </div>
    )
  }

  return (
    <div className="divide-y" style={{ borderColor: "var(--border)" }}>
      {combined.map((u) => (
        <div key={u.ig_user_id + u.kind} className="flex items-center gap-3 px-5 py-3 min-h-[60px]">
          <AvatarCircle username={u.username} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-medium truncate" style={{ color: "var(--text)" }}>@{u.username}</p>
            {u.full_name && <p className="text-[12px] truncate" style={{ color: "var(--text-3)" }}>{u.full_name}</p>}
          </div>
          <Badge variant={u.kind === "unfollowed" ? "danger" : "success"}>
            {u.kind === "unfollowed" ? "Unfollowed" : "New follower"}
          </Badge>
        </div>
      ))}
    </div>
  )
}
