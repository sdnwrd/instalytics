const gradients = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-500",
  "from-amber-500 to-red-500",
  "from-emerald-500 to-blue-500",
  "from-indigo-500 to-purple-500",
]

export function AvatarCircle({ username, size = 40 }: { username: string; size?: number }) {
  const idx = username.charCodeAt(0) % gradients.length
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradients[idx]} shrink-0`}
      style={{ width: size, height: size }}
    />
  )
}
