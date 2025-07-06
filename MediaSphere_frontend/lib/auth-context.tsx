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
  isClerkUser?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  loginLocal: (email: string, password: string) => Promise<void>
  registerLocal: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
  syncWithBackend: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { signOut } = useClerk()

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
    // Don't auto-authenticate if we're in the middle of logging out
    if (isLoggingOut) return
    
    if (isMounted && isLoaded && isSignedIn && clerkUser) {
      handleClerkAuthentication()
    } else if (isMounted && isLoaded && !isSignedIn) {
      // User is not signed in with Clerk, check local auth
      checkLocalAuth()
    }
  }, [isMounted, isLoaded, isSignedIn, clerkUser, isLoggingOut])

  const checkAuthStatus = async () => {
    // Don't check auth status if we're logging out
    if (isLoggingOut) return
    
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
      const token = authService.getToken()
      
      if (!token) {
        setUser(null)
        return
      }
      
      const localUser = await authService.getCurrentUser()
      
      if (localUser) {
        setUser({ ...localUser, isClerkUser: false })
      } else {
        authService.removeToken()
        setUser(null)
      }
    } catch (error) {
      console.error('Local auth check failed:', error)
      authService.removeToken()
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

  const logout = async () => {
    try {
      // Set logout flag to prevent auto-authentication
      setIsLoggingOut(true)
      
      // Clear all auth data immediately
      authService.logout()
      setUser(null)
      setIsLoading(false)
      
      // Sign out from Clerk if user is signed in
      if (isSignedIn) {
        await signOut()
      }
      
      // Clear any cached data from the current page
      if (typeof window !== 'undefined') {
        // Clear any potential React Query cache
        if ((window as any).queryClient) {
          (window as any).queryClient.clear()
        }
        
        // Use router to navigate and clear any cached pages
        // Using replace to prevent going back to the logged-in state
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
    } else {
      await checkLocalAuth()
    }
  }

  const isAuthenticated = !!user

  // Always render children to prevent hydration issues
  // The loading state will be handled by individual components
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
