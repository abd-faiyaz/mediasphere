"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { feedService, FeedThread, FeedResponse, FeedOptions } from '@/lib/feed-service'
import { useAuth } from '@clerk/nextjs'

export type FeedType = 'personalized' | 'trending' | 'hot' | 'new'

interface UseFeedOptions extends FeedOptions {
  feedType?: FeedType
  autoLoad?: boolean
  pageSize?: number
}

interface FeedState {
  threads: FeedThread[]
  loading: boolean
  error: string | null
  hasMore: boolean
  page: number
  totalElements: number
  totalPages: number
  initialLoad: boolean
}

export function useFeed(options: UseFeedOptions = {}) {
  const { 
    feedType = 'personalized', 
    autoLoad = true, 
    pageSize = 10,
    userId 
  } = options

  const { userId: clerkUserId, isSignedIn } = useAuth()
  const [state, setState] = useState<FeedState>({
    threads: [],
    loading: false,
    error: null,
    hasMore: true,
    page: 0,
    totalElements: 0,
    totalPages: 0,
    initialLoad: true
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  const getFeedFunction = useCallback(() => {
    const actualUserId = userId || (isSignedIn ? clerkUserId : undefined)
    
    switch (feedType) {
      case 'trending':
        return (opts: FeedOptions) => feedService.getTrendingFeed(opts)
      case 'hot':
        return (opts: FeedOptions) => feedService.getHotFeed(opts)
      case 'new':
        return (opts: FeedOptions) => feedService.getNewFeed(opts)
      case 'personalized':
      default:
        return (opts: FeedOptions) => feedService.getPersonalizedFeed({ ...opts, userId: actualUserId })
    }
  }, [feedType, userId, clerkUserId, isSignedIn])

  const loadPage = useCallback(async (pageNum: number, append = false) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }))

    try {
      const feedFunction = getFeedFunction()
      const response: FeedResponse = await feedFunction({
        page: pageNum,
        size: pageSize
      })

      // Process threads to add computed fields
      const processedThreads = feedService.processFeedThreads(response.content)

      setState(prev => ({
        ...prev,
        threads: append ? [...prev.threads, ...processedThreads] : processedThreads,
        loading: false,
        hasMore: !response.last,
        page: response.number,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        initialLoad: false
      }))

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to load feed',
          initialLoad: false
        }))
      }
    }
  }, [getFeedFunction, pageSize])

  const loadInitial = useCallback(() => {
    loadPage(0, false)
  }, [loadPage])

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      loadPage(state.page + 1, true)
    }
  }, [state.hasMore, state.loading, state.page, loadPage])

  const refresh = useCallback(() => {
    setState(prev => ({ ...prev, initialLoad: true }))
    loadPage(0, false)
  }, [loadPage])

  // Auto-load on mount and when dependencies change
  useEffect(() => {
    if (autoLoad) {
      loadInitial()
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [autoLoad, loadInitial])

  // Infinite scroll detector
  const infiniteScrollRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || state.loading || !state.hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [state.loading, state.hasMore, loadMore])

  const updateThread = useCallback((threadId: string, updates: Partial<FeedThread>) => {
    setState(prev => ({
      ...prev,
      threads: prev.threads.map(thread => 
        thread.id === threadId 
          ? { ...thread, ...updates }
          : thread
      )
    }))
  }, [])

  return {
    // State
    threads: state.threads,
    loading: state.loading,
    error: state.error,
    hasMore: state.hasMore,
    page: state.page,
    totalElements: state.totalElements,
    totalPages: state.totalPages,
    initialLoad: state.initialLoad,

    // Actions
    loadMore,
    refresh,
    loadInitial,
    updateThread,

    // Helpers
    infiniteScrollRef,
    
    // Computed
    isEmpty: state.threads.length === 0 && !state.loading && !state.initialLoad,
    isFirstPage: state.page === 0
  }
}

export default useFeed
