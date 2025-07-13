"use client"

/**
 * Clerk-only authentication service.
 * Handles authentication through Clerk and syncs user data with backend.
 */

interface ClerkAuthUser {
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

interface AuthResponse {
  token: string
  user: ClerkAuthUser
}

export class AuthService {
  private static instance: AuthService
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL 
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth` 
    : "http://localhost:8080/auth"

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  /**
   * Authenticate user with Clerk and sync with backend.
   * This is the primary authentication method.
   */
  async authenticateWithClerk(clerkUser: any): Promise<AuthResponse> {
    const clerkUserDto = {
      clerkUserId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0],
      profileImageUrl: clerkUser.imageUrl,
      emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
      authProvider: this.extractAuthProvider(clerkUser)
    }

    const response = await fetch(`${this.baseUrl}/oauth/clerk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clerkUserDto),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Clerk authentication failed')
    }

    const authResponse = await response.json()
    this.storeToken(authResponse.token)
    return authResponse
  }

  /**
   * Extract OAuth provider from Clerk user data.
   */
  private extractAuthProvider(clerkUser: any): string {
    const externalAccounts = clerkUser.externalAccounts || []
    if (externalAccounts.length > 0) {
      return externalAccounts[0].provider || 'clerk'
    }
    return 'clerk'
  }

  /**
   * Store JWT token in localStorage.
   */
  storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  /**
   * Get JWT token from localStorage.
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  /**
   * Remove all authentication data from storage.
   */
  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_data')
    }
  }

  /**
   * Get current authenticated user from backend.
   */
  async getCurrentUser(): Promise<ClerkAuthUser | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        this.removeToken()
        return null
      }

      return await response.json()
    } catch (error) {
      this.removeToken()
      return null
    }
  }

  /**
   * Logout and clear all authentication data.
   */
  logout(): void {
    this.removeToken()
    // Clear auth-related data from storage
    if (typeof window !== 'undefined') {
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || 
        key.includes('user') || 
        key.includes('token') ||
        key.includes('clerk') ||
        key.includes('mediasphere')
      )
      authKeys.forEach(key => localStorage.removeItem(key))
      
      const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('auth') || 
        key.includes('user') || 
        key.includes('token') ||
        key.includes('clerk') ||
        key.includes('mediasphere')
      )
      sessionAuthKeys.forEach(key => sessionStorage.removeItem(key))
    }
  }
}

export const authService = AuthService.getInstance()
