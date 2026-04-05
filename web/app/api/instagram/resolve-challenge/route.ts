import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { callFastAPI } from "@/lib/fastapi"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { session_id, code } = await req.json()
  if (!session_id || !code)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })

  try {
    const data = await callFastAPI("/instagram/resolve-challenge", {
      method: "POST",
      body: JSON.stringify({ session_id, code, user_id: session.user.id }),
    })
    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 })
  }
}
