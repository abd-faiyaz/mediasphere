"use client"

import { authService } from './auth-service'

// Types based on the API schema
interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  mediaPreferences?: string[]
  firstName?: string
  lastName?: string
  profilePic?: string
  createdAt?: string
  updatedAt?: string
}

interface Notification {
  id: string
  title: string
  content: string
  type: string // "comment", "thread_reply", "thread_like", "comment_like", "thread_dislike", "comment_dislike", "club_join", "club_leave", "club_thread_created", "event", "ai", "reaction", etc.
  isRead: boolean
  referenceId?: string
  referenceType?: string // "thread", "club", "comment", "event", etc.
  createdAt: string
  user?: User // The recipient of the notification
  actor?: User // The user who performed the action (e.g., who liked, commented, etc.)
  // Additional computed fields for frontend
  timestamp?: string
  message?: string
  link?: string
  read?: boolean
}

interface Club {
  id: string
  name: string
  description?: string
  mediaId: string
  createdAt?: string
  // Additional fields from membership
  role?: string
  joined?: string
}

interface Thread {
  id: string
  title: string
  content?: string
  clubId: string
  authorId: string
  createdAt: string
  updatedAt?: string
  // Additional computed fields
  club?: string
  replies?: number
  likes?: number
  time?: string
}

interface Comment {
  id: string
  content: string
  threadId: string
  authorId: string
  createdAt: string
  updatedAt?: string
  // Additional computed fields
  thread?: string
  club?: string
  time?: string
}

interface UserStats {
  threadsCreated: number
  commentsPosted: number
  eventsAttended: number
  clubsJoined: number
}

interface Achievement {
  id: number
  title: string
  description: string
  earned: string
}

class ApiService {
  private static instance: ApiService
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }

  private getAuthHeaders() {
    const token = authService.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // User-related API calls
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = authService.getToken()
      if (!token) return null

      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching current user:', error)
      return null
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  async updateUserProfile(userId: string, userData: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating user profile:', error)
      return null
    }
  }

  async getUserClubs(userId: string): Promise<Club[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/clubs`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return []
      }

      const clubs = await response.json()
      
      // Add role and joined date info if available
      return clubs.map((club: any) => ({
        ...club,
        role: club.role || 'Member',
        joined: club.joinedAt ? new Date(club.joinedAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }) : 'Unknown'
      }))
    } catch (error) {
      console.error('Error fetching user clubs:', error)
      return []
    }
  }

  // Thread-related API calls
  async getAllThreads(): Promise<Thread[]> {
    try {
      const response = await fetch(`${this.baseUrl}/threads/`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return []
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching threads:', error)
      return []
    }
  }

  async getClubThreads(clubId: string): Promise<Thread[]> {
    try {
      const response = await fetch(`${this.baseUrl}/clubs/${clubId}/threads`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return []
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching club threads:', error)
      return []
    }
  }

  // Search API calls
  async searchThreads(query: string, limit: number = 10): Promise<Thread[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/threads?q=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return []
      }

      return await response.json()
    } catch (error) {
      console.error('Error searching threads:', error)
      return []
    }
  }

  // Helper methods to derive user-specific data
  async getUserThreads(userId: string): Promise<Thread[]> {
    try {
      // Get all threads and filter by author
      const allThreads = await this.getAllThreads()
      const userThreads = allThreads.filter(thread => thread.authorId === userId)
      
      // Format for display
      return userThreads.map(thread => ({
        ...thread,
        replies: Math.floor(Math.random() * 50), // Placeholder - would need actual API
        likes: Math.floor(Math.random() * 30),   // Placeholder - would need actual API
        time: this.formatTimeAgo(thread.createdAt)
      }))
    } catch (error) {
      console.error('Error fetching user threads:', error)
      return []
    }
  }

  async getUserComments(userId: string): Promise<Comment[]> {
    try {
      // Note: This would require a new API endpoint like /users/{id}/comments
      // For now, we'll return empty array as this endpoint doesn't exist
      // TODO: Implement /users/{id}/comments endpoint in backend
      return []
    } catch (error) {
      console.error('Error fetching user comments:', error)
      return []
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Calculate stats from available data
      const [userThreads, userClubs] = await Promise.all([
        this.getUserThreads(userId),
        this.getUserClubs(userId)
      ])

      return {
        threadsCreated: userThreads.length,
        commentsPosted: 0, // Would need comments API
        eventsAttended: 0, // Would need events attendance API
        clubsJoined: userClubs.length
      }
    } catch (error) {
      console.error('Error calculating user stats:', error)
      return {
        threadsCreated: 0,
        commentsPosted: 0,
        eventsAttended: 0,
        clubsJoined: 0
      }
    }
  }

  // Mock achievements (would need actual achievement system)
  getUserAchievements(userId: string): Achievement[] {
    // This would need to be implemented in the backend
    return [
      { id: 1, title: "First Thread", description: "Created your first discussion thread", earned: "Recently" },
      { id: 2, title: "Community Builder", description: "Joined multiple clubs", earned: "This month" },
    ]
  }

  // Notification-related API calls
  async getUserNotifications(userId: string): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/notifications`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return []
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching user notifications:', error)
      return []
    }
  }

  async getAllNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const notifications: any[] = await response.json()
      return notifications.map(notification => ({
        ...notification,
        message: notification.content,
        read: notification.isRead,
        timestamp: this.formatTimeAgo(notification.createdAt),
        link: this.generateNotificationLink(notification)
      }))
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/?unreadOnly=true`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Failed to fetch unread notifications')
      }

      const notifications: any[] = await response.json()
      return notifications.map(notification => ({
        ...notification,
        message: notification.content,
        read: notification.isRead,
        timestamp: this.formatTimeAgo(notification.createdAt),
        link: this.generateNotificationLink(notification)
      }))
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
      return []
    }
  }

  private generateNotificationLink(notification: any): string {
    switch (notification.referenceType) {
      case 'thread':
        return `/threads/${notification.referenceId}`
      case 'club':
        return `/clubs/${notification.referenceId}`
      case 'event':
        return `/events/${notification.referenceId}`
      case 'comment':
        return `/threads/${notification.referenceId}` // Assuming comment references thread
      default:
        return '#'
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isRead: true })
      })

      return response.ok
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  async markAllNotificationsAsRead(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/mark-all-read`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      })

      return response.ok
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }
  }

  async getUnreadNotificationCount(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/unread-count`, {
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        return 0
      }

      const data = await response.json()
      return data.count || 0
    } catch (error) {
      console.error('Error fetching unread notification count:', error)
      return 0
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting notification:', error)
      return false
    }
  }

  // Utility methods
  private formatTimeAgo(dateString: string): string {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  private formatJoinDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
}

export const apiService = ApiService.getInstance()
export type { User, Club, Thread, Comment, UserStats, Achievement, Notification }