"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Share, MoreHorizontal, Pin, ThumbsUp, Reply, ArrowLeft, Heart, Bookmark, Eye, Star, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import { use, useState, useRef } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"

export default function ThreadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [newComment, setNewComment] = useState("")
  const [liked, setLiked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({})
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
  const thread = {
    id: resolvedParams.id,
    title: "The Future of AI in Education",
    content:
      "I've been thinking about how artificial intelligence is transforming the education sector. From personalized learning paths to automated grading systems, AI is revolutionizing how we teach and learn.\n\nWhat are your thoughts on the ethical implications? How do we ensure AI enhances rather than replaces human connection in education?\n\nI'd love to hear your experiences and predictions for the next 5-10 years.",
    author: {
      name: "Sarah Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "Admin",
    },
    club: "Tech Innovators",
    clubId: "1",
    createdAt: "2 hours ago",
    likes: 23,
    replies: 45,
    pinned: true,
    tags: ["AI", "Education", "Ethics"],
  }

  const toggleReply = (commentId: number) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }

  const handleLike = () => {
    setLiked(!liked)
  }

  const handleBookmark = () => {
    setBookmarked(!bookmarked)
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

  return (
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
    {
      id: 1,
      author: {
        name: "Mike Johnson",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "Member",
      },
      content:
        "Great topic, Sarah! I think AI can definitely enhance education, but we need to be careful about data privacy, especially with younger students. The key is finding the right balance between automation and human interaction.",
      createdAt: "1 hour ago",
      likes: 12,
      replies: [
        {
          id: 11,
          author: {
            name: "Emma Davis",
            avatar: "/placeholder.svg?height=32&width=32",
            role: "Member",
          },
          content:
            "Absolutely agree on the privacy concerns. I work in EdTech and we're constantly navigating COPPA and FERPA compliance.",
          createdAt: "45 minutes ago",
          likes: 5,
        },
      ],
    },
    {
      id: 2,
      author: {
        name: "Alex Kim",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "Member",
      },
      content:
        "I've been using AI tutoring systems with my students and the results are impressive. The personalization aspect is game-changing - students get exactly the help they need when they need it.",
      createdAt: "45 minutes ago",
      likes: 8,
      replies: [],
    },
    {
      id: 3,
      author: {
        name: "Lisa Rodriguez",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "Member",
      },
      content:
        "While AI has benefits, I'm concerned about the potential for increased inequality. Not all schools have access to the same technology. How do we ensure AI in education doesn't widen the digital divide?",
      createdAt: "30 minutes ago",
      likes: 15,
      replies: [],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Mediasphere
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/clubs">
                <Button variant="ghost">Clubs</Button>
              </Link>
              <Link href="/ai-services">
                <Button variant="ghost">AI Services</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost">Notifications</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/clubs" className="hover:text-blue-600">
            Clubs
          </Link>
          <span>/</span>
          <Link href={`/clubs/${thread.clubId}`} className="hover:text-blue-600">
            {thread.club}
          </Link>
          <span>/</span>
          <span>Discussion</span>
        </div>

        {/* Thread */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  {thread.pinned && <Pin className="h-4 w-4 text-blue-600" />}
                  <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={thread.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {thread.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <Link href={`/profile/${thread.author.name}`} className="font-medium hover:text-blue-600">
                        {thread.author.name}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        {thread.author.role}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      in{" "}
                      <Link href={`/clubs/${thread.clubId}`} className="hover:text-blue-600">
                        {thread.club}
                      </Link>{" "}
                      • {thread.createdAt}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  {thread.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              {thread.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ThumbsUp className="h-4 w-4" />
                {thread.likes}
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {thread.replies}
              </Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Add Comment */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Avatar className="h-8 w-8">
                <AvatarFallback>YU</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea placeholder="Add your thoughts to the discussion..." className="min-h-[100px] mb-4" />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">Be respectful and constructive in your response</div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Post Comment</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Comments ({comments.length})</h2>

          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {comment.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link href={`/profile/${comment.author.name}`} className="font-medium hover:text-blue-600">
                        {comment.author.name}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        {comment.author.role}
                      </Badge>
                      <span className="text-sm text-gray-600">•</span>
                      <span className="text-sm text-gray-600">{comment.createdAt}</span>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <ThumbsUp className="h-3 w-3" />
                        {comment.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Reply className="h-3 w-3" />
                        Reply
                      </Button>
                    </div>

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.author.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {reply.author.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Link
                                  href={`/profile/${reply.author.name}`}
                                  className="font-medium text-sm hover:text-blue-600"
                                >
                                  {reply.author.name}
                                </Link>
                                <Badge variant="secondary" className="text-xs">
                                  {reply.author.role}
                                </Badge>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-600">{reply.createdAt}</span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2 leading-relaxed">{reply.content}</p>
                              <div className="flex items-center gap-3">
                                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                                  <ThumbsUp className="h-3 w-3" />
                                  {reply.likes}
                                </Button>
                                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-xs">
                                  <Reply className="h-3 w-3" />
                                  Reply
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
          ))}
        </div>

        {/* Load More Comments */}
        <div className="text-center mt-8">
          <Button variant="outline">Load More Comments</Button>
        </div>
      </main>
    </div>
  )
}
