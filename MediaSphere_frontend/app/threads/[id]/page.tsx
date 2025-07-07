"use client"

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
import { 
  MessageSquare, Share, MoreHorizontal, Pin, ThumbsUp, ThumbsDown, Reply, ArrowLeft, 
  Heart, Bookmark, Eye, Star, Sparkles, TrendingUp, Send, Edit3, Trash2, Loader2 
} from "lucide-react"
import Link from "next/link"
import { use, useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { authService } from "@/lib/auth-service"
import { toast } from "@/hooks/use-toast"

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
  const { user, isAuthenticated } = useAuth()
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
  const [showReplies, setShowReplies] = useState<{[key: string]: boolean}>({})
  const [likedComments, setLikedComments] = useState<{[key: string]: boolean}>({})
  
  // Bookmark/Save functionality
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  
  // Enhanced sharing
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  
  // Emoji reactions beyond like/dislike
  const reactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '😡']
  const [threadReactions, setThreadReactions] = useState<{[key: string]: number}>({})
  const [userReactions, setUserReactions] = useState<string[]>([])
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  
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
  const [collapsedReplies, setCollapsedReplies] = useState<{[key: string]: boolean}>({})
  const [replyDepth, setReplyDepth] = useState<{[key: string]: number}>({})
  const maxReplyDepth = 5 // Maximum nesting level
  
  // Auto-save draft comments
  const [draftComment, setDraftComment] = useState("")
  const [draftReply, setDraftReply] = useState<{[key: string]: string}>({})
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
  const commentRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
  
  // Enhanced performance and image optimization
  const [imageLoadingStates, setImageLoadingStates] = useState<{[key: string]: boolean}>({})
  const [optimizedImages, setOptimizedImages] = useState<{[key: string]: string}>({})
  
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  // Parallax effects
  const headerY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])

  // Floating icons for background animation
  const floatingIcons = [
    { icon: Star, delay: 0.5, x: -30, y: -40 },
    { icon: Heart, delay: 0.8, x: 40, y: -35 },
    { icon: Sparkles, delay: 1.1, x: -35, y: 30 },
    { icon: TrendingUp, delay: 1.4, x: 35, y: 40 },
    { icon: MessageSquare, delay: 1.7, x: -40, y: -20 },
    { icon: ThumbsUp, delay: 2.0, x: 30, y: 35 },
  ]

  useEffect(() => {
    if (isAuthenticated) {
      fetchThreadAndComments()
      fetchLikeStatus()
    }
  }, [resolvedParams.id, isAuthenticated])

  const fetchThreadAndComments = async () => {
    setLoading(true)
    setError("")
    try {
      const token = authService.getToken()
      
      // Fetch thread details
      const threadRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (!threadRes.ok) throw new Error("Thread not found")
      const threadData = await threadRes.json()
      setThread(threadData)
      setLikeCount(threadData.likeCount || 0)
      setDislikeCount(threadData.dislikeCount || 0)
      setEditingThread({
        title: threadData.title,
        content: threadData.content,
        imageUrl: threadData.imageUrl || ""
      })
      
      // Fetch comments
      const commentsRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/comments`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json()
        setComments(commentsData)
      }
      
    } catch (err: any) {
      setError(err.message || "Failed to load thread.")
    } finally {
      setLoading(false)
    }
  }

  const fetchLikeStatus = async () => {
    if (!isAuthenticated) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/like-status`, {
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
    if (!isAuthenticated || liking) return
    setLiking(true)
    try {
      // Simple increment logic - no toggling
      setLikeCount(prev => prev + 1)
      setLiked(true)

      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/like`, {
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
    if (!isAuthenticated || disliking) return
    setDisliking(true)
    try {
      // Simple increment logic - no toggling
      setDislikeCount(prev => prev + 1)
      setDisliked(true)

      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/dislike`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/likers`)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/dislikers`)
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/comments`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/comments`, {
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
    if (!isAuthenticated || !thread) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${thread.id}`, {
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
    if (!isAuthenticated || !thread) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${thread.id}`, {
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
    if (!isAuthenticated) return
    
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/comments/${commentId}/like`, {
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
    if (!isAuthenticated) return
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/comments/${commentId}`, {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -50, rotateY: -15 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      },
    },
    hover: {
      scale: 1.03,
      rotateY: 3,
      y: -8,
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-4"
          >
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400" />
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-slate-300"
          >
            Loading thread...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-red-400 mb-4"
          >
            Error
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-300 mb-4"
          >
            {error}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-slate-200 mb-4"
          >
            Thread Not Found
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 mb-4"
          >
            The thread you're looking for doesn't exist.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={() => window.history.back()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-indigo-600/10"
          />
          
          {/* Floating Background Elements */}
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                scale: [0, 1.5, 0],
                x: [0, item.x, item.x * 2],
                y: [0, item.y, item.y * 2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 15,
                delay: item.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            >
              <item.icon className="w-8 h-8 text-purple-400/30" />
            </motion.div>
          ))}
          
          {/* Animated Gradient Orbs */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, ease: "easeOut" }}
            className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 3, delay: 1, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/15 to-teal-500/15 rounded-full blur-3xl"
          />
        </div>

        {/* Header */}
        <motion.header 
          style={{ y: headerY, opacity }}
          className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.history.back()}
                    className="hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ x: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </motion.div>
                    Back
                  </Button>
                </motion.div>
                <div className="h-8 w-px bg-gradient-to-b from-purple-500/50 to-blue-500/50" />
                <Link href="/" className="text-2xl font-bold">
                  <motion.span
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"
                  >
                    MediaSphere
                  </motion.span>
                </Link>
              </div>
              <nav className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/clubs">
                    <Button variant="ghost" className="hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all duration-300">
                      Clubs
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/notifications">
                    <Button variant="ghost" className="hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all duration-300">
                      Notifications
                    </Button>
                  </Link>
                </motion.div>
              </nav>
            </div>
          </div>
        </motion.header>

        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        >
          {/* Breadcrumb */}
          <motion.div 
            variants={itemVariants} 
            className="flex items-center gap-2 text-sm text-slate-400 mb-6"
          >
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href="/clubs" className="hover:text-purple-400 transition-colors duration-300">
                Clubs
              </Link>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-600"
            >
              /
            </motion.span>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Link href={`/clubs/${thread.club.id}`} className="hover:text-purple-400 transition-colors duration-300">
                {thread.club.name}
              </Link>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="text-slate-600"
            >
              /
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
              className="text-slate-200 font-medium"
            >
              Discussion
            </motion.span>
          </motion.div>

          {/* Thread Card */}
          <motion.div 
            variants={cardVariants} 
            whileHover="hover"
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl blur-xl" />
            <Card className="mb-8 overflow-hidden border-0 shadow-2xl bg-slate-800/90 backdrop-blur-xl relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <CardHeader className="pb-4 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {thread.isPinned && (
                          <motion.div
                            initial={{ rotate: 0, scale: 0 }}
                            animate={{ rotate: 360, scale: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="p-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                          >
                            <Pin className="h-4 w-4 text-slate-900" />
                          </motion.div>
                        )}
                        <motion.h1 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent"
                        >
                          {thread.title}
                        </motion.h1>
                      </div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex items-center gap-3 mb-4"
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar className="h-10 w-10 ring-2 ring-purple-400/50 shadow-lg">
                            <AvatarImage src={thread.createdBy.profilePic} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {thread.createdBy.firstName?.[0] || thread.createdBy.username[0]}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-200">
                              {thread.createdBy.firstName ? 
                                `${thread.createdBy.firstName} ${thread.createdBy.lastName}` : 
                                thread.createdBy.username
                              }
                            </span>
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 }}
                            >
                              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-400/30">
                                Member
                              </Badge>
                            </motion.div>
                          </div>
                          <div className="text-sm text-slate-400">
                            in{" "}
                            <Link href={`/clubs/${thread.club.id}`} className="hover:text-purple-400 font-medium transition-colors duration-300">
                              {thread.club.name}
                            </Link>{" "}
                            • {new Date(thread.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    {canEditOrDelete && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-slate-700/50 text-slate-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem onClick={() => setShowEditModal(true)} className="text-slate-300 hover:text-white hover:bg-slate-700">
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit Thread
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Thread
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="bg-slate-800/30">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="prose max-w-none mb-6"
                  >
                    {thread.content.split('\n').map((paragraph, index) => (
                      <motion.p 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                        className="mb-4 text-slate-300 leading-relaxed"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </motion.div>
                  {thread.imageUrl && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="mb-6 rounded-lg overflow-hidden shadow-xl"
                    >
                      <img 
                        src={thread.imageUrl} 
                        alt="Thread image" 
                        className="w-full h-auto max-h-96 object-cover"
                      />
                    </motion.div>
                  )}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="flex items-center gap-6 pt-4 border-t border-slate-700/50"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`flex items-center gap-2 transition-all duration-300 ${
                                liking ? 'text-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20' : 'hover:text-blue-400 hover:bg-blue-500/10 text-slate-400'
                              }`}
                              onClick={handleLike}
                              disabled={liking}
                            >
                              <motion.div
                                animate={liking ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                                transition={{ duration: 0.5 }}
                              >
                                <span className="text-lg">👍</span>
                              </motion.div>
                            </Button>
                            <motion.span 
                              className="text-xs text-slate-400 cursor-pointer hover:text-blue-400 transition-colors"
                              onClick={() => {
                                fetchLikers()
                                setShowLikers(true)
                              }}
                              whileHover={{ scale: 1.1 }}
                            >
                              {likeCount}
                            </motion.span>
                          </div>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                        <p>Like this thread</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`flex items-center gap-2 transition-all duration-300 ${
                                disliked ? 'text-red-400 bg-red-500/10 shadow-lg shadow-red-500/20' : 'hover:text-red-400 hover:bg-red-500/10 text-slate-400'
                              }`}
                              onClick={handleDislike}
                              disabled={disliking}
                            >
                              <motion.div
                                animate={disliked ? { scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] } : {}}
                                transition={{ duration: 0.5 }}
                              >
                                <span className="text-lg">👎</span>
                              </motion.div>
                            </Button>
                            <motion.span 
                              className="text-xs text-slate-400 cursor-pointer hover:text-red-400 transition-colors"
                              onClick={() => {
                                fetchDislikers()
                                setShowDislikers(true)
                              }}
                              whileHover={{ scale: 1.1 }}
                            >
                              {dislikeCount}
                            </motion.span>
                          </div>
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent className="bg-slate-800 text-slate-200 border-slate-700">
                        <p>Dislike this thread</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-green-400 hover:bg-green-500/10 text-slate-400 transition-all duration-300">
                        <MessageSquare className="h-4 w-4" />
                        {comments.length}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-purple-400 hover:bg-purple-500/10 text-slate-400 transition-all duration-300">
                        <Eye className="h-4 w-4" />
                        {thread.viewCount}
                      </Button>
                    </motion.div>
                    
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-cyan-400 hover:bg-cyan-500/10 text-slate-400 transition-all duration-300">
                        <Share className="h-4 w-4" />
                        Share
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </motion.div>
            </Card>
          </motion.div>

          {/* Add Comment */}
          {isAuthenticated && (
            <motion.div 
              variants={cardVariants}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur-xl" />
              <Card className="mb-8 border-0 shadow-2xl bg-slate-800/90 backdrop-blur-xl relative z-10">
                <CardContent className="pt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-blue-400/50 shadow-lg">
                        <AvatarImage src={user?.profilePic} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div className="flex-1">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                      >
                        <Textarea 
                          placeholder="Add your thoughts to the discussion..." 
                          className="min-h-[100px] mb-4 bg-slate-700/50 border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 text-slate-200 placeholder-slate-400"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                      </motion.div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="flex justify-between items-center"
                      >
                        <div className="text-sm text-slate-400">Be respectful and constructive in your response</div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 transition-all duration-300"
                            onClick={handlePostComment}
                            disabled={postingComment || !newComment.trim()}
                          >
                            {postingComment ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <motion.div
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Send className="w-4 h-4 mr-2" />
                              </motion.div>
                            )}
                            Post Comment
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comments Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-xl font-bold text-slate-200 flex items-center gap-2"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <MessageSquare className="w-5 h-5" />
              </motion.div>
              Comments ({comments.length})
            </motion.h2>

            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-500/5 to-slate-600/5 rounded-xl blur-xl" />
                  <Card className="border-0 shadow-2xl bg-slate-800/90 backdrop-blur-xl hover:shadow-3xl transition-all duration-500 relative z-10">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar className="h-8 w-8 ring-2 ring-green-400/50 shadow-lg">
                            <AvatarImage src={comment.createdBy.profilePic} />
                            <AvatarFallback className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                              {comment.createdBy.firstName?.[0] || comment.createdBy.username[0]}
                            </AvatarFallback>
                          </Avatar>
                        </motion.div>
                        <div className="flex-1">
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="flex items-center gap-2 mb-2"
                          >
                            <span className="font-medium text-slate-200">
                              {comment.createdBy.firstName ? 
                                `${comment.createdBy.firstName} ${comment.createdBy.lastName}` : 
                                comment.createdBy.username
                              }
                            </span>
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.4 }}
                            >
                              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-300 border-green-400/30">
                                Member
                              </Badge>
                            </motion.div>
                            <span className="text-sm text-slate-500">•</span>
                            <span className="text-sm text-slate-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {canEditOrDelete && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.6 }}
                                whileHover={{ scale: 1.1 }}
                                className="ml-auto"
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  onClick={() => handleDeleteComment(comment.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                          <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-slate-300 mb-4 leading-relaxed"
                          >
                            {comment.content}
                          </motion.p>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex items-center gap-4"
                          >
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className={`flex items-center gap-2 transition-all duration-300 ${
                                  likedComments[comment.id] 
                                    ? 'text-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/20' 
                                    : 'hover:text-blue-400 hover:bg-blue-500/10 text-slate-400'
                                }`}
                                onClick={() => handleCommentLike(comment.id)}
                              >
                                <ThumbsUp className="h-3 w-3" />
                                {comment.likeCount || 0}
                              </Button>
                            </motion.div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="flex items-center gap-2 hover:text-green-400 hover:bg-green-500/10 text-slate-400"
                                onClick={() => toggleReply(comment.id)}
                              >
                                <Reply className="h-3 w-3" />
                                Reply
                              </Button>
                            </motion.div>
                          </motion.div>

                          {/* Reply Form */}
                          <AnimatePresence>
                            {replyingTo === comment.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="mt-4 pl-4 border-l-2 border-purple-500/30"
                              >
                                <div className="flex gap-3">
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    whileHover={{ scale: 1.1 }}
                                  >
                                    <Avatar className="h-6 w-6 ring-1 ring-purple-400/50">
                                      <AvatarImage src={user?.profilePic} />
                                      <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                                      </AvatarFallback>
                                    </Avatar>
                                  </motion.div>
                                  <div className="flex-1">
                                    <motion.div
                                      initial={{ opacity: 0, scale: 0.95 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ delay: 0.3 }}
                                    >
                                      <Textarea
                                        placeholder="Write a reply..."
                                        className="min-h-[80px] mb-2 bg-slate-700/50 border-slate-600 focus:border-purple-500 focus:ring-purple-500/20 text-slate-200 placeholder-slate-400"
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                      />
                                    </motion.div>
                                    <motion.div 
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.4 }}
                                      className="flex gap-2"
                                    >
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button
                                          size="sm"
                                          onClick={() => handleReply(comment.id)}
                                          disabled={postingComment || !replyContent.trim()}
                                          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25"
                                        >
                                          {postingComment ? (
                                            <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                          ) : (
                                            <Send className="w-3 h-3 mr-2" />
                                          )}
                                          Reply
                                        </Button>
                                      </motion.div>
                                      <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setReplyingTo(null)
                                            setReplyContent("")
                                          }}
                                          className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                                        >
                                          Cancel
                                        </Button>
                                      </motion.div>
                                    </motion.div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: 0.8 }}
                              className="mt-4 pl-4 border-l-2 border-slate-700/30 space-y-4"
                            >
                              {comment.replies.map((reply, replyIndex) => (
                                <motion.div 
                                  key={reply.id} 
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: replyIndex * 0.1 }}
                                  className="flex gap-3"
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <Avatar className="h-6 w-6 ring-1 ring-pink-400/50">
                                      <AvatarImage src={reply.createdBy.profilePic} />
                                      <AvatarFallback className="text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                                        {reply.createdBy.firstName?.[0] || reply.createdBy.username[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                  </motion.div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-slate-200">
                                        {reply.createdBy.firstName ? 
                                          `${reply.createdBy.firstName} ${reply.createdBy.lastName}` : 
                                          reply.createdBy.username
                                        }
                                      </span>
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + replyIndex * 0.1 }}
                                      >
                                        <Badge variant="secondary" className="text-xs bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-400/30">
                                          Member
                                        </Badge>
                                      </motion.div>
                                      <span className="text-xs text-slate-500">•</span>
                                      <span className="text-xs text-slate-400">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-slate-300 text-sm mb-2 leading-relaxed">{reply.content}</p>
                                    <div className="flex items-center gap-3">
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs hover:text-blue-400 hover:bg-blue-500/10 text-slate-400">
                                          <ThumbsUp className="h-3 w-3" />
                                          {reply.likeCount || 0}
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {comments.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                </motion.div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-slate-400"
                >
                  No comments yet. Be the first to share your thoughts!
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        </motion.main>

        {/* Edit Thread Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-200">Edit Thread</DialogTitle>
              <DialogDescription className="text-slate-400">
                Make changes to your thread here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-slate-300">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingThread.title}
                  onChange={(e) => setEditingThread({...editingThread, title: e.target.value})}
                  className="col-span-3 bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right text-slate-300">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={editingThread.content}
                  onChange={(e) => setEditingThread({...editingThread, content: e.target.value})}
                  className="col-span-3 bg-slate-700 border-slate-600 text-slate-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={handleEditThread}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Thread Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-200">Delete Thread</DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to delete this thread? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteModal(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteThread}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Likers Modal */}
        <Dialog open={showLikers} onOpenChange={setShowLikers}>
          <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-200">People who liked this thread ({likers.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {likers.map((liker, index) => (
                <motion.div 
                  key={liker.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <Avatar className="h-8 w-8 ring-1 ring-blue-400/50">
                    <AvatarImage src={liker.profilePic} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {liker.firstName?.[0] || liker.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-slate-200">
                    {liker.username}
                  </span>
                </motion.div>
              ))}
              {likers.length === 0 && (
                <p className="text-slate-400 text-center py-4">No likes yet</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dislikers Modal */}
        <Dialog open={showDislikers} onOpenChange={setShowDislikers}>
          <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-slate-200">People who disliked this thread ({dislikers.length})</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {dislikers.map((disliker, index) => (
                <motion.div 
                  key={disliker.id} 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  <Avatar className="h-8 w-8 ring-1 ring-red-400/50">
                    <AvatarImage src={disliker.profilePic} />
                    <AvatarFallback className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
                      {disliker.firstName?.[0] || disliker.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-slate-200">
                    {disliker.username}
                  </span>
                </motion.div>
              ))}
              {dislikers.length === 0 && (
                <p className="text-slate-400 text-center py-4">No dislikes yet</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
