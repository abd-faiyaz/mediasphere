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
  
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })

  // Parallax effects
  const headerY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])

  // Floating icons for background animation
  const floatingIcons = [
    { icon: Star, delay: 0.5, x: -20, y: -30 },
    { icon: Heart, delay: 0.8, x: 30, y: -25 },
    { icon: Sparkles, delay: 1.1, x: -25, y: 20 },
    { icon: TrendingUp, delay: 1.4, x: 25, y: 30 },
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
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/like`, {
        method: 'POST',
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
      toast({ title: "Error", description: "Failed to like thread", variant: "destructive" })
    } finally {
      setLiking(false)
    }
  }

  const handleDislike = async () => {
    if (!isAuthenticated || disliking) return
    setDisliking(true)
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${resolvedParams.id}/dislike`, {
        method: 'POST',
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
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -30, rotateY: -10 },
    visible: {
      opacity: 1,
      x: 0,
      rotateY: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      },
    },
    hover: {
      scale: 1.02,
      rotateY: 2,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading thread...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Thread Not Found</h2>
          <p className="text-gray-600 mb-4">The thread you're looking for doesn't exist.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 0.2, 0],
                scale: [0, 1.2, 0],
                x: [0, item.x, item.x * 2],
                y: [0, item.y, item.y * 2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 12,
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
              <item.icon className="w-6 h-6 text-purple-300/20" />
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <motion.header 
          style={{ y: headerY, opacity }}
          className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.history.back()}
                  className="hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="h-8 w-px bg-gray-300" />
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  MediaSphere
                </Link>
              </div>
              <nav className="flex items-center space-x-4">
                <Link href="/clubs">
                  <Button variant="ghost" className="hover:bg-white/20">Clubs</Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="ghost" className="hover:bg-white/20">Notifications</Button>
                </Link>
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
          <motion.div variants={itemVariants} className="flex items-center gap-2 text-sm text-gray-600 mb-6">
            <Link href="/clubs" className="hover:text-blue-600 transition-colors">
              Clubs
            </Link>
            <span>/</span>
            <Link href={`/clubs/${thread.club.id}`} className="hover:text-blue-600 transition-colors">
              {thread.club.name}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium">Discussion</span>
          </motion.div>

          {/* Thread Card */}
          <motion.div variants={cardVariants} whileHover="hover">
            <Card className="mb-8 overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      {thread.isPinned && (
                        <motion.div
                          initial={{ rotate: 0 }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <Pin className="h-4 w-4 text-blue-600" />
                        </motion.div>
                      )}
                      <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                        <AvatarImage src={thread.createdBy.profilePic} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {thread.createdBy.firstName?.[0] || thread.createdBy.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {thread.createdBy.firstName ? 
                              `${thread.createdBy.firstName} ${thread.createdBy.lastName}` : 
                              thread.createdBy.username
                            }
                          </span>
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100">
                            Member
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          in{" "}
                          <Link href={`/clubs/${thread.club.id}`} className="hover:text-blue-600 font-medium">
                            {thread.club.name}
                          </Link>{" "}
                          • {new Date(thread.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  {canEditOrDelete && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="hover:bg-white/20">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setShowEditModal(true)}>
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Thread
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowDeleteModal(true)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Thread
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none mb-6">
                  {thread.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
                {thread.imageUrl && (
                  <div className="mb-6 rounded-lg overflow-hidden">
                    <img 
                      src={thread.imageUrl} 
                      alt="Thread image" 
                      className="w-full h-auto max-h-96 object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`flex items-center gap-2 transition-all ${
                          liked ? 'text-blue-600 bg-blue-50' : 'hover:text-blue-600 hover:bg-blue-50'
                        }`}
                        onClick={handleLike}
                        disabled={liking}
                        onMouseEnter={fetchLikers}
                      >
                        <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                        {likeCount}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Like this thread</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`flex items-center gap-2 transition-all ${
                          disliked ? 'text-red-600 bg-red-50' : 'hover:text-red-600 hover:bg-red-50'
                        }`}
                        onClick={handleDislike}
                        disabled={disliking}
                        onMouseEnter={fetchDislikers}
                      >
                        <ThumbsDown className={`h-4 w-4 ${disliked ? 'fill-current' : ''}`} />
                        {dislikeCount}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dislike this thread</p>
                    </TooltipContent>
                  </Tooltip>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-green-600 hover:bg-green-50">
                    <MessageSquare className="h-4 w-4" />
                    {comments.length}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-purple-600 hover:bg-purple-50">
                    <Eye className="h-4 w-4" />
                    {thread.viewCount}
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-gray-600 hover:bg-gray-50">
                    <Share className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Add Comment */}
          {isAuthenticated && (
            <motion.div variants={cardVariants}>
              <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar className="h-8 w-8 ring-2 ring-white shadow-md">
                      <AvatarImage src={user?.profilePic} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea 
                        placeholder="Add your thoughts to the discussion..." 
                        className="min-h-[100px] mb-4 bg-white/50 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">Be respectful and constructive in your response</div>
                        <Button 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                          onClick={handlePostComment}
                          disabled={postingComment || !newComment.trim()}
                        >
                          {postingComment ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Comments Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Comments ({comments.length})
            </h2>

            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar className="h-8 w-8 ring-2 ring-white shadow-md">
                          <AvatarImage src={comment.createdBy.profilePic} />
                          <AvatarFallback className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            {comment.createdBy.firstName?.[0] || comment.createdBy.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900">
                              {comment.createdBy.firstName ? 
                                `${comment.createdBy.firstName} ${comment.createdBy.lastName}` : 
                                comment.createdBy.username
                              }
                            </span>
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-green-100 to-blue-100">
                              Member
                            </Badge>
                            <span className="text-sm text-gray-600">•</span>
                            <span className="text-sm text-gray-600">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {canEditOrDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4 leading-relaxed">{comment.content}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:text-blue-600 hover:bg-blue-50">
                              <ThumbsUp className="h-3 w-3" />
                              {comment.likeCount || 0}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-2 hover:text-green-600 hover:bg-green-50"
                              onClick={() => toggleReply(comment.id)}
                            >
                              <Reply className="h-3 w-3" />
                              Reply
                            </Button>
                          </div>

                          {/* Reply Form */}
                          <AnimatePresence>
                            {replyingTo === comment.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 pl-4 border-l-2 border-blue-200"
                              >
                                <div className="flex gap-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={user?.profilePic} />
                                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                                      {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <Textarea
                                      placeholder="Write a reply..."
                                      className="min-h-[80px] mb-2 bg-white/50"
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleReply(comment.id)}
                                        disabled={postingComment || !replyContent.trim()}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                      >
                                        {postingComment ? (
                                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                        ) : (
                                          <Send className="w-3 h-3 mr-2" />
                                        )}
                                        Reply
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setReplyingTo(null)
                                          setReplyContent("")
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Nested Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex gap-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={reply.createdBy.profilePic} />
                                    <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                      {reply.createdBy.firstName?.[0] || reply.createdBy.username[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium text-sm text-gray-900">
                                        {reply.createdBy.firstName ? 
                                          `${reply.createdBy.firstName} ${reply.createdBy.lastName}` : 
                                          reply.createdBy.username
                                        }
                                      </span>
                                      <Badge variant="secondary" className="text-xs bg-gradient-to-r from-purple-100 to-pink-100">
                                        Member
                                      </Badge>
                                      <span className="text-xs text-gray-600">•</span>
                                      <span className="text-xs text-gray-600">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mb-2 leading-relaxed">{reply.content}</p>
                                    <div className="flex items-center gap-3">
                                      <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs hover:text-blue-600 hover:bg-blue-50">
                                        <ThumbsUp className="h-3 w-3" />
                                        {reply.likeCount || 0}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No comments yet. Be the first to share your thoughts!</p>
              </motion.div>
            )}
          </motion.div>
        </motion.main>

        {/* Edit Thread Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Thread</DialogTitle>
              <DialogDescription>
                Make changes to your thread here. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={editingThread.title}
                  onChange={(e) => setEditingThread({...editingThread, title: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={editingThread.content}
                  onChange={(e) => setEditingThread({...editingThread, content: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleEditThread}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Thread Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Thread</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this thread? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteThread}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Likers Modal */}
        <Dialog open={showLikers} onOpenChange={setShowLikers}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>People who liked this thread</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {likers.map((liker) => (
                <div key={liker.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={liker.profilePic} />
                    <AvatarFallback>
                      {liker.firstName?.[0] || liker.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {liker.firstName ? 
                      `${liker.firstName} ${liker.lastName}` : 
                      liker.username
                    }
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Dislikers Modal */}
        <Dialog open={showDislikers} onOpenChange={setShowDislikers}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>People who disliked this thread</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {dislikers.map((disliker) => (
                <div key={disliker.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={disliker.profilePic} />
                    <AvatarFallback>
                      {disliker.firstName?.[0] || disliker.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">
                    {disliker.firstName ? 
                      `${disliker.firstName} ${disliker.lastName}` : 
                      disliker.username
                    }
                  </span>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
