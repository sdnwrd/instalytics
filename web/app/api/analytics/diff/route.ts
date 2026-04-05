import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await callFastAPI(`/analytics/diff?user_id=${session.user.id}`)
  return NextResponse.json(data)
}
