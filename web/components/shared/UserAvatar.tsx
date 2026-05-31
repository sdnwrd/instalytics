import { User } from "lucide-react"

export function AvatarCircle({ username, size = 40 }: { username: string; size?: number }) {
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: "var(--card)",
        border: "1px solid var(--border)",
      }}
    >
      <User size={size * 0.45} strokeWidth={1.5} style={{ color: "var(--text-3)" }} />
    </div>
  )
}
