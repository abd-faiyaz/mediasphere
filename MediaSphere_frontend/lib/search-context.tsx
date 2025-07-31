"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { SearchResponse, SearchResult, SearchHistoryItem, SearchFilters } from './search-types'
import { searchService } from './search-service'

// Search Context State
interface SearchState {
  // Current search
  currentQuery: string
  currentResults: SearchResponse | null
  isLoading: boolean
  error: string | null
  
  // Filters and sorting
  filters: SearchFilters
  
  // Search history
  searchHistory: SearchHistoryItem[]
  
  // UI state
  isSearchPageOpen: boolean
  selectedResultType: 'all' | 'clubs' | 'threads' | 'events' | 'media'
  
  // Persistence
  lastSearchTimestamp: string | null
  searchSessionId: string | null
}

// Search Actions
type SearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_RESULTS'; payload: SearchResponse }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SET_SEARCH_HISTORY'; payload: SearchHistoryItem[] }
  | { type: 'ADD_TO_HISTORY'; payload: SearchHistoryItem }
  | { type: 'REMOVE_FROM_HISTORY'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_SEARCH_PAGE_OPEN'; payload: boolean }
  | { type: 'SET_SELECTED_RESULT_TYPE'; payload: 'all' | 'clubs' | 'threads' | 'events' | 'media' }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'RESTORE_FROM_URL'; payload: { query: string; filters?: Partial<SearchFilters> } }
  | { type: 'UPDATE_SESSION'; payload: { timestamp: string; sessionId: string } }

// Initial state
const initialState: SearchState = {
  currentQuery: '',
  currentResults: null,
  isLoading: false,
  error: null,
  filters: {
    type: 'all',
    sortBy: 'relevance'
  },
  searchHistory: [],
  isSearchPageOpen: false,
  selectedResultType: 'all',
  lastSearchTimestamp: null,
  searchSessionId: null
}

// Search reducer
function searchReducer(state: SearchState, action: SearchAction): SearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return {
        ...state,
        currentQuery: action.payload,
        error: null
      }
    
    case 'SET_RESULTS':
      return {
        ...state,
        currentResults: action.payload,
        isLoading: false,
        error: null
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      }
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        }
      }
    
    case 'SET_SEARCH_HISTORY':
      return {
        ...state,
        searchHistory: action.payload
      }
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        searchHistory: [action.payload, ...state.searchHistory.filter(
          item => item.query.toLowerCase() !== action.payload.query.toLowerCase()
        )].slice(0, 10)
      }
    
    case 'REMOVE_FROM_HISTORY':
      return {
        ...state,
        searchHistory: state.searchHistory.filter(item => item.id !== action.payload)
      }
    
    case 'CLEAR_HISTORY':
      return {
        ...state,
        searchHistory: []
      }
    
    case 'SET_SEARCH_PAGE_OPEN':
      return {
        ...state,
        isSearchPageOpen: action.payload
      }
    
    case 'SET_SELECTED_RESULT_TYPE':
      return {
        ...state,
        selectedResultType: action.payload
      }
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        currentQuery: '',
        currentResults: null,
        error: null,
        isLoading: false
      }
    
    case 'RESTORE_FROM_URL':
      return {
        ...state,
        currentQuery: action.payload.query,
        filters: {
          ...state.filters,
          ...action.payload.filters
        }
      }
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        lastSearchTimestamp: action.payload.timestamp,
        searchSessionId: action.payload.sessionId
      }
    
    default:
      return state
  }
}

// Search Context
interface SearchContextType {
  state: SearchState
  dispatch: React.Dispatch<SearchAction>
  actions: {
    performSearch: (query: string, options?: { saveToHistory?: boolean }) => Promise<void>
    performFilteredSearch: (filters: Partial<SearchFilters>) => Promise<void>
    setQuery: (query: string) => void
    setFilters: (filters: Partial<SearchFilters>) => void
    addToHistory: (query: string, resultCount: number) => void
    removeFromHistory: (id: string) => void
    clearHistory: () => void
    clearSearch: () => void
    restoreFromURL: (searchParams: URLSearchParams) => void
    updateURL: (query: string, filters?: Partial<SearchFilters>) => void
    navigateToSearchPage: (query: string, filters?: Partial<SearchFilters>) => void
  }
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

// Search Provider Component
interface SearchProviderProps {
  children: ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [state, dispatch] = useReducer(searchReducer, initialState)

  // Load search history on mount
  useEffect(() => {
    const history = searchService.getSearchHistory()
    dispatch({ type: 'SET_SEARCH_HISTORY', payload: history })
  }, [])

  // Generate session ID on mount
  useEffect(() => {
    const sessionId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    dispatch({ 
      type: 'UPDATE_SESSION', 
      payload: { 
        timestamp: new Date().toISOString(), 
        sessionId 
      } 
    })
  }, [])

