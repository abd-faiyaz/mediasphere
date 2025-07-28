// Search result types and interfaces
export interface SearchResult {
  id: string
  type: 'club' | 'thread' | 'event' | 'media'
  title: string
  description?: string
  relevanceScore: number
  imageUrl?: string
  createdAt: string
  updatedAt?: string
}

export interface ClubSearchResult extends SearchResult {
  type: 'club'
  mediaType: {
    id: string
    name: string
    description: string
  }
  createdBy: {
    id: string
    email: string
    username: string
    firstName: string
    lastName: string
  }
  memberCount?: number
  isMember?: boolean
}

export interface ThreadSearchResult extends SearchResult {
  type: 'thread'
  content?: string
  club: {
    id: string
    name: string
  }
  author: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  viewCount: number
  commentCount: number
  likeCount: number
  isPinned: boolean
  isLocked: boolean
}

export interface EventSearchResult extends SearchResult {
  type: 'event'
  club: {
    id: string
    name: string
  }
  createdBy: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  eventDate: string
  location?: string
  maxParticipants?: number
  currentParticipants: number
}

export interface MediaSearchResult extends SearchResult {
  type: 'media'
  mediaType: {
    id: string
    name: string
    description: string
  }
  author?: string
  releaseYear?: number
  genre?: string
}

export interface SearchResponse {
  clubs: ClubSearchResult[]
  threads: ThreadSearchResult[]
  events: EventSearchResult[]
  media: MediaSearchResult[]
  totalResults: number
}

export interface SearchHistoryItem {
  id: string
  query: string
  timestamp: string
  resultCount: number
}

export interface SearchFilters {
  type: 'all' | 'clubs' | 'threads' | 'events' | 'media'
  sortBy: 'relevance' | 'recent' | 'popular'
  timeRange?: 'day' | 'week' | 'month' | 'year'
}

export type SearchSuggestion = {
  id: string
  text: string
  type: 'query' | 'club' | 'thread' | 'event' | 'media'
  count?: number
}
