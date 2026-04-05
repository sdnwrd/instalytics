import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Shell } from "@/components/layout/Shell"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")
  return <Shell>{children}</Shell>
}
