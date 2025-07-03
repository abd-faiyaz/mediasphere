"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Users, MessageSquare, Calendar, Settings, Plus, Pin, TrendingUp, Loader2, Star, Heart, Eye, Globe, Zap, Award, Sparkles, Crown, Trophy, Activity, ArrowLeft, LogOut, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useEffect, useState, use, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"

interface Club {
  id: string
  name: string
  description: string
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
  createdAt: string
  memberCount: number
  isMember?: boolean
}

interface Thread {
  id: string
  title: string
  content: string
  createdBy: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  createdAt: string
  viewCount: number
  commentCount: number
  isPinned: boolean
  isLocked: boolean
}

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  maxAttendees: number
  currentAttendees: number
  createdBy: {
    id: string
    username: string
  }
  createdAt: string
}

export default function ClubDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [club, setClub] = useState<Club | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [threadsLoading, setThreadsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Leave club modal states
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [leaveReason, setLeaveReason] = useState("")
  const [isLeavingClub, setIsLeavingClub] = useState(false)
  
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: containerRef })
  
  // Parallax effects
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const statsOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // Floating icons for background animation
  const floatingIcons = [
    { icon: Star, delay: 0.5, x: -30, y: -40 },
    { icon: Heart, delay: 0.8, x: 40, y: -30 },
    { icon: Trophy, delay: 1.1, x: -40, y: 30 },
    { icon: Crown, delay: 1.4, x: 30, y: 40 },
    { icon: Sparkles, delay: 1.7, x: 0, y: -50 },
    { icon: Award, delay: 2.0, x: 50, y: 0 },
  ]

  // Fetch club details
  const fetchClubDetails = async () => {
    try {
      setLoading(true)
      console.log('Fetching club details for ID:', resolvedParams.id)
      
      const headers: { [key: string]: string } = {}
      if (isAuthenticated) {
        const token = authService.getToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}`, {
        headers
      })
      
      console.log('Club details response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`Club not found (${response.status})`)
      }

      const clubData = await response.json()
      console.log('Club data loaded:', clubData)
      setClub(clubData)
      
      // Set membership status from the response
      if (isAuthenticated && clubData.isMember !== undefined) {
        setIsMember(clubData.isMember)
      }
      
      toast({
        title: "Success",
        description: `Loaded "${clubData.name}" club details with ${clubData.memberCount} members`,
      })
    } catch (error) {
      console.error('Error fetching club details:', error)
      toast({
        title: "Error",
        description: "Failed to load club details. Please check if the backend is running.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Check membership status
  const checkMembership = async () => {
    if (!isAuthenticated) {
      setIsMember(false)
      return
    }

    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/membership`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const membershipStatus = await response.json()
        setIsMember(membershipStatus)
      }
    } catch (error) {
      console.error('Error checking membership:', error)
      setIsMember(false)
    }
  }

  // Fetch club threads
  const fetchThreads = async () => {
    try {
      setThreadsLoading(true)
      console.log('Fetching threads for club:', resolvedParams.id)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/threads`)
      
      console.log('Threads response status:', response.status)
      
      if (response.ok) {
        const threadsData = await response.json()
        console.log('Threads loaded:', threadsData.length, 'threads')
        setThreads(threadsData)
      } else {
        console.log('No threads found or error occurred')
        setThreads([])
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      setThreads([])
      toast({
        title: "Warning",
        description: "Could not load discussion threads",
        variant: "destructive"
      })
    } finally {
      setThreadsLoading(false)
    }
  }

  // Fetch club events
  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      console.log('Fetching events for club:', resolvedParams.id)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/events`)
      
      console.log('Events response status:', response.status)
      
      if (response.ok) {
        const eventsData = await response.json()
        console.log('Events loaded:', eventsData.length, 'events')
        setEvents(eventsData)
      } else {
        console.log('No events found or error occurred')
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
      toast({
        title: "Warning",
        description: "Could not load club events",
        variant: "destructive"
      })
    } finally {
      setEventsLoading(false)
    }
  }

  // Join club
  const joinClub = async () => {
    if (!isAuthenticated) {
      router.push('/sign-in')
      return
    }

    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to join club')
      }

      // Trigger celebration effects
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)

      toast({
        title: "🎉 Welcome to the club!",
        description: "You've successfully joined the community!",
      })
      
      // Refresh membership status
      await checkMembership()
    } catch (error) {
      console.error('Error joining club:', error)
      toast({
        title: "Error",
        description: "Failed to join club. Please try again.",
      })
    }
  }

  // Leave club with reason
  const leaveClub = async (reason: string) => {
    try {
      setIsLeavingClub(true)
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: reason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to leave club')
      }

      toast({
        title: "Success",
        description: "You have successfully left the club.",
      })
      
      // Close modal and reset state
      setShowLeaveModal(false)
      setLeaveReason("")
      
      // Refresh membership status
      await checkMembership()
    } catch (error) {
      console.error('Error leaving club:', error)
      toast({
        title: "Error",
        description: "Failed to leave club. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLeavingClub(false)
    }
  }

  // Handle leave club confirmation
  const handleLeaveClub = () => {
    if (leaveReason.trim().length < 10) {
      toast({
        title: "Please provide a reason",
        description: "Please tell us why you're leaving (at least 10 characters).",
        variant: "destructive"
      })
      return
    }
    leaveClub(leaveReason.trim())
  }

  // Load data on component mount
  useEffect(() => {
    console.log('Loading club data for ID:', resolvedParams.id)
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
    console.log('Is authenticated:', isAuthenticated)
    console.log('User:', user)
    
    fetchClubDetails()
    checkMembership()
    fetchThreads()
    fetchEvents()
  }, [resolvedParams.id, isAuthenticated])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading club details...</p>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Club Not Found</h1>
          <p className="text-gray-600 mb-6">The club you're looking for doesn't exist.</p>
          <Link href="/clubs">
            <Button>Back to Clubs</Button>
          </Link>
        </div>
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, x: -20, rotateY: -15 },
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
      scale: 1.03,
      rotateY: 5,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      },
    },
  }

  // Generate background image based on media type
  const getMediaTypeGradient = (mediaType: string) => {
    const gradients: Record<string, string> = {
      'Photography': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'Music': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'Video': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'Art': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'Writing': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'Gaming': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'Technology': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      'Sports': 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      'Education': 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      'default': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }
    return gradients[mediaType] || gradients.default
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
              opacity: [0, 0.3, 0],
              scale: [0, 1.5, 0],
              x: [0, item.x, item.x * 2],
              y: [0, item.y, item.y * 2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 8,
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
            <item.icon className="w-8 h-8 text-purple-300/20" />
          </motion.div>
        ))}
      </div>

      {/* Confetti Effect */}
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50"
          >
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  y: -100,
                  x: Math.random() * window.innerWidth,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 100,
                  rotate: 360,
                  opacity: 0,
                }}
                transition={{
                  duration: 3,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
                className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="bg-white/80 backdrop-blur-xl border-b border-white/20 sticky top-0 z-40 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link 
                  href={isAuthenticated ? "/profile" : "/"} 
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  Mediasphere
                </Link>
              </motion.div>
              
              {/* Back Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-xl px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back</span>
                </Button>
              </motion.div>
            </div>
            <nav className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/clubs">
                      <Button variant="ghost" className="hover:bg-blue-50 transition-all duration-300">Clubs</Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/ai-services">
                      <Button variant="ghost" className="hover:bg-purple-50 transition-all duration-300">AI Services</Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/notifications">
                      <Button variant="ghost" className="hover:bg-yellow-50 transition-all duration-300">Notifications</Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/profile">
                      <Button variant="ghost" className="hover:bg-green-50 transition-all duration-300">Profile</Button>
                    </Link>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/">
                      <Button variant="ghost">Home</Button>
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link href="/clubs">
                      <Button variant="ghost">Clubs</Button>
                    </Link>
                  </motion.div>
                  
                </>
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Hero Section with Parallax */}
        <motion.div
          style={{ y: heroY }}
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-3xl border border-white/20 mb-12 shadow-2xl"
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                background: [
                  `radial-gradient(circle at 20% 20%, ${getMediaTypeGradient(club?.mediaType.name || 'default').replace('linear-gradient(135deg, ', '').replace(')', '')})`,
                  `radial-gradient(circle at 80% 80%, ${getMediaTypeGradient(club?.mediaType.name || 'default').replace('linear-gradient(135deg, ', '').replace(')', '')})`,
                  `radial-gradient(circle at 20% 20%, ${getMediaTypeGradient(club?.mediaType.name || 'default').replace('linear-gradient(135deg, ', '').replace(')', '')})`,
                ],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 opacity-10"
            />
          </div>
          
          {/* Hero Header with Gradient */}
          <div 
            className="h-48 relative overflow-hidden"
            style={{ 
              background: `linear-gradient(45deg, ${getMediaTypeGradient(club?.mediaType.name || 'default')})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40" />
            
            {/* Floating Particles in Hero */}
            <div className="absolute inset-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -20, 0],
                    x: [0, Math.random() * 10 - 5, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                  }}
                  className="absolute w-2 h-2 bg-white/30 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                />
              ))}
            </div>
            
            {/* Badge and Member Status */}
            <motion.div
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 200 }}
              className="absolute top-8 right-8"
            >
              <Badge variant="secondary" className="bg-white/95 text-gray-800 shadow-2xl text-lg px-6 py-3 backdrop-blur-sm">
                <Globe className="w-4 h-4 mr-2" />
                {club?.mediaType.name}
              </Badge>
            </motion.div>
            
            {isMember && (
              <motion.div
                initial={{ x: -100, opacity: 0, scale: 0 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.8, type: "spring", stiffness: 150 }}
                className="absolute top-8 left-8"
              >
                <Badge variant="default" className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-2xl px-6 py-3 text-lg">
                  <Crown className="w-4 h-4 mr-2" />
                  ✓ Member
                </Badge>
              </motion.div>
            )}
            
            {/* Decorative Geometric Elements */}
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 1.2, duration: 3, ease: "easeOut" }}
              className="absolute bottom-8 left-12 w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: -180 }}
              transition={{ delay: 1.5, duration: 2.5, ease: "easeOut" }}
              className="absolute top-12 left-1/3 w-6 h-6 rotate-45 bg-white/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.8, duration: 2, ease: "easeOut" }}
              className="absolute bottom-12 right-1/4 w-4 h-4 rounded-full bg-white/30 backdrop-blur-sm"
            />
          </div>

          <div className="relative z-10 p-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
              <div className="flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="mb-8"
                >
                  <motion.h1 
                    className="text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight"
                    whileHover={{ scale: 1.02 }}
                  >
                    {club?.name}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-gray-700 text-xl leading-relaxed max-w-3xl"
                  >
                    {club?.description}
                  </motion.p>
                </motion.div>
                
                {/* Enhanced Stats Section */}
                <motion.div
                  style={{ opacity: statsOpacity }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="flex items-center gap-8"
                >
                  <motion.div 
                    className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"
                    >
                      <Users className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {club?.memberCount?.toLocaleString() || "0"}
                      </div>
                      <div className="text-gray-600 font-medium">Members</div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: -15 }}
                      className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg"
                    >
                      <Calendar className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        Founded
                      </div>
                      <div className="text-gray-600">
                        {club ? new Date(club.createdAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-center gap-4 bg-white/50 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg"
                    whileHover={{ scale: 1.05, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg"
                    >
                      <Activity className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <div className="text-3xl font-bold text-gray-900">
                        {threads.length}
                      </div>
                      <div className="text-gray-600 font-medium">Discussions</div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex flex-col gap-4"
              >
                {!isMember ? (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -3 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-30" />
                    <Button 
                      size="lg" 
                      className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl px-10 py-4 text-xl rounded-2xl transition-all duration-300"
                      onClick={joinClub}
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mr-3"
                      >
                        <Plus className="h-6 w-6" />
                      </motion.div>
                      Join Club
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    whileHover={{ scale: 1.05, y: -3 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur-lg opacity-20" />
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="relative bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-red-200 hover:border-red-300 hover:bg-red-50 px-10 py-4 text-xl rounded-2xl transition-all duration-300 text-red-600 hover:text-red-700"
                      onClick={() => setShowLeaveModal(true)}
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="mr-3"
                      >
                        <LogOut className="h-6 w-6" />
                      </motion.div>
                      Leave Club
                    </Button>
                  </motion.div>
                )}
                
                <motion.div 
                  whileHover={{ scale: 1.05, y: -3 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    variant="outline"
                    size="lg" 
                    className="bg-white/60 backdrop-blur-sm shadow-xl border-2 border-gray-200 hover:border-gray-300 px-10 py-4 text-lg rounded-2xl transition-all duration-300"
                  >
                    <Heart className="mr-3 h-5 w-5" />
                    Follow Updates
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              <Tabs defaultValue="discussions" className="w-full">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6">
                  <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm rounded-2xl p-2">
                    <TabsTrigger 
                      value="discussions" 
                      className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-medium">Discussions</span>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="events" 
                      className="flex items-center gap-3 data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all duration-300 rounded-xl py-3"
                    >
                      <Calendar className="h-5 w-5" />
                      <span className="font-medium">Events</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="discussions" className="p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-center mb-8"
                  >
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent mb-2">
                        Discussion Threads
                      </h2>
                      <p className="text-gray-600">Join the conversation and share your thoughts</p>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg rounded-2xl px-6 py-3">
                        <Plus className="mr-2 h-5 w-5" />
                        New Thread
                      </Button>
                    </motion.div>
                  </motion.div>

                  {threadsLoading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-600" />
                      </motion.div>
                      <p className="text-gray-600 text-lg">Loading discussions...</p>
                    </motion.div>
                  ) : threads.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl"
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, -5, 0] 
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="mb-4"
                      >
                        <MessageSquare className="h-16 w-16 mx-auto text-gray-400" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No discussions yet</h3>
                      <p className="text-gray-600">Be the first to start a conversation!</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      variants={containerVariants} 
                      initial="hidden" 
                      animate="visible" 
                      className="space-y-6"
                    >
                      {threads.map((thread, index) => (
                        <motion.div 
                          key={thread.id} 
                          variants={cardVariants} 
                          whileHover="hover"
                          className="perspective-1000"
                        >
                          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer relative group bg-white/80 backdrop-blur-sm border-0">
                            {/* Enhanced Background gradient overlay */}
                            <div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                              style={{ background: getMediaTypeGradient(club?.mediaType.name || 'default') }}
                            />
                            
                            <CardHeader className="pb-4 relative z-10">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-4 mb-4">
                                    {thread.isPinned && (
                                      <motion.div
                                        initial={{ rotate: -45, scale: 0 }}
                                        animate={{ rotate: 0, scale: 1 }}
                                        transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                                        whileHover={{ rotate: 15, scale: 1.2 }}
                                        className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg"
                                      >
                                        <Pin className="h-4 w-4 text-white" />
                                      </motion.div>
                                    )}
                                    <CardTitle className="text-2xl group-hover:text-blue-600 transition-colors duration-300 font-bold">
                                      <Link href={`/threads/${thread.id}`} className="hover:underline">
                                        {thread.title}
                                      </Link>
                                    </CardTitle>
                                  </div>
                                  <CardDescription className="text-base flex items-center gap-2">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="text-xs">
                                        {thread.createdBy.firstName?.[0]}{thread.createdBy.lastName?.[0]}
                                      </AvatarFallback>
                                    </Avatar>
                                    by <span className="font-semibold text-gray-700">{thread.createdBy.firstName} {thread.createdBy.lastName}</span> 
                                    <span className="text-gray-400">•</span>
                                    <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                                  </CardDescription>
                                </div>
                                <div className="flex items-center gap-6">
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors bg-blue-50 rounded-lg px-3 py-2"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="font-semibold">{thread.viewCount}</span>
                                  </motion.div>
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.8 + index * 0.1 }}
                                    whileHover={{ scale: 1.2, y: -2 }}
                                    className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors bg-green-50 rounded-lg px-3 py-2"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    <span className="font-semibold">{thread.commentCount}</span>
                                  </motion.div>
                                </div>
                              </div>
                            </CardHeader>
                            
                            {/* Enhanced Decorative elements */}
                            <motion.div
                              initial={{ scale: 0, rotate: 0 }}
                              animate={{ scale: 1, rotate: 360 }}
                              transition={{ delay: 1 + index * 0.1, duration: 2, ease: "easeOut" }}
                              className="absolute top-4 right-4 w-3 h-3 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                              style={{ background: getMediaTypeGradient(club?.mediaType.name || 'default') }}
                            />
                            <motion.div
                              initial={{ scale: 0, rotate: 0 }}
                              animate={{ scale: 1, rotate: -180 }}
                              transition={{ delay: 1.2 + index * 0.1, duration: 1.5, ease: "easeOut" }}
                              className="absolute bottom-4 left-4 w-2 h-2 rounded-full opacity-30 group-hover:opacity-60 transition-opacity"
                              style={{ background: getMediaTypeGradient(club?.mediaType.name || 'default') }}
                            />
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="events" className="p-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex justify-between items-center mb-8"
                  >
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent mb-2">
                        Upcoming Events
                      </h2>
                      <p className="text-gray-600">Don't miss out on exciting happenings</p>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.05, y: -2 }} 
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg rounded-2xl px-6 py-3">
                        <Plus className="mr-2 h-5 w-5" />
                        Create Event
                      </Button>
                    </motion.div>
                  </motion.div>

                  {eventsLoading ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Loader2 className="h-8 w-8 mx-auto mb-4 text-purple-600" />
                      </motion.div>
                      <p className="text-gray-600 text-lg">Loading events...</p>
                    </motion.div>
                  ) : events.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl"
                    >
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, -5, 5, 0] 
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity, 
                          ease: "easeInOut" 
                        }}
                        className="mb-4"
                      >
                        <Calendar className="h-16 w-16 mx-auto text-gray-400" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No upcoming events</h3>
                      <p className="text-gray-600">Stay tuned for exciting events!</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      variants={containerVariants} 
                      initial="hidden" 
                      animate="visible" 
                      className="space-y-6"
                    >
                      {events.map((event, index) => (
                        <motion.div 
                          key={event.id} 
                          variants={cardVariants} 
                          whileHover="hover"
                          className="perspective-1000"
                        >
                          <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer relative group bg-white/80 backdrop-blur-sm border-0">
                            {/* Enhanced Background gradient overlay */}
                            <div 
                              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                              style={{ background: getMediaTypeGradient(club?.mediaType.name || 'default') }}
                            />
                            
                            <CardHeader className="relative z-10">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <CardTitle className="text-2xl group-hover:text-purple-600 transition-colors duration-300 font-bold mb-3">
                                    <Link href={`/events/${event.id}`} className="hover:underline">
                                      {event.title}
                                    </Link>
                                  </CardTitle>
                                  
                                  <div className="flex items-center gap-6 text-gray-600 mb-4">
                                    <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
                                      <Calendar className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium">{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
                                      <Users className="h-4 w-4 text-green-600" />
                                      <span className="font-medium">{event.currentAttendees}/{event.maxAttendees}</span>
                                    </div>
                                  </div>
                                  
                                  <p className="text-gray-700">{event.description}</p>
                                </div>
                              </div>
                            </CardHeader>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>

          {/* Enhanced Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="space-y-6"
          >
            {/* Club Stats Card */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                Club Statistics
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Total Members", value: club?.memberCount?.toLocaleString() || "0", icon: "👥", color: "from-blue-500 to-blue-600" },
                  { label: "Active Discussions", value: threads.length.toString(), icon: "💬", color: "from-green-500 to-green-600" },
                  { label: "Upcoming Events", value: events.length.toString(), icon: "📅", color: "from-purple-500 to-purple-600" },
                  { label: "Founded", value: club ? new Date(club.createdAt).getFullYear().toString() : "", icon: "🏆", color: "from-yellow-500 to-yellow-600" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 10 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        whileHover={{ scale: 1.3, rotate: 15 }}
                        className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg shadow-lg`}
                      >
                        <span className="text-lg">{stat.icon}</span>
                      </motion.div>
                      <span className="font-medium text-gray-700">{stat.label}</span>
                    </div>
                    <span className="font-bold text-xl text-gray-900">{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            
            {/* Activity Feed */}
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
            >
              <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-purple-600 bg-clip-text text-transparent">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { action: "New member joined", time: "2 hours ago", icon: Users },
                  { action: "Discussion started", time: "5 hours ago", icon: MessageSquare },
                  { action: "Event created", time: "1 day ago", icon: Calendar },
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2 + index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:shadow-md transition-all duration-300"
                  >
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg"
                    >
                      <activity.icon className="h-4 w-4 text-blue-600" />
                    </motion.div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Leave Club Confirmation Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <Dialog open={showLeaveModal} onOpenChange={setShowLeaveModal}>
            <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <DialogHeader className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="mx-auto mb-4 p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-full w-fit"
                  >
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </motion.div>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    Leave {club?.name}?
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-600 mt-2">
                    Are you sure you want to leave this club? You'll lose access to all discussions and events.
                  </DialogDescription>
                </DialogHeader>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6 mt-6"
                >
                  <div className="space-y-3">
                    <Label htmlFor="leaveReason" className="text-base font-semibold text-gray-700">
                      Why are you leaving? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="leaveReason"
                      placeholder="Please tell us why you're leaving this club. Your feedback helps us improve the community experience..."
                      value={leaveReason}
                      onChange={(e) => setLeaveReason(e.target.value)}
                      className="min-h-[120px] bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:border-red-300 rounded-xl transition-all duration-300 text-base"
                      disabled={isLeavingClub}
                    />
                    <p className="text-sm text-gray-500">
                      Minimum 10 characters required ({leaveReason.length}/10)
                    </p>
                  </div>
                </motion.div>

                <DialogFooter className="flex gap-3 mt-8">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowLeaveModal(false)
                        setLeaveReason("")
                      }}
                      disabled={isLeavingClub}
                      className="w-full py-3 text-base border-2 border-gray-200 hover:border-gray-300 rounded-xl transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleLeaveClub}
                      disabled={isLeavingClub || leaveReason.trim().length < 10}
                      className="w-full py-3 text-base bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLeavingClub ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <Loader2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <LogOut className="mr-2 h-5 w-5" />
                      )}
                      {isLeavingClub ? "Leaving..." : "Leave Club"}
                    </Button>
                  </motion.div>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