  // Persist search state to sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchState = {
        query: state.currentQuery,
        filters: state.filters,
        timestamp: state.lastSearchTimestamp,
        sessionId: state.searchSessionId
      }
      sessionStorage.setItem('mediasphere_search_state', JSON.stringify(searchState))
    }
  }, [state.currentQuery, state.filters, state.lastSearchTimestamp, state.searchSessionId])

  // Restore search state from sessionStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedState = sessionStorage.getItem('mediasphere_search_state')
        if (savedState) {
          const parsed = JSON.parse(savedState)
          if (parsed.query || parsed.filters) {
            dispatch({ 
              type: 'RESTORE_FROM_URL', 
              payload: { 
                query: parsed.query || '', 
                filters: parsed.filters || {} 
              } 
            })
          }
        }
      } catch (error) {
        console.error('Error restoring search state:', error)
      }
    }
  }, [])

  // Action implementations
  const performSearch = async (query: string, options: { saveToHistory?: boolean } = {}) => {
    const { saveToHistory = true } = options
    
    if (!query.trim()) {
      dispatch({ type: 'CLEAR_SEARCH' })
      return
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_QUERY', payload: query.trim() })
      dispatch({ type: 'SET_ERROR', payload: null })

      const results = await searchService.searchAll(query.trim())
      dispatch({ type: 'SET_RESULTS', payload: results })

      // Add to history if requested
      if (saveToHistory) {
        const historyItem: SearchHistoryItem = {
          id: Date.now().toString(),
          query: query.trim(),
          timestamp: new Date().toISOString(),
          resultCount: results.totalResults
        }
        
        searchService.addToSearchHistory(query.trim(), results.totalResults)
        dispatch({ type: 'ADD_TO_HISTORY', payload: historyItem })
      }

      // Update session timestamp
      dispatch({ 
        type: 'UPDATE_SESSION', 
        payload: { 
          timestamp: new Date().toISOString(), 
          sessionId: state.searchSessionId || `search_${Date.now()}` 
        } 
      })

    } catch (error: any) {
      console.error('Search error:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Search failed' })
    }
  }

  const performFilteredSearch = async (filters: Partial<SearchFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
    
    if (state.currentQuery) {
      await performSearch(state.currentQuery, { saveToHistory: false })
    }
  }

  const setQuery = (query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query })
  }

  const setFilters = (filters: Partial<SearchFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters })
  }

  const addToHistory = (query: string, resultCount: number) => {
    const historyItem: SearchHistoryItem = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date().toISOString(),
      resultCount
    }
    
    searchService.addToSearchHistory(query.trim(), resultCount)
    dispatch({ type: 'ADD_TO_HISTORY', payload: historyItem })
  }

  const removeFromHistory = (id: string) => {
    searchService.removeFromSearchHistory(id)
    dispatch({ type: 'REMOVE_FROM_HISTORY', payload: id })
  }

  const clearHistory = () => {
    searchService.clearSearchHistory()
    dispatch({ type: 'CLEAR_HISTORY' })
  }

  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' })
  }

  const restoreFromURL = (searchParams: URLSearchParams) => {
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') as SearchFilters['type'] || 'all'
    const sortBy = searchParams.get('sort') as SearchFilters['sortBy'] || 'relevance'
    const timeRange = searchParams.get('time') as SearchFilters['timeRange']

    const filters: Partial<SearchFilters> = {
      type,
      sortBy,
      ...(timeRange && { timeRange })
    }

    dispatch({ type: 'RESTORE_FROM_URL', payload: { query, filters } })
    
    // Perform search if query exists
    if (query.trim()) {
      performSearch(query.trim(), { saveToHistory: false })
    }
  }

  const updateURL = (query: string, filters?: Partial<SearchFilters>) => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.href)
    
    if (query.trim()) {
      url.searchParams.set('q', query.trim())
    } else {
      url.searchParams.delete('q')
    }

    const currentFilters = { ...state.filters, ...filters }
    
    if (currentFilters.type && currentFilters.type !== 'all') {
      url.searchParams.set('type', currentFilters.type)
    } else {
      url.searchParams.delete('type')
    }

    if (currentFilters.sortBy && currentFilters.sortBy !== 'relevance') {
      url.searchParams.set('sort', currentFilters.sortBy)
    } else {
      url.searchParams.delete('sort')
    }

    if (currentFilters.timeRange) {
      url.searchParams.set('time', currentFilters.timeRange)
    } else {
      url.searchParams.delete('time')
    }

    window.history.pushState({}, '', url.toString())
  }

  const navigateToSearchPage = (query: string, filters?: Partial<SearchFilters>) => {
    if (typeof window === 'undefined') return

    const url = new URL(window.location.origin)
    url.pathname = '/search'
    
    if (query.trim()) {
      url.searchParams.set('q', query.trim())
    }

    const searchFilters = { ...state.filters, ...filters }
    
    if (searchFilters.type && searchFilters.type !== 'all') {
      url.searchParams.set('type', searchFilters.type)
    }

    if (searchFilters.sortBy && searchFilters.sortBy !== 'relevance') {
      url.searchParams.set('sort', searchFilters.sortBy)
    }

    if (searchFilters.timeRange) {
      url.searchParams.set('time', searchFilters.timeRange)
    }

    window.location.href = url.toString()
  }

  const contextValue: SearchContextType = {
    state,
    dispatch,
    actions: {
      performSearch,
      performFilteredSearch,
      setQuery,
      setFilters,
      addToHistory,
      removeFromHistory,
      clearHistory,
      clearSearch,
      restoreFromURL,
      updateURL,
      navigateToSearchPage
    }
  }

  return (
    <SearchContext.Provider value={contextValue}>
      {children}
    </SearchContext.Provider>
  )
}

// Custom hook to use search context
export function useSearchContext() {
  const context = useContext(SearchContext)
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider')
  }
  return context
}
