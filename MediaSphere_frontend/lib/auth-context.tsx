"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { authService } from './auth-service'
import { PageLoader } from '@/components/ui/loading'

interface AuthUser {
  id: string
  email: string
  username: string
  role: string
  firstName?: string
  lastName?: string
  profilePic?: string
  oauthProvider: string
  primaryAuthMethod: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  isReady: boolean
  logout: () => Promise<void>
  syncWithBackend: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [authenticationComplete, setAuthenticationComplete] = useState(false)
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut } = useClerk()

  // Calculate derived state
  const isAuthenticated = !!user && !!isSignedIn
  const isReady = isMounted && isLoaded && authenticationComplete

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle Clerk authentication - this is now the only auth method
  useEffect(() => {
    if (!isMounted || !isLoaded || isLoggingOut) return

    if (isSignedIn && clerkUser) {
      handleClerkAuthentication()
    } else {
      // User is not signed in with Clerk, clear any existing user data
      setUser(null)
      setIsLoading(false)
      setAuthenticationComplete(true)
    }
  }, [isMounted, isLoaded, isSignedIn, clerkUser, isLoggingOut])

  const handleClerkAuthentication = async () => {
    if (!clerkUser) return

    try {
      setIsLoading(true)
      const authResponse = await authService.authenticateWithClerk(clerkUser)
      setUser(authResponse.user)
    } catch (error) {
      console.error('Clerk authentication failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
      setAuthenticationComplete(true)
    }
  }

  const logout = async () => {
    try {
      // Set logout flag to prevent auto-authentication
      setIsLoggingOut(true)
      
      // Clear all auth data immediately
      authService.logout()
      setUser(null)
      setIsLoading(false)
      
      // Sign out from Clerk
      if (isSignedIn) {
        await signOut()
      }
      
      // Navigate to sign-in page
      if (typeof window !== 'undefined') {
        window.location.replace('/sign-in')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, still navigate to sign-in
      if (typeof window !== 'undefined') {
        window.location.replace('/sign-in')
      }
    } finally {
      // Reset logout flag after a delay to allow navigation
      setTimeout(() => {
        setIsLoggingOut(false)
      }, 1000)
    }
  }

  const syncWithBackend = async () => {
    if (isSignedIn && clerkUser) {
      await handleClerkAuthentication()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || !isLoaded,
        isAuthenticated,
        isReady,
        logout,
        syncWithBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
