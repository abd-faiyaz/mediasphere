"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  RefreshCw, 
  TrendingUp, 
  Flame, 
  Clock, 
  User,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useFeed, FeedType } from '@/hooks/use-feed'
import { FeedCard } from './feed-card'
import { useAuth } from '@clerk/nextjs'
import { feedService } from '@/lib/feed-service'

interface InfiniteScrollFeedProps {
  defaultFeedType?: FeedType
  showTabs?: boolean
  className?: string
}

export function InfiniteScrollFeed({ 
  defaultFeedType = 'personalized', 
  showTabs = true,
  className = '' 
}: InfiniteScrollFeedProps) {
  const { isSignedIn } = useAuth()
  const [activeFeedType, setActiveFeedType] = useState<FeedType>(
    isSignedIn ? defaultFeedType : 'trending'
  )

  const {
    threads,
    loading,
    error,
    hasMore,
    totalElements,
    initialLoad,
    loadMore,
    refresh,
    updateThread,
    infiniteScrollRef,
    isEmpty
  } = useFeed({
    feedType: activeFeedType,
    autoLoad: true,
    pageSize: 10
  })

  const handleRefresh = () => {
    refresh()
  }

  const handleFeedTypeChange = (newFeedType: FeedType) => {
    setActiveFeedType(newFeedType)
  }

  const handleLike = async (threadId: string, reactionResult: { isLiked: boolean; isDisliked: boolean; likeCount: number; dislikeCount: number }) => {
    // Update the thread in the local state
    updateThread(threadId, { 
      likeCount: reactionResult.likeCount, 
      dislikeCount: reactionResult.dislikeCount 
    })
  }

  const handleDislike = async (threadId: string, reactionResult: { isLiked: boolean; isDisliked: boolean; likeCount: number; dislikeCount: number }) => {
    // Update the thread in the local state
    updateThread(threadId, { 
      likeCount: reactionResult.likeCount, 
      dislikeCount: reactionResult.dislikeCount 
    })
  }

  const handleView = async (threadId: string) => {
    // Update view count in local state
    const currentThread = threads.find(t => t.id === threadId)
    if (currentThread) {
      updateThread(threadId, { viewCount: currentThread.viewCount + 1 })
    }
    
    // Track view on backend
    try {
      await feedService.trackView(threadId)
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  const renderFeedTabs = () => {
    if (!showTabs) return null

    return (
      <Tabs value={activeFeedType} onValueChange={(value) => handleFeedTypeChange(value as FeedType)}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            {isSignedIn && (
              <TabsTrigger value="personalized" className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">For You</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="trending" className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="hot" className="flex items-center space-x-1">
              <Flame className="h-4 w-4" />
              <span className="hidden sm:inline">Hot</span>
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">New</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            {totalElements > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalElements} posts
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </Tabs>
    )
  }

  const renderLoadingState = () => {
    if (!initialLoad && !loading) return null

    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderErrorState = () => {
    if (!error) return null

    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Try Again
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  const renderEmptyState = () => {
    if (!isEmpty) return null

    const emptyMessages = {
      personalized: "No posts from your joined clubs yet. Try exploring trending posts or join more clubs!",
      trending: "No trending posts at the moment. Check back later!",
      hot: "No hot discussions right now. Be the first to start one!",
      new: "No new posts yet. Create the first one!"
    }

    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="mb-4">
            {activeFeedType === 'personalized' && <User className="h-12 w-12 mx-auto text-gray-300" />}
            {activeFeedType === 'trending' && <TrendingUp className="h-12 w-12 mx-auto text-gray-300" />}
            {activeFeedType === 'hot' && <Flame className="h-12 w-12 mx-auto text-gray-300" />}
            {activeFeedType === 'new' && <Clock className="h-12 w-12 mx-auto text-gray-300" />}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500 mb-4">{emptyMessages[activeFeedType]}</p>
          <Button onClick={handleRefresh}>Refresh Feed</Button>
        </CardContent>
      </Card>
    )
  }

  const renderLoadMoreButton = () => {
    if (!hasMore) return null

    return (
      <div className="flex justify-center mt-6">
        <Button 
          variant="outline" 
          onClick={loadMore}
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{loading ? 'Loading...' : 'Load More'}</span>
        </Button>
      </div>
    )
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {renderFeedTabs()}
      {renderErrorState()}
      
      <div className="space-y-4">
        {renderLoadingState()}
        {renderEmptyState()}
        
        {threads.map((thread) => (
          <FeedCard
            key={thread.id}
            thread={thread}
            onLike={handleLike}
            onDislike={handleDislike}
            onView={handleView}
          />
        ))}
      </div>

      {/* Infinite scroll trigger */}
      {hasMore && !loading && threads.length > 0 && (
        <div ref={infiniteScrollRef} className="h-20 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading more posts...</div>
        </div>
      )}

      {renderLoadMoreButton()}
    </div>
  )
}

export default InfiniteScrollFeed
