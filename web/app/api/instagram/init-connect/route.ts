import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const data = await callFastAPI<{ proxy_url: string; token: string }>(
    `/instagram/init-connect?user_id=${session.user.id}`,
    { method: "POST" }
  )
  return NextResponse.json(data)
}
