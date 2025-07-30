"use client"

import { authService } from './auth-service'

// Enhanced Thread interface for feed
export interface FeedThread {
  id: string
  title: string
  content?: string
  clubId: string
  authorId: string
  createdAt: string
  updatedAt?: string
  lastActivityAt?: string
  viewCount: number
  likeCount: number
  dislikeCount: number
  commentCount: number
  // Additional computed fields for feed display
  club?: {
    id: string
    name: string
    mediaId: string
  }
  author?: {
    id: string
    username: string
    profilePic?: string
  }
  timeAgo?: string
  trendingScore?: number
  isLiked?: boolean
  isDisliked?: boolean
  mediaUrl?: string
}

export interface FeedResponse {
  content: FeedThread[]
  pageable: {
    pageNumber: number
    pageSize: number
    sort: {
      sorted: boolean
      empty: boolean
      unsorted: boolean
    }
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalElements: number
  totalPages: number
  last: boolean
  first: boolean
  size: number
  number: number
  numberOfElements: number
  sort: {
    sorted: boolean
    empty: boolean
    unsorted: boolean
  }
  empty: boolean
}

export interface FeedOptions {
  page?: number
  size?: number
  userId?: string
}

class FeedService {
  private static instance: FeedService
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

  static getInstance(): FeedService {
    if (!FeedService.instance) {
      FeedService.instance = new FeedService()
    }
    return FeedService.instance
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken()
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`API Error (${response.status}):`, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return response.json()
    } catch (error) {
      console.error('Network error:', error)
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please ensure the backend is running on localhost:8080')
      }
      throw error
    }
  }

  /**
   * Get personalized feed for authenticated user
   * Shows posts from joined clubs first, then trending posts
   */
  async getPersonalizedFeed(options: FeedOptions = {}): Promise<FeedResponse> {
    const { page = 0, size = 10, userId } = options
    
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    if (userId) {
      params.append('userId', userId)
    }

    return this.makeRequest<FeedResponse>(`/api/feed/personalized?${params}`)
  }

  /**
   * Get trending feed for anonymous users or public feed
   * Shows posts ordered by trending score
   */
  async getTrendingFeed(options: FeedOptions = {}): Promise<FeedResponse> {
    const { page = 0, size = 10 } = options
    
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    return this.makeRequest<FeedResponse>(`/api/feed/trending?${params}`)
  }

  /**
   * Get hot feed (high recent activity)
   */
  async getHotFeed(options: FeedOptions = {}): Promise<FeedResponse> {
    const { page = 0, size = 10 } = options
    
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    return this.makeRequest<FeedResponse>(`/api/feed/hot?${params}`)
  }

  /**
   * Get new feed (recently created threads)
   */
  async getNewFeed(options: FeedOptions = {}): Promise<FeedResponse> {
    const { page = 0, size = 10 } = options
    
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    })

    return this.makeRequest<FeedResponse>(`/api/feed/new?${params}`)
  }

  /**
   * Helper to check feed service health
   */
  async checkHealth(): Promise<{ status: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/feed/health`)
      const text = await response.text()
      return { status: text }
    } catch (error) {
      return { status: 'error' }
    }
  }

  /**
   * Like a thread
   */
  async likeThread(threadId: string): Promise<any> {
    return this.makeRequest(`/api/feed/threads/${threadId}/like`, {
      method: 'POST',
    })
  }

  /**
   * Dislike a thread
   */
  async dislikeThread(threadId: string): Promise<any> {
    return this.makeRequest(`/api/feed/threads/${threadId}/dislike`, {
      method: 'POST',
    })
  }

  /**
   * Get user's reaction to a thread
   */
  async getThreadReaction(threadId: string): Promise<any> {
    const token = await authService.getToken()
    const headers: HeadersInit = { 'Content-Type': 'application/json' }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}/api/feed/threads/${threadId}/reaction`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response.json()
  }

  /**
   * Track view for a thread
   */
  async trackView(threadId: string): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/feed/threads/${threadId}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    } catch (error) {
      console.warn('Failed to track view:', error)
    }
  }

  /**
   * Format time for display (e.g., "2 hours ago")
   */
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'Just now'
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  /**
   * Process feed threads to add computed fields
   */
  processFeedThreads(threads: FeedThread[]): FeedThread[] {
    return threads.map(thread => ({
      ...thread,
      timeAgo: this.formatTimeAgo(thread.lastActivityAt || thread.createdAt),
      // Add other computed fields as needed
    }))
  }
}

export const feedService = FeedService.getInstance()
export default feedService
