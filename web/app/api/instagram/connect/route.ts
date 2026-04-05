import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { username, password } = await req.json()
  if (!username || !password)
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 })

  try {
    const data = await callFastAPI("/instagram/connect", {
      method: "POST",
      body: JSON.stringify({ username, password, user_id: session.user.id }),
    })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 })
  }
}
