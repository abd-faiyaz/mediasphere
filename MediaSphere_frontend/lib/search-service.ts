import { authService } from './auth-service'
import { 
  SearchResponse, 
  SearchHistoryItem, 
  ClubSearchResult, 
  ThreadSearchResult, 
  EventSearchResult, 
  MediaSearchResult,
  SearchResult
} from './search-types'

class SearchService {
  private baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private abortController: AbortController | null = null

  // Cache management
  private getCacheKey(query: string, type?: string): string {
    return `search_${type || 'all'}_${query.toLowerCase().trim()}`
  }

  private getCachedResult(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    if (cached) {
      this.cache.delete(key) // Remove expired cache
    }
    return null
  }

  private setCachedResult(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  // Cancel ongoing requests
  private cancelPreviousRequest(): void {
    if (this.abortController) {
      this.abortController.abort()
    }
    this.abortController = new AbortController()
  }

  // Enhanced error handling
  private handleSearchError(error: any, query: string): Error {
    if (error.name === 'AbortError') {
      return new Error('Search cancelled')
    }
    
    if (error.message?.includes('fetch')) {
      return new Error('Network error - please check your connection')
    }
    
    if (error.message?.includes('400')) {
      return new Error('Invalid search query')
    }
    
    if (error.message?.includes('401')) {
      return new Error('Authentication required for this search')
    }
    
    if (error.message?.includes('403')) {
      return new Error('You do not have permission to perform this search')
    }
    
    if (error.message?.includes('429')) {
      return new Error('Too many search requests - please wait a moment')
    }
    
    if (error.message?.includes('500')) {
      return new Error('Server error - please try again later')
    }

    console.error('Search error for query:', query, error)
    return new Error(error.message || 'Search failed - please try again')
  }

  // Calculate relevancy score for search results
  private calculateRelevanceScore(result: any, query: string, type: string): number {
    let score = 0
    const normalizedQuery = query.toLowerCase()
    const title = (result.title || result.name || '').toLowerCase()
    const description = (result.description || result.content || '').toLowerCase()

    // Exact matches get highest scores
    if (title === normalizedQuery) score += 10
    else if (title.includes(normalizedQuery)) score += 7
    
    if (description.includes(normalizedQuery)) score += 3

    // Type-specific scoring
    switch (type) {
      case 'clubs':
        if (result.isMember) score += 5
        if (result.memberCount) score += Math.min(result.memberCount / 100, 3)
        break
      case 'threads':
        if (result.viewCount) score += Math.min(result.viewCount / 50, 3)
        if (result.commentCount) score += Math.min(result.commentCount / 10, 2)
        if (result.isPinned) score += 2
        // Recency bonus
        const daysOld = Math.floor((Date.now() - new Date(result.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        if (daysOld < 7) score += 3
        else if (daysOld < 30) score += 1
        break
      case 'events':
        const eventDate = new Date(result.eventDate)
        const now = new Date()
        if (eventDate > now) score += 5 // Upcoming events are more relevant
        if (result.currentParticipants) score += Math.min(result.currentParticipants / 10, 2)
        break
      case 'media':
        // Recent releases get slight bonus
        if (result.releaseYear && result.releaseYear > 2020) score += 2
        break
    }

    return Math.round(score * 10) / 10 // Round to 1 decimal place
  }

  // Transform and score search results
  private transformSearchResults(data: any, query: string): SearchResponse {
    const clubs: ClubSearchResult[] = (data.clubs || []).map((club: any) => ({
      ...club,
      type: 'club' as const,
      title: club.name,
      relevanceScore: this.calculateRelevanceScore(club, query, 'clubs')
    })).sort((a: ClubSearchResult, b: ClubSearchResult) => b.relevanceScore - a.relevanceScore)

    const threads: ThreadSearchResult[] = (data.threads || []).map((thread: any) => ({
      ...thread,
      type: 'thread' as const,
      relevanceScore: this.calculateRelevanceScore(thread, query, 'threads')
    })).sort((a: ThreadSearchResult, b: ThreadSearchResult) => b.relevanceScore - a.relevanceScore)

    const events: EventSearchResult[] = (data.events || []).map((event: any) => ({
      ...event,
      type: 'event' as const,
      relevanceScore: this.calculateRelevanceScore(event, query, 'events')
    })).sort((a: EventSearchResult, b: EventSearchResult) => b.relevanceScore - a.relevanceScore)

    const media: MediaSearchResult[] = (data.media || []).map((mediaItem: any) => ({
      ...mediaItem,
      type: 'media' as const,
      relevanceScore: this.calculateRelevanceScore(mediaItem, query, 'media')
    })).sort((a: MediaSearchResult, b: MediaSearchResult) => b.relevanceScore - a.relevanceScore)

    return {
      clubs,
      threads,
      events,
      media,
      totalResults: clubs.length + threads.length + events.length + media.length
    }
  }

  // Search across all content types
  async searchAll(query: string, useCache: boolean = true): Promise<SearchResponse> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty')
    }

    const cacheKey = this.getCacheKey(query)
    
    // Check cache first
    if (useCache) {
      const cachedResult = this.getCachedResult(cacheKey)
      if (cachedResult) {
        return this.transformSearchResults(cachedResult, query)
      }
    }

    // Cancel previous request
    this.cancelPreviousRequest()

    try {
      const token = authService.getToken()
      const response = await fetch(`${this.baseUrl}/search/?q=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        signal: this.abortController?.signal
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache the raw result
      if (useCache) {
        this.setCachedResult(cacheKey, data)
      }
      
      return this.transformSearchResults(data, query)
    } catch (error: any) {
      throw this.handleSearchError(error, query)
    }
  }

  // Search specific content type
  async searchByType(query: string, type: 'clubs' | 'threads' | 'events' | 'media', useCache: boolean = true): Promise<SearchResult[]> {
    if (!query.trim()) {
      throw new Error('Search query cannot be empty')
    }

    const cacheKey = this.getCacheKey(query, type)
    
    // Check cache first
    if (useCache) {
      const cachedResult = this.getCachedResult(cacheKey)
      if (cachedResult) {
        return (cachedResult || []).map((item: any) => ({
          ...item,
          type,
          title: item.title || item.name,
          relevanceScore: this.calculateRelevanceScore(item, query, type)
        })).sort((a: SearchResult, b: SearchResult) => b.relevanceScore - a.relevanceScore)
      }
    }

    // Cancel previous request
    this.cancelPreviousRequest()

    try {
      const token = authService.getToken()
      const response = await fetch(`${this.baseUrl}/search/${type}?q=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        signal: this.abortController?.signal
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`)
      }

      const data = await response.json()
      
      // Cache the raw result
      if (useCache) {
        this.setCachedResult(cacheKey, data)
      }
      
      return (data || []).map((item: any) => ({
        ...item,
        type,
        title: item.title || item.name,
        relevanceScore: this.calculateRelevanceScore(item, query, type)
      })).sort((a: SearchResult, b: SearchResult) => b.relevanceScore - a.relevanceScore)
    } catch (error: any) {
      throw this.handleSearchError(error, query)
    }
  }

  // Get search history from localStorage
  getSearchHistory(): SearchHistoryItem[] {
    try {
      const history = localStorage.getItem('mediasphere_search_history')
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.error('Error loading search history:', error)
      return []
    }
  }

  // Add search to history
  addToSearchHistory(query: string, resultCount: number): void {
    try {
      const history = this.getSearchHistory()
      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: query.trim(),
        timestamp: new Date().toISOString(),
        resultCount
      }

      // Remove duplicate queries and add new one at the beginning
      const filteredHistory = history.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      )
      
      const updatedHistory = [newItem, ...filteredHistory].slice(0, 10) // Keep only last 10
      localStorage.setItem('mediasphere_search_history', JSON.stringify(updatedHistory))
    } catch (error) {
      console.error('Error saving search history:', error)
    }
  }

  // Clear search history
  clearSearchHistory(): void {
    try {
      localStorage.removeItem('mediasphere_search_history')
    } catch (error) {
      console.error('Error clearing search history:', error)
    }
  }

  // Remove specific item from search history
  removeFromSearchHistory(id: string): void {
    try {
      const history = this.getSearchHistory()
      const filteredHistory = history.filter(item => item.id !== id)
      localStorage.setItem('mediasphere_search_history', JSON.stringify(filteredHistory))
    } catch (error) {
      console.error('Error removing from search history:', error)
    }
  }

  // Clear search cache
  clearCache(): void {
    this.cache.clear()
  }

  // Get cache stats for debugging
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Cancel any ongoing requests
  cancelRequests(): void {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

export const searchService = new SearchService()
