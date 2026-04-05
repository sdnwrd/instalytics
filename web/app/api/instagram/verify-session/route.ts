import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { token } = await req.json()

  const data = await callFastAPI("/instagram/verify-session", {
    method: "POST",
    body: JSON.stringify({ token, user_id: session.user.id }),
  })
  return NextResponse.json(data)
}
