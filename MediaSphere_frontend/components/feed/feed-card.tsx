"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  ExternalLink,
  Share2
} from 'lucide-react'
import { FeedThread, feedService } from '@/lib/feed-service'
import Link from 'next/link'

interface FeedCardProps {
  thread: FeedThread
  onLike?: (threadId: string, newState: any) => void
  onDislike?: (threadId: string, newState: any) => void
  onView?: (threadId: string) => void
  className?: string
}

export function FeedCard({ 
  thread, 
  onLike, 
  onDislike, 
  onView,
  className = '' 
}: FeedCardProps) {
  const [isLiked, setIsLiked] = useState(thread.isLiked || false)
  const [isDisliked, setIsDisliked] = useState(thread.isDisliked || false)
  const [likeCount, setLikeCount] = useState(thread.likeCount || 0)
  const [dislikeCount, setDislikeCount] = useState(thread.dislikeCount || 0)
  const [hasBeenViewed, setHasBeenViewed] = useState(false)

  // Initialize reaction state from user's previous reactions
  useEffect(() => {
    const loadUserReaction = async () => {
      try {
        const userReaction = await feedService.getThreadReaction(thread.id)
        if (userReaction) {
          setIsLiked(userReaction.type === 'LIKE')
          setIsDisliked(userReaction.type === 'DISLIKE')
        }
      } catch (error) {
        // User not authenticated or no reaction - keep defaults
        console.log('No user reaction found:', error)
      }
    }
    
    loadUserReaction()
  }, [thread.id])

  // Track view when card becomes visible
  useEffect(() => {
    const cardRef = document.getElementById(`thread-card-${thread.id}`)
    if (!cardRef || hasBeenViewed) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5 && !hasBeenViewed) {
          // Thread is at least 50% visible, track the view
          setHasBeenViewed(true)
          onView?.(thread.id)
        }
      },
      {
        threshold: 0.5, // Trigger when 50% of the card is visible
        rootMargin: '0px'
      }
    )

    observer.observe(cardRef)

    return () => {
      observer.unobserve(cardRef)
    }
  }, [thread.id, onView, hasBeenViewed])

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const result = await feedService.likeThread(thread.id)
      setIsLiked(result.isLiked)
      setIsDisliked(result.isDisliked)
      setLikeCount(result.likeCount)
      setDislikeCount(result.dislikeCount)
      
      onLike?.(thread.id, result)
    } catch (error) {
      console.error('Failed to like thread:', error)
      // Revert optimistic update on error
      if (isLiked) {
        setIsLiked(false)
        setLikeCount(prev => prev - 1)
      } else {
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
        if (isDisliked) {
          setIsDisliked(false)
          setDislikeCount(prev => prev - 1)
        }
      }
    }
  }

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const result = await feedService.dislikeThread(thread.id)
      setIsLiked(result.isLiked)
      setIsDisliked(result.isDisliked)
      setLikeCount(result.likeCount)
      setDislikeCount(result.dislikeCount)
      
      onDislike?.(thread.id, result)
    } catch (error) {
      console.error('Failed to dislike thread:', error)
      // Revert optimistic update on error
      if (isDisliked) {
        setIsDisliked(false)
        setDislikeCount(prev => prev - 1)
      } else {
        setIsDisliked(true)
        setDislikeCount(prev => prev + 1)
        if (isLiked) {
          setIsLiked(false)
          setLikeCount(prev => prev - 1)
        }
      }
    }
  }

  const handleView = () => {
    onView?.(thread.id)
  }

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  return (
    <Card 
      id={`thread-card-${thread.id}`}
      className={`mb-4 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={thread.author?.profilePic} />
              <AvatarFallback>
                {thread.author?.username?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  {thread.author?.username || 'Unknown User'}
                </span>
                {thread.club && (
                  <>
                    <span className="text-gray-400">•</span>
                    <Badge variant="secondary" className="text-xs">
                      {thread.club.name}
                    </Badge>
                  </>
                )}
              </div>
              <span className="text-xs text-gray-500">{thread.timeAgo}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {thread.trendingScore && thread.trendingScore > 0 && (
              <Badge variant="outline" className="text-xs">
                🔥 {thread.trendingScore.toFixed(1)}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // Add share functionality
              }}
            >
              <Share2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <Link 
          href={`/threads/${thread.id}`}
          className="block"
          onClick={handleView}
        >
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
            {thread.title}
          </h3>
          
          {thread.content && (
            <p className="text-gray-700 mb-4 leading-relaxed">
              {truncateContent(thread.content)}
            </p>
          )}

          {thread.mediaUrl && (
            <div className="mb-4">
              <img 
                src={thread.mediaUrl} 
                alt="Thread media"
                className="rounded-lg max-h-64 w-full object-cover"
              />
            </div>
          )}
        </Link>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 h-8 px-2 ${
                isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600'
              }`}
              onClick={handleLike}
            >
              <ThumbsUp className="h-4 w-4" />
              <span className="text-xs font-medium">{likeCount}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center space-x-1 h-8 px-2 ${
                isDisliked ? 'text-red-600 bg-red-50' : 'text-gray-600'
              }`}
              onClick={handleDislike}
            >
              <ThumbsDown className="h-4 w-4" />
              <span className="text-xs font-medium">{dislikeCount}</span>
            </Button>

            <Link href={`/threads/${thread.id}`}>
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 h-8 px-2 text-gray-600">
                <MessageCircle className="h-4 w-4" />
                <span className="text-xs font-medium">{thread.commentCount || 0}</span>
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-2 text-gray-500">
            <Eye className="h-3 w-3" />
            <span className="text-xs">{thread.viewCount || 0} views</span>
            <Link href={`/threads/${thread.id}`}>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-400">
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default FeedCard
