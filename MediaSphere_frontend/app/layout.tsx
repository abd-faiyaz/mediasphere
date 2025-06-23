import type React from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import { AuthProvider } from "../lib/auth-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Mediasphere",
  description: "Connect, Discuss, and Grow Together",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
