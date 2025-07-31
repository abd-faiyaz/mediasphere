import { useState, useEffect, useCallback, useRef } from 'react'
import { searchService } from '@/lib/search-service'
import { SearchResponse, SearchResult, SearchHistoryItem } from '@/lib/search-types'

interface UseSearchOptions {
  debounceMs?: number
  minQueryLength?: number
  maxDropdownResults?: number
}

interface UseSearchReturn {
  // Search state
  query: string
  setQuery: (query: string) => void
  results: SearchResponse | null
  isLoading: boolean
  error: string | null
  
  // Dropdown state
  isDropdownOpen: boolean
  setIsDropdownOpen: (open: boolean) => void
  dropdownResults: {
    clubs: SearchResult[]
    threads: SearchResult[]
    events: SearchResult[]
    media: SearchResult[]
  }
  
  // Search history
  searchHistory: SearchHistoryItem[]
  clearHistory: () => void
  removeFromHistory: (id: string) => void
  
  // Actions
  performSearch: (searchQuery?: string) => Promise<void>
  clearSearch: () => void
  handleSearchSubmit: (searchQuery?: string) => void
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxDropdownResults = 3
  } = options

  // Local search state
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownResults, setDropdownResults] = useState<{
    clubs: SearchResult[]
    threads: SearchResult[]
    events: SearchResult[]
    media: SearchResult[]
  }>({
    clubs: [],
    threads: [],
    events: [],
    media: []
  })
  
  // Search history
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([])
  
  // Refs for cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load search history on mount
  useEffect(() => {
    setSearchHistory(searchService.getSearchHistory())
  }, [])

  // Debounced search function for dropdown
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setDropdownResults({ clubs: [], threads: [], events: [], media: [] })
        setIsDropdownOpen(false)
        return
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController()

      try {
        // Use searchAll and extract limited results for dropdown
        const searchResults = await searchService.searchAll(searchQuery)

        setDropdownResults({
          clubs: searchResults.clubs.slice(0, maxDropdownResults),
          threads: searchResults.threads.slice(0, maxDropdownResults),
          events: searchResults.events.slice(0, maxDropdownResults),
          media: searchResults.media.slice(0, maxDropdownResults)
        })

        if (
          searchResults.clubs.length > 0 ||
          searchResults.threads.length > 0 ||
          searchResults.events.length > 0 ||
          searchResults.media.length > 0
        ) {
          setIsDropdownOpen(true)
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Dropdown search error:', err)
          setDropdownResults({ clubs: [], threads: [], events: [], media: [] })
        }
      }
    },
    [minQueryLength, maxDropdownResults]
  )

  // Handle query changes with debouncing
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (query.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        debouncedSearch(query.trim())
      }, debounceMs)
    } else {
      setDropdownResults({ clubs: [], threads: [], events: [], media: [] })
      setIsDropdownOpen(false)
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query, debouncedSearch, debounceMs])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // Perform full search (for search results page)
  const performSearch = useCallback(async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query
    if (!queryToSearch.trim()) return

    try {
      setIsLoading(true)
      setError(null)
      setIsDropdownOpen(false)

      const searchResults = await searchService.searchAll(queryToSearch.trim())
      setResults(searchResults)
      
      // Add to search history
      searchService.addToSearchHistory(queryToSearch.trim(), searchResults.totalResults)
      setSearchHistory(searchService.getSearchHistory())
      
    } catch (err: any) {
      console.error('Search error:', err)
      setError(err.message || 'Search failed')
    } finally {
      setIsLoading(false)
    }
  }, [query])

  // Handle search submit (Enter key or search button click)
  const handleSearchSubmit = useCallback((searchQuery?: string) => {
    const queryToSearch = searchQuery || query
    if (!queryToSearch.trim()) return

    // Store query in URL for persistence
    const url = new URL(window.location.href)
    url.pathname = '/search'
    url.searchParams.set('q', queryToSearch.trim())
    
    // Navigate to search results page
    window.location.href = url.toString()
  }, [query])

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery('')
    setResults(null)
    setError(null)
    setIsDropdownOpen(false)
    setDropdownResults({ clubs: [], threads: [], events: [], media: [] })
  }, [])

  // Clear search history
  const clearHistory = useCallback(() => {
    searchService.clearSearchHistory()
    setSearchHistory([])
  }, [])

  // Remove item from search history
  const removeFromHistory = useCallback((id: string) => {
    searchService.removeFromSearchHistory(id)
    setSearchHistory(searchService.getSearchHistory())
  }, [])

  return {
    // Search state
    query,
    setQuery,
    results,
    isLoading,
    error,
    
    // Dropdown state
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownResults,
    
    // Search history
    searchHistory,
    clearHistory,
    removeFromHistory,
    
    // Actions
    performSearch,
    clearSearch,
    handleSearchSubmit
  }
}
