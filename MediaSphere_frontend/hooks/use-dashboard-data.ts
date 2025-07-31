"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { dashboardService, DashboardStats } from '@/lib/dashboard-service'

export interface DashboardData {
  stats: DashboardStats
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useDashboardData(): DashboardData {
  const [stats, setStats] = useState<DashboardStats>({
    clubsCount: 0,
    discussionsCount: 0,
    eventsCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, isAuthenticated, isReady } = useAuth()

  const fetchDashboardData = async () => {
    if (!user?.id || !isAuthenticated) {
      setStats({
        clubsCount: 0,
        discussionsCount: 0,
        eventsCount: 0,
      })
      setIsLoading(false)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const dashboardStats = await dashboardService.getDashboardStats(user.id)
      setStats(dashboardStats)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      // Keep previous stats on error, don't reset to zero
    } finally {
      setIsLoading(false)
    }
  }

  // Initial data fetch when user changes or authentication status changes
  useEffect(() => {
    if (isReady) {
      fetchDashboardData()
    }
  }, [user?.id, isAuthenticated, isReady])

  // Refetch function for manual refresh
  const refetch = async () => {
    await fetchDashboardData()
  }

  return {
    stats,
    isLoading: isLoading || !isReady,
    error,
    refetch,
  }
}

// Hook for individual stat formatting
export function useFormattedStats(stats: DashboardStats, isLoading: boolean) {
  return [
    {
      icon: 'Users',
      value: isLoading ? 'Loading...' : stats.clubsCount.toString(),
      label: 'Active Clubs',
      color: 'text-[#1E3A8A]'
    },
    {
      icon: 'MessageSquare',
      value: isLoading ? 'Loading...' : stats.discussionsCount.toString(),
      label: 'Discussions',
      color: 'text-[#1E3A8A]'
    },
    {
      icon: 'Calendar',
      value: isLoading ? 'Loading...' : stats.eventsCount.toString(),
      label: 'Events',
      color: 'text-[#1E3A8A]'
    }
  ]
}
