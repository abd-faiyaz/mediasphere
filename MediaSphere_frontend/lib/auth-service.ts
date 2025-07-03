"use client"

interface LocalAuthUser {
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
  user: LocalAuthUser
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  email: string
  password: string
  username: string
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

  // Local authentication methods
  async loginLocal(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const authResponse = await response.json()
    this.storeToken(authResponse.token)
    return authResponse
  }

  async registerLocal(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const authResponse = await response.json()
    this.storeToken(authResponse.token)
    return authResponse
  }

  // OAuth authentication methods
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
      throw new Error(error.message || 'OAuth authentication failed')
    }

    const authResponse = await response.json()
    this.storeToken(authResponse.token)
    return authResponse
  }

  private extractAuthProvider(clerkUser: any): string {
    // Extract the OAuth provider from Clerk user data
    const externalAccounts = clerkUser.externalAccounts || []
    if (externalAccounts.length > 0) {
      return externalAccounts[0].provider || 'unknown'
    }
    return 'clerk'
  }

  // Token management
  storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token')
    }
    return null
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
      // Also clear any other auth-related items that might exist
      localStorage.removeItem('user_data')
      // Clear session storage as well
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_data')
    }
  }

  // Get current user from backend
  async getCurrentUser(): Promise<LocalAuthUser | null> {
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

  // Logout
  logout(): void {
    this.removeToken()
    // Force any cached data to be cleared
    if (typeof window !== 'undefined') {
      // Clear any cached user data or other auth-related storage
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('auth') || key.includes('user') || key.includes('token')
      )
      authKeys.forEach(key => localStorage.removeItem(key))
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken()
  }
}

export const authService = AuthService.getInstance()
