import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await callFastAPI(`/instagram/session?user_id=${session.user.id}`, { method: "DELETE" })
  return NextResponse.json(data)
}
