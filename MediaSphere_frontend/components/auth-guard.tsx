"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { PageLoader } from "@/components/ui/loading"

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isSignedIn, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isSignedIn, isLoaded, router])

  // Show loading while checking authentication
  if (!isLoaded) {
    return <PageLoader text="Checking authentication..." />
  }

  // Show fallback or redirect if not authenticated
  if (!isSignedIn) {
    return fallback || <PageLoader text="Redirecting to sign in..." />
  }

  // Show protected content if authenticated
  return <>{children}</>
} 