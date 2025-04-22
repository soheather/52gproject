import type React from "react"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { TopNavbar } from "@/components/top-navbar"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <div className="flex flex-col min-h-screen bg-[#f0f5f5]">
            <TopNavbar />
            <div className="flex-1 overflow-x-hidden pt-4">{children}</div>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

export const metadata = {
  generator: "v0.dev",
}
