import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const days = req.nextUrl.searchParams.get("days") ?? "30"

  const data = await callFastAPI(`/analytics/history?user_id=${session.user.id}&days=${days}`)
  return NextResponse.json(data)
}
