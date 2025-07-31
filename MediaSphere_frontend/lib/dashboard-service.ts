import { authService } from './auth-service'

export interface DashboardStats {
  clubsCount: number
  discussionsCount: number
  eventsCount: number
}

export interface DashboardData {
  stats: DashboardStats
  isLoading: boolean
  error: string | null
}

class DashboardService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  private async makeRequest(endpoint: string) {
    try {
      const token = authService.getToken()
      if (!token) {
        throw new Error('No authentication token available')
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      throw error
    }
  }

  async getUserClubs(userId: string): Promise<any[]> {
    try {
      const clubs = await this.makeRequest(`/users/${userId}/clubs`)
      return Array.isArray(clubs) ? clubs : []
    } catch (error) {
      console.error('Error fetching user clubs:', error)
      return []
    }
  }

  async getUserThreads(userId: string): Promise<any[]> {
    try {
      const threads = await this.makeRequest(`/threads/user/${userId}`)
      return Array.isArray(threads) ? threads : []
    } catch (error) {
      console.error('Error fetching user threads:', error)
      return []
    }
  }

  async getUserEvents(userId: string): Promise<any[]> {
    try {
      const events = await this.makeRequest(`/events/user/${userId}/upcoming`)
      return Array.isArray(events) ? events : []
    } catch (error) {
      console.error('Error fetching user events:', error)
      return []
    }
  }

  async getDashboardStats(userId: string): Promise<DashboardStats> {
    try {
      // Fetch all data in parallel for better performance
      const [clubs, threads, events] = await Promise.allSettled([
        this.getUserClubs(userId),
        this.getUserThreads(userId),
        this.getUserEvents(userId),
      ])

      const clubsCount = clubs.status === 'fulfilled' ? clubs.value.length : 0
      const discussionsCount = threads.status === 'fulfilled' ? threads.value.length : 0
      const eventsCount = events.status === 'fulfilled' ? events.value.length : 0

      return {
        clubsCount,
        discussionsCount,
        eventsCount,
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        clubsCount: 0,
        discussionsCount: 0,
        eventsCount: 0,
      }
    }
  }
}

export const dashboardService = new DashboardService()
