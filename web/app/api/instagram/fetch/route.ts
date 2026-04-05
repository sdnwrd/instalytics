import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const data = await callFastAPI(`/instagram/fetch?user_id=${session.user.id}`, { method: "POST" })
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    const status = msg.includes("Cooldown") ? 429 : msg.includes("expired") ? 401 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
