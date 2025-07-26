"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/hooks/use-toast"
import {
  MessageSquare, Share, MoreHorizontal, Pin, ThumbsUp, ThumbsDown, Reply, ArrowLeft,
  Heart, Bookmark, Eye, Star, Sparkles, TrendingUp, Send, Edit3, Trash2, Loader2, Maximize2, ImagePlus
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { use, useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@clerk/nextjs"
import { authService } from "@/lib/auth-service"

interface User {
  id: string
  username: string
  firstName?: string
  lastName?: string
  profilePic?: string
}

interface Thread {
  id: string
  title: string
  content: string
  imageUrl?: string
  images?: { id: string; imageUrl: string; fullImageUrl?: string }[]
  createdBy: User
  club: {
    id: string
    name: string
  }
  createdAt: string
  viewCount: number
  commentCount: number
  likeCount: number
  dislikeCount: number
  isPinned: boolean
  isLocked: boolean
}

interface Comment {
  id: string
  content: string
  createdBy: User
  createdAt: string
  parentComment?: Comment
  likeCount?: number
  replies?: Comment[]
}

export default function ThreadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, isLoading: isAuthLoading, isAuthenticated, isReady } = useAuth()
  const { user: currentUser } = useUser()
  const isSignedIn = !!currentUser
  const [thread, setThread] = useState<Thread | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingThread, setEditingThread] = useState({
    title: "",
    content: "",
    imageUrl: ""
  })
  const [postingComment, setPostingComment] = useState(false)
  const [liking, setLiking] = useState(false)
  const [disliking, setDisliking] = useState(false)
  const [likers, setLikers] = useState<User[]>([])
  const [dislikers, setDislikers] = useState<User[]>([])
  const [showLikers, setShowLikers] = useState(false)
  const [showDislikers, setShowDislikers] = useState(false)
  const [showReplies, setShowReplies] = useState<{ [key: string]: boolean }>({})
  const [likedComments, setLikedComments] = useState<{ [key: string]: boolean }>({})

  // Bookmark/Save functionality
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)

  // Enhanced sharing
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)

  // Comment sorting options
  const [sortBy, setSortBy] = useState('newest') // newest, oldest, most_liked, controversial
  const sortOptions = [
    { value: 'newest', label: 'Newest first', icon: '🕒' },
    { value: 'oldest', label: 'Oldest first', icon: '📅' },
    { value: 'most_liked', label: 'Most liked', icon: '👍' },
    { value: 'controversial', label: 'Controversial', icon: '⚡' }
  ]

  // Thread tags for categorization
  const threadTags = ['Discussion', 'Question', 'Announcement', 'Help', 'Tutorial', 'Bug Report']

  // Better nested reply visualization
  const [collapsedReplies, setCollapsedReplies] = useState<{ [key: string]: boolean }>({})
  const [replyDepth, setReplyDepth] = useState<{ [key: string]: number }>({})
  const maxReplyDepth = 5 // Maximum nesting level

  // Auto-save draft comments
  const [draftComment, setDraftComment] = useState("")
  const [draftReply, setDraftReply] = useState<{ [key: string]: string }>({})
  const draftKey = `thread-${resolvedParams.id}-draft`

  // Comment editing functionality
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  // Follow thread for notifications
  const [isFollowing, setIsFollowing] = useState(false)
  const [following, setFollowing] = useState(false)

  // Rich text editor state
  const [showRichEditor, setShowRichEditor] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [richTextMode, setRichTextMode] = useState(false)

  // @mentions functionality
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionUsers, setMentionUsers] = useState<User[]>([])
  const [mentionPosition, setMentionPosition] = useState({ x: 0, y: 0 })

  // Image uploads
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Infinite scroll for comments
  const [commentsPage, setCommentsPage] = useState(1)
  const [loadingMoreComments, setLoadingMoreComments] = useState(false)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const commentsPerPage = 20

  // Keyboard navigation
  const [selectedCommentIndex, setSelectedCommentIndex] = useState(-1)
  const [keyboardNavigationActive, setKeyboardNavigationActive] = useState(false)
  const commentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Enhanced performance and image optimization
  const [imageLoadingStates, setImageLoadingStates] = useState<{ [key: string]: boolean }>({})
  const [optimizedImages, setOptimizedImages] = useState<{ [key: string]: string }>({})
  const [isMounted, setIsMounted] = useState(false)

  const containerRef = useRef(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Guard clause: Wait for authentication to be completely ready
    if (!isReady) {
      console.log("Authentication is not ready yet, waiting...")
      return
    }

    if (isAuthenticated) {
      fetchThreadAndComments()
      fetchLikeStatus()
    } else {
      setLoading(false)
    }
  }, [resolvedParams.id, isReady])

  const fetchThreadAndComments = async () => {
    setLoading(true)
    setError("")
    try {
      const token = authService.getToken()

      if (!token) {
        setError("Authentication failed. Please try logging in again.")
        setLoading(false)
        return
      }

      // Fetch thread details
      const threadResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (!threadResponse.ok) throw new Error("Thread not found")
      const threadData = await threadResponse.json()
      setThread(threadData)
      setLikeCount(threadData.likeCount || 0)
      setDislikeCount(threadData.dislikeCount || 0)
      setEditingThread({
        title: threadData.title,
        content: threadData.content,
        imageUrl: threadData.imageUrl || ""
      })

      // Fetch comments
      const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/comments`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (commentsResponse.ok) {
        const commentsData = await commentsResponse.json()
        setComments(commentsData)
      }

    } catch (error) {
      console.error("Failed to fetch thread:", error)
      setError("Failed to load thread. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchLikeStatus = async () => {
    if (!isSignedIn) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/like-status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setLiked(data.liked)
        setDisliked(data.disliked)
        setLikeCount(data.likeCount)
        setDislikeCount(data.dislikeCount)
      }
    } catch (error) {
      console.error('Failed to fetch like status:', error)
    }
  }

  const handleLike = async () => {
    if (!isSignedIn || liking) return
    setLiking(true)
    try {
      // Simple increment logic - no toggling
      setLikeCount(prev => prev + 1)
      setLiked(true)

      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setLikeCount(data.likeCount)
      }
    } catch (error) {
      // Revert on error
      setLikeCount(prev => prev - 1)
      setLiked(false)
      toast({ title: "Error", description: "Failed to like thread", variant: "destructive" })
    } finally {
      setLiking(false)
    }
  }

  const handleDislike = async () => {
    if (!isSignedIn || disliking) return
    setDisliking(true)
    try {
      // Simple increment logic - no toggling
      setDislikeCount(prev => prev + 1)
      setDisliked(true)

      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setDislikeCount(data.dislikeCount)
      }
    } catch (error) {
      // Revert on error
      setDislikeCount(prev => prev - 1)
      setDisliked(false)
      toast({ title: "Error", description: "Failed to dislike thread", variant: "destructive" })
    } finally {
      setDisliking(false)
    }
  }

  const fetchLikers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/likers`)
      if (response.ok) {
        const data = await response.json()
        setLikers(data)
        setShowLikers(true)
      }
    } catch (error) {
      console.error('Failed to fetch likers:', error)
    }
  }

  const fetchDislikers = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/dislikers`)
      if (response.ok) {
        const data = await response.json()
        setDislikers(data)
        setShowDislikers(true)
      }
    } catch (error) {
      console.error('Failed to fetch dislikers:', error)
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim() || postingComment) return
    setPostingComment(true)
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newComment,
          parentComment: replyingTo ? { id: replyingTo } : null
        })
      })
      if (response.ok) {
        const newCommentData = await response.json()
        setComments([newCommentData, ...comments])
        setNewComment("")
        setReplyingTo(null)
        setReplyContent("")
        toast({ title: "Success", description: "Comment posted successfully!" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to post comment", variant: "destructive" })
    } finally {
      setPostingComment(false)
    }
  }

  const handleReply = async (commentId: string) => {
    if (!replyContent.trim() || postingComment) return
    setPostingComment(true)
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${resolvedParams.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: replyContent,
          parentComment: { id: commentId }
        })
      })
      if (response.ok) {
        const newReply = await response.json()
        // Update the comments state to include the new reply
        setComments(comments.map(comment =>
          comment.id === commentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        ))
        setReplyContent("")
        setReplyingTo(null)
        toast({ title: "Success", description: "Reply posted successfully!" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to post reply", variant: "destructive" })
    } finally {
      setPostingComment(false)
    }
  }

  const handleEditThread = async () => {
    if (!isSignedIn || !thread) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${thread.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingThread)
      })
      if (response.ok) {
        const updatedThread = await response.json()
        setThread(updatedThread)
        toast({ title: "Success", description: "Thread updated successfully!" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update thread", variant: "destructive" })
    }
    setShowEditModal(false)
  }

  const handleDeleteThread = async () => {
    if (!isSignedIn || !thread) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/threads/${thread.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        toast({ title: "Success", description: "Thread deleted successfully!" })
        window.history.back()
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete thread", variant: "destructive" })
    }
    setShowDeleteModal(false)
  }

  const handleCommentLike = async (commentId: string) => {
    if (!isSignedIn) return

    const isCurrentlyLiked = likedComments[commentId] || false
    const newLikedState = !isCurrentlyLiked

    try {
      // Optimistically update the UI
      setLikedComments(prev => ({
        ...prev,
        [commentId]: newLikedState
      }))

      setComments(comments.map(comment =>
        comment.id === commentId
          ? {
            ...comment,
            likeCount: newLikedState
              ? (comment.likeCount || 0) + 1
              : Math.max(0, (comment.likeCount || 0) - 1)
          }
          : comment
      ))

      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Update with server response
        setComments(comments.map(comment =>
          comment.id === commentId
            ? { ...comment, likeCount: data.likeCount }
            : comment
        ))
        setLikedComments(prev => ({
          ...prev,
          [commentId]: data.isLiked
        }))
      }
    } catch (error) {
      // Revert on error
      setLikedComments(prev => ({
        ...prev,
        [commentId]: isCurrentlyLiked
      }))
      setComments(comments.map(comment =>
        comment.id === commentId
          ? {
            ...comment,
            likeCount: isCurrentlyLiked
              ? (comment.likeCount || 0) + 1
              : Math.max(0, (comment.likeCount || 0) - 1)
          }
          : comment
      ))
      toast({ title: "Error", description: "Failed to like comment", variant: "destructive" })
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!isSignedIn) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setComments(comments.filter(comment => comment.id !== commentId))
        toast({ title: "Success", description: "Comment deleted successfully!" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" })
    }
  }

  const canEditOrDelete = thread && user && thread.createdBy.id === user.id

  const toggleReply = (commentId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
    if (replyingTo === commentId) {
      setReplyingTo(null)
      setReplyContent("")
    } else {
      setReplyingTo(commentId)
    }
  }

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
        <p className="ml-4">Authenticating...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center relative overflow-hidden">
        <div className="text-center bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-[#90CAF9]/20 relative z-10">
          <div
            className="relative"
          >
            <h2
              className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent mb-4"
            >
              Error
            </h2>
            <p
              className="text-[#333333]/70 font-['Open Sans'] mb-6"
            >
              {error}
            </p>
            <div
            >
              <Button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center relative overflow-hidden">
        <div className="text-center bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-[#90CAF9]/20 relative z-10">
          <div
            className="relative"
          >
            <h2
              className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent mb-4"
            >
              Thread Not Found
            </h2>
            <p
              className="text-[#333333]/70 font-['Open Sans'] mb-6"
            >
              The thread you're looking for doesn't exist.
            </p>
            <div
            >
              <Button
                onClick={() => window.history.back()}
                className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div ref={containerRef} className="relative min-h-screen bg-[#f7ecdf] overflow-hidden">
        {/* Static decorative background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Large gradient circles with fixed positions */}
          <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full filter blur-3xl opacity-50" />
          <div className="absolute bottom-[15%] right-[10%] w-[35rem] h-[35rem] bg-gradient-to-r from-indigo-400/30 to-pink-400/30 rounded-full filter blur-3xl opacity-50" />

        </div>

        {/* Header */}
        <header
          className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 rounded-xl px-3 py-2"
                  >
                    <div>
                      <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Back</span>
                  </Button>
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-[#1E3A8A]/30 to-[#90CAF9]/30" />
                <Link href="/" className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] bg-clip-text text-transparent transition-all duration-300 hover:scale-105 inline-block">
                  MediaSphere
                </Link>
              </div>
              <nav className="flex items-center space-x-4">
                <div>
                  <Link href="/clubs">
                    <Button variant="ghost" className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]">
                      <span className="relative z-10">Clubs</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link href="/notifications">
                    <Button variant="ghost" className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]">
                      <span className="relative z-10">Notifications</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </header>

        <main
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-sm text-[#333333]/70 mb-6"
          >
            <div>
              <Link href="/clubs" className="hover:text-[#1E3A8A] transition-colors duration-300 font-['Open Sans']">
                Clubs
              </Link>
            </div>
            <span
              className="text-[#333333]/50"
            >
              /
            </span>
            <div>
              <Link href={`/clubs/${thread.club.id}`} className="hover:text-[#1E3A8A] transition-colors duration-300 font-['Open Sans']">
                {thread.club.name}
              </Link>
            </div>
            <span
              className="text-[#333333]/50"
            >
              /
            </span>
            <span
              className="text-[#333333] font-medium font-['Open Sans']"
            >
              Discussion
            </span>
          </div>

          {/* Thread Card */}
          <div
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A]/10 to-[#90CAF9]/10 rounded-xl blur-xl" />
            <Card className="mb-8 overflow-hidden border-0 shadow-2xl bg-white/90 backdrop-blur-xl relative z-10 border border-[#90CAF9]/30">
              <div
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-white/50 to-[#F0F7FF]/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {thread.isPinned && (
                          <div
                            className="p-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                          >
                            <Pin className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <h1 className="text-3xl font-['Nunito'] font-extrabold text-[#1E3A8A]">
                          {thread.title}
                        </h1>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#333333]/80 mb-4">
                        <Avatar className="h-8 w-8 border border-[#90CAF9]">
                          <AvatarImage src={thread.createdBy.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${thread.createdBy.username}`} alt={thread.createdBy.username} />
                          <AvatarFallback>{thread.createdBy.username.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-[#1E3A8A] font-['Open Sans']">
                          {thread.createdBy.firstName} {thread.createdBy.lastName} (@{thread.createdBy.username})
                        </span>
                        <span className="text-[#333333]/60">•</span>
                        <span className="text-[#333333]/60 font-['Open Sans']">
                          {new Date(thread.createdAt).toLocaleDateString()}
                        </span>
                        {thread.club && (
                          <>
                            <span className="text-[#333333]/60">•</span>
                            <Badge variant="secondary" className="bg-[#E0F2F7] text-[#1E3A8A] font-['Open Sans']">
                              <Link href={`/clubs/${thread.club.id}`} className="hover:underline">
                                {thread.club.name}
                              </Link>
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    {canEditOrDelete && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-[#333333]/70 hover:text-[#1E3A8A] transition-colors duration-300">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-40 bg-white shadow-lg rounded-lg border border-[#90CAF9]/30">
                          <DropdownMenuItem
                            onClick={() => setShowEditModal(true)}
                            className="flex items-center gap-2 text-[#333333] hover:bg-[#F0F7FF] transition-colors duration-200 cursor-pointer p-2"
                          >
                            <Edit3 className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer p-2"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
              </div>

              <CardContent className="p-6">
                {thread.imageUrl && (
                  <div className="relative w-full h-80 mb-6 rounded-lg overflow-hidden border border-[#90CAF9]/20 shadow-md">
                    <Image
                      src={thread.imageUrl}
                      alt={thread.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                )}
                <p className="text-[#333333] leading-relaxed font-['Open Sans'] text-lg">
                  {thread.content}
                </p>

                <div className="flex items-center gap-4 mt-6 border-t border-dashed border-[#90CAF9]/30 pt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        disabled={liking || liked}
                        className={`flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] transition-colors duration-300 ${liked ? 'text-[#1E3A8A] bg-[#E0F2F7]' : 'hover:bg-[#F0F7FF]'}`}
                      >
                        <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-[#1E3A8A]' : ''}`} />
                        <span className="font-['Open Sans']">{likeCount}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                      Like this thread
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDislike}
                        disabled={disliking || disliked}
                        className={`flex items-center gap-2 text-[#333333] hover:text-[#FF4D4F] transition-colors duration-300 ${disliked ? 'text-[#FF4D4F] bg-[#FFE0E0]' : 'hover:bg-[#FFF0F0]'}`}
                      >
                        <ThumbsDown className={`w-4 h-4 ${disliked ? 'fill-[#FF4D4F]' : ''}`} />
                        <span className="font-['Open Sans']">{dislikeCount}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                      Dislike this thread
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-colors duration-300">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-['Open Sans']">{thread.commentCount}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                      View comments
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-colors duration-300">
                        <Eye className="w-4 h-4" />
                        <span className="font-['Open Sans']">{thread.viewCount}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                      Views
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        disabled={bookmarking}
                        className={`flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] transition-colors duration-300 ${isBookmarked ? 'text-[#1E3A8A] bg-[#E0F2F7]' : 'hover:bg-[#F0F7FF]'}`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-[#1E3A8A]' : ''}`} />
                        <span className="font-['Open Sans']">Save</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                      {isBookmarked ? "Remove bookmark" : "Bookmark this thread"}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-colors duration-300"
                      >
                        <Share className="w-4 h-4" />
                        <span className="font-['Open Sans']">Share</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                      Share this thread
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comment Section */}
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-[#90CAF9]/30 p-6">
            <h2 className="text-2xl font-['Nunito'] font-bold text-[#1E3A8A] mb-6 border-b border-dashed border-[#90CAF9]/30 pb-4">
              Comments ({comments.length})
            </h2>

            {/* Comment Input */}
            <div className="mb-8">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 border border-[#90CAF9]/40 rounded-lg focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent transition-all duration-300 text-[#333333] font-['Open Sans'] resize-y"
                rows={3}
              />
              <div className="flex justify-end mt-3 gap-2">
                {replyingTo && (
                  <Button
                    variant="ghost"
                    onClick={() => setReplyingTo(null)}
                    className="text-[#333333] hover:text-red-500 hover:bg-red-500/10 transition-colors duration-300"
                  >
                    Cancel Reply
                  </Button>
                )}
                <Button
                  onClick={handlePostComment}
                  disabled={postingComment || !newComment.trim()}
                  className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
                >
                  {postingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Post Comment
                </Button>
              </div>
            </div>

            {/* Comment Sorting */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-medium text-[#333333]/80 font-['Open Sans']">Sort by:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 border-[#90CAF9]/40 text-[#333333] hover:bg-[#F0F7FF] transition-colors duration-300">
                    {sortOptions.find(option => option.value === sortBy)?.label}
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-40 bg-white shadow-lg rounded-lg border border-[#90CAF9]/30">
                  {sortOptions.map(option => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSortBy(option.value)}
                      className={`flex items-center gap-2 p-2 cursor-pointer ${sortBy === option.value ? 'bg-[#F0F7FF] text-[#1E3A8A]' : 'text-[#333333] hover:bg-[#F0F7FF]'}`}
                    >
                      {option.icon} {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>


            {/* Comments List */}
            <div>
              {comments.length === 0 ? (
                <p className="text-center text-[#333333]/60 font-['Open Sans'] py-8">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="mb-6 pb-6 border-b border-dashed border-[#90CAF9]/20 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-9 w-9 border border-[#90CAF9]">
                        <AvatarImage src={comment.createdBy.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.createdBy.username}`} alt={comment.createdBy.username} />
                        <AvatarFallback>{comment.createdBy.username.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[#1E3A8A] font-['Open Sans']">
                            {comment.createdBy.firstName} {comment.createdBy.lastName}
                          </span>
                          <span className="text-[#333333]/60">•</span>
                          <span className="text-sm text-[#333333]/60 font-['Open Sans']">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {editingComment === comment.id ? (
                          <div className="mt-2">
                            <Textarea
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              className="w-full p-2 border border-[#90CAF9]/40 rounded-lg focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent transition-all duration-300 text-[#333333] font-['Open Sans'] resize-y"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingComment(null)}
                                className="text-[#333333] hover:text-red-500 hover:bg-red-500/10 transition-colors duration-300"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {/* Handle save edit logic */ }}
                                disabled={savingEdit || !editingContent.trim()}
                                className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white font-['Nunito'] font-medium"
                              >
                                {savingEdit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[#333333] leading-normal font-['Open Sans']">{comment.content}</p>
                        )}
                        <div className="flex items-center gap-3 mt-3">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCommentLike(comment.id)}
                                className={`flex items-center gap-1 text-[#333333] hover:text-[#1E3A8A] transition-colors duration-300 ${likedComments[comment.id] ? 'text-[#1E3A8A] bg-[#E0F2F7]' : 'hover:bg-[#F0F7FF]'}`}
                              >
                                <ThumbsUp className={`w-3.5 h-3.5 ${likedComments[comment.id] ? 'fill-[#1E3A8A]' : ''}`} />
                                <span className="text-xs font-['Open Sans']">{comment.likeCount || 0}</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                              Like this comment
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleReply(comment.id)}
                                className={`flex items-center gap-1 text-[#333333] hover:text-[#1E3A8A] transition-colors duration-300 ${replyingTo === comment.id ? 'text-[#1E3A8A] bg-[#E0F2F7]' : 'hover:bg-[#F0F7FF]'}`}
                              >
                                <Reply className="w-3.5 h-3.5" />
                                <span className="text-xs font-['Open Sans']">Reply</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white shadow-md border border-[#90CAF9]/30 text-[#333333] font-['Open Sans']">
                              Reply to this comment
                            </TooltipContent>
                          </Tooltip>

                          {(comment.createdBy.id === user?.id || thread.createdBy.id === user?.id) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-[#333333]/70 hover:text-[#1E3A8A] transition-colors duration-300">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-40 bg-white shadow-lg rounded-lg border border-[#90CAF9]/30">
                                <DropdownMenuItem
                                  onClick={() => { setEditingComment(comment.id); setEditingContent(comment.content); }}
                                  className="flex items-center gap-2 text-[#333333] hover:bg-[#F0F7FF] transition-colors duration-200 cursor-pointer p-2"
                                >
                                  <Edit3 className="h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer p-2"
                                >
                                  <Trash2 className="h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {/* Reply Input */}
                        {replyingTo === comment.id && (
                          <div className="mt-4 pl-4 border-l-2 border-[#90CAF9]/40">
                            <Textarea
                              placeholder={`Replying to @${comment.createdBy.username}...`}
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="w-full p-3 border border-[#90CAF9]/40 rounded-lg focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent transition-all duration-300 text-[#333333] font-['Open Sans'] resize-y"
                              rows={2}
                            />
                            <div className="flex justify-end mt-2 gap-2">
                              <Button
                                onClick={() => setReplyingTo(null)}
                                variant="ghost"
                                className="text-[#333333] hover:text-red-500 hover:bg-red-500/10 transition-colors duration-300"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={() => handleReply(comment.id)}
                                disabled={postingComment || !replyContent.trim()}
                                className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
                              >
                                {postingComment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Reply
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Nested Replies */}
                        {comment.replies && comment.replies.length > 0 && showReplies[comment.id] && (
                          <div className="mt-4 pl-4 border-l-2 border-[#90CAF9]/40">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="mb-4 last:mb-0">
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-8 w-8 border border-[#90CAF9]">
                                    <AvatarImage src={reply.createdBy.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${reply.createdBy.username}`} alt={reply.createdBy.username} />
                                    <AvatarFallback>{reply.createdBy.username.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-[#1E3A8A] font-['Open Sans']">
                                        {reply.createdBy.firstName} {reply.createdBy.lastName}
                                      </span>
                                      <span className="text-[#333333]/60">•</span>
                                      <span className="text-sm text-[#333333]/60 font-['Open Sans']">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-[#333333] leading-normal font-['Open Sans']">{reply.content}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleCommentLike(reply.id)}
                                        className={`flex items-center gap-1 text-[#333333] hover:text-[#1E3A8A] transition-colors duration-300 ${likedComments[reply.id] ? 'text-[#1E3A8A] bg-[#E0F2F7]' : 'hover:bg-[#F0F7FF]'}`}
                                      >
                                        <ThumbsUp className={`w-3.5 h-3.5 ${likedComments[reply.id] ? 'fill-[#1E3A8A]' : ''}`} />
                                        <span className="text-xs font-['Open Sans']">{reply.likeCount || 0}</span>
                                      </Button>
                                      {(reply.createdBy.id === user?.id || thread.createdBy.id === user?.id) && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="text-[#333333]/70 hover:text-[#1E3A8A] transition-colors duration-300">
                                              <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent className="w-40 bg-white shadow-lg rounded-lg border border-[#90CAF9]/30">
                                            <DropdownMenuItem
                                              onClick={() => { setEditingComment(reply.id); setEditingContent(reply.content); }}
                                              className="flex items-center gap-2 text-[#333333] hover:bg-[#F0F7FF] transition-colors duration-200 cursor-pointer p-2"
                                            >
                                              <Edit3 className="h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() => handleDeleteComment(reply.id)}
                                              className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 transition-colors duration-200 cursor-pointer p-2"
                                            >
                                              <Trash2 className="h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {comment.replies && comment.replies.length > 0 && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setShowReplies(prev => ({ ...prev, [comment.id]: !prev[comment.id] }))}
                            className="text-[#1E3A8A] font-semibold text-sm mt-2 font-['Open Sans']"
                          >
                            {showReplies[comment.id] ? `Hide ${comment.replies.length} replies` : `View ${comment.replies.length} replies`}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>

        {/* Edit Thread Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl border border-[#90CAF9]/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-['Nunito'] font-bold text-[#1E3A8A]">Edit Thread</DialogTitle>
              <DialogDescription className="text-[#333333]/70 font-['Open Sans']">
                Make changes to your thread here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-[#333333] font-['Open Sans']">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingThread.title}
                  onChange={(e) => setEditingThread({ ...editingThread, title: e.target.value })}
                  className="col-span-3 border border-[#90CAF9]/40 focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent text-[#333333] font-['Open Sans']"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right text-[#333333] font-['Open Sans']">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={editingThread.content}
                  onChange={(e) => setEditingThread({ ...editingThread, content: e.target.value })}
                  className="col-span-3 border border-[#90CAF9]/40 focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent text-[#333333] font-['Open Sans'] resize-y"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="imageUrl" className="text-right text-[#333333] font-['Open Sans']">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  value={editingThread.imageUrl}
                  onChange={(e) => setEditingThread({ ...editingThread, imageUrl: e.target.value })}
                  className="col-span-3 border border-[#90CAF9]/40 focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent text-[#333333] font-['Open Sans']"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border-[#90CAF9]/40 text-[#333333] hover:bg-[#F0F7FF] hover:text-[#1E3A8A] transition-colors duration-300 font-['Nunito']"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleEditThread}
                className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Thread Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl border border-red-400/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-['Nunito'] font-bold text-red-600">Delete Thread</DialogTitle>
              <DialogDescription className="text-[#333333]/70 font-['Open Sans']">
                Are you sure you want to delete this thread? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="border-[#90CAF9]/40 text-[#333333] hover:bg-[#F0F7FF] hover:text-[#1E3A8A] transition-colors duration-300 font-['Nunito']"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleDeleteThread}
                className="bg-red-500 hover:bg-red-600 text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(239,68,68,0.2)]"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Share Modal */}
        <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
          <DialogContent className="sm:max-w-[425px] bg-white p-6 rounded-lg shadow-xl border border-[#90CAF9]/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-['Nunito'] font-bold text-[#1E3A8A]">Share Thread</DialogTitle>
              <DialogDescription className="text-[#333333]/70 font-['Open Sans']">
                Share this thread with others.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Input
                  id="shareLink"
                  readOnly
                  value={window.location.href}
                  className="flex-1 border border-[#90CAF9]/40 focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent text-[#333333] font-['Open Sans']"
                />
                <Button
                  onClick={() => { navigator.clipboard.writeText(window.location.href); toast({ title: "Copied!", description: "Link copied to clipboard." }) }}
                  className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
                >
                  Copy
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowShareModal(false)}
                className="border-[#90CAF9]/40 text-[#333333] hover:bg-[#F0F7FF] hover:text-[#1E3A8A] transition-colors duration-300 font-['Nunito']"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}