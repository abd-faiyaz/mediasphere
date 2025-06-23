"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
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
  isClerkUser?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  loginLocal: (email: string, password: string) => Promise<void>
  registerLocal: (email: string, password: string, username: string) => Promise<void>
  logout: () => void
  syncWithBackend: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check authentication status on mount (only on client)
  useEffect(() => {
    if (isMounted) {
      checkAuthStatus()
    }
  }, [isMounted])

  // Handle Clerk authentication
  useEffect(() => {
    if (isMounted && isLoaded && isSignedIn && clerkUser) {
      handleClerkAuthentication()
    } else if (isMounted && isLoaded && !isSignedIn) {
      // User is not signed in with Clerk, check local auth
      checkLocalAuth()
    }
  }, [isMounted, isLoaded, isSignedIn, clerkUser])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const localUser = await authService.getCurrentUser()
      if (localUser) {
        setUser({ ...localUser, isClerkUser: false })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const checkLocalAuth = async () => {
    try {
      const localUser = await authService.getCurrentUser()
      if (localUser) {
        setUser({ ...localUser, isClerkUser: false })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Local auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClerkAuthentication = async () => {
    if (!clerkUser) return

    try {
      const authResponse = await authService.authenticateWithClerk(clerkUser)
      setUser({ 
        ...authResponse.user, 
        isClerkUser: true 
      })
    } catch (error) {
      console.error('Clerk authentication failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loginLocal = async (email: string, password: string) => {
    try {
      const authResponse = await authService.loginLocal({ email, password })
      setUser({ ...authResponse.user, isClerkUser: false })
    } catch (error) {
      throw error
    }
  }

  const registerLocal = async (email: string, password: string, username: string) => {
    try {
      const authResponse = await authService.registerLocal({ email, password, username })
      setUser({ ...authResponse.user, isClerkUser: false })
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    // If user is signed in with Clerk, we don't automatically sign them out
    // They can choose to sign out of Clerk separately
  }

  const syncWithBackend = async () => {
    if (isSignedIn && clerkUser) {
      await handleClerkAuthentication()
    } else {
      await checkLocalAuth()
    }
  }

  const isAuthenticated = !!user

  // Don't render children until we're mounted and have checked auth status
  if (!isMounted || (isLoading && !isLoaded)) {
    return <PageLoader text="Initializing Mediasphere..." />
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isLoading || !isLoaded,
        isAuthenticated,
        loginLocal,
        registerLocal,
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
