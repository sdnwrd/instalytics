import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Instalytics",
  description: "Instagram follower analytics",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
