"use client"

import Head from "next/head"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, MessageSquare, Calendar, Users, Trophy, Settings, Camera, Upload, Star, Heart, Eye, Sparkles, MapPin, Globe, Loader2, ArrowLeft, LogOut } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { apiService, type User, type Club, type Thread, type Comment, type UserStats, type Achievement } from "@/lib/api-service"
import { authService } from "@/lib/auth-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [clubs, setClubs] = useState<Club[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false)
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null)
  const [selectedStatsCard, setSelectedStatsCard] = useState<string | null>(null)
  const [floatingParticles, setFloatingParticles] = useState<Array<{id: number, x: number, y: number, delay: number, duration: number}>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading, user: authUser, logout } = useAuth()
  const router = useRouter()

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/sign-in')
      return
    }
  }, [isAuthenticated, authLoading, router])

  // Enhanced form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    bio: "",
    location: "",
    website: ""
  })

  // Floating particles animation
  const floatingParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4
  }))

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  const loadUserData = async () => {
    try {
      setLoading(true)
      const currentUser = await apiService.getCurrentUser()
      if (!currentUser) return

      const [userData, statsData, clubsData, threadsData, achievementsData] = await Promise.all([
        apiService.getUserProfile(currentUser.id),
        apiService.getUserStats(currentUser.id),
        fetchUserClubsWithDetails(currentUser.id),
        fetchUserThreadsWithClubNames(currentUser.id),
        Promise.resolve(apiService.getUserAchievements(currentUser.id))
      ])

      setUser(userData)
      setUserStats(statsData)
      setClubs(clubsData || [])
      setThreads(threadsData || [])
      setAchievements(achievementsData || [])
      
      if (userData) {
        setFormData({
          username: userData.username || "",
          email: userData.email || "",
          bio: userData.bio || "",
          location: "", // Add these when available in API
          website: ""
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Load user data effect
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadUserData()
    }
  }, [isAuthenticated, authLoading])

  // Fetch user clubs with member count and join date from backend
  const fetchUserClubsWithDetails = async (userId: string): Promise<Club[]> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/users/${userId}/clubs`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })

      if (!response.ok) {
        return []
      }

      const clubs = await response.json()
      
      // Fetch additional details for each club
      const clubsWithDetails = await Promise.all(
        clubs.map(async (club: any) => {
          try {
            // Fetch club details including member count
            const clubDetailResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${club.id}`, {
              headers: {
                'Authorization': `Bearer ${authService.getToken()}`
              }
            })
            
            if (clubDetailResponse.ok) {
              const clubDetails = await clubDetailResponse.json()
              
              // Get join date from user_clubs table
              const membersResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${club.id}/members`, {
                headers: {
                  'Authorization': `Bearer ${authService.getToken()}`
                }
              })
              
              let joinedDate = 'Recently'
              if (membersResponse.ok) {
                const members = await membersResponse.json()
                const userMembership = members.find((member: any) => member.user?.id === userId)
                if (userMembership?.joinedAt) {
                  joinedDate = new Date(userMembership.joinedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short',
                    day: 'numeric'
                  })
                }
              }
              
              return {
                ...club,
                memberCount: clubDetails.memberCount || 0,
                joined: joinedDate
              }
            }
            
            return {
              ...club,
              memberCount: 0,
              joined: 'Recently'
            }
          } catch (error) {
            console.error(`Error fetching details for club ${club.id}:`, error)
            return {
              ...club,
              memberCount: 0,
              joined: 'Recently'
            }
          }
        })
      )
      
      return clubsWithDetails
    } catch (error) {
      console.error('Error fetching user clubs:', error)
      return []
    }
  }

  // Fetch user threads with club names, comments count, and likes count from backend
  const fetchUserThreadsWithClubNames = async (userId: string): Promise<Thread[]> => {
    try {
      // First get all threads created by the user
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      })

      if (!response.ok) {
        return []
      }

      const allThreads = await response.json()
      
      // Filter threads created by the current user
      const userThreads = allThreads.filter((thread: any) => thread.createdBy?.id === userId || thread.authorId === userId)
      
      // Fetch club details, comments count, and likes count for each thread
      const threadsWithFullDetails = await Promise.all(
        userThreads.map(async (thread: any) => {
          try {
            // Fetch club name
            let clubName = 'Unknown Club'
            if (thread.clubId || thread.club?.id) {
              const clubId = thread.clubId || thread.club?.id
              const clubResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${clubId}`, {
                headers: {
                  'Authorization': `Bearer ${authService.getToken()}`
                }
              })
              
              if (clubResponse.ok) {
                const clubData = await clubResponse.json()
                clubName = clubData.name
              }
            }

            // Fetch comments count
            let commentsCount = 0
            try {
              const commentsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${thread.id}/comments`, {
                headers: {
                  'Authorization': `Bearer ${authService.getToken()}`
                }
              })
              
              if (commentsResponse.ok) {
                const comments = await commentsResponse.json()
                commentsCount = Array.isArray(comments) ? comments.length : 0
              }
            } catch (error) {
              console.error(`Error fetching comments for thread ${thread.id}:`, error)
            }

            // Fetch likes count
            let likesCount = 0
            try {
              const likesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/threads/${thread.id}/likes`, {
                headers: {
                  'Authorization': `Bearer ${authService.getToken()}`
                }
              })
              
              if (likesResponse.ok) {
                const likes = await likesResponse.json()
                likesCount = Array.isArray(likes) ? likes.length : (likes.count || 0)
              }
            } catch (error) {
              console.error(`Error fetching likes for thread ${thread.id}:`, error)
            }
            
            return {
              ...thread,
              clubName,
              commentsCount,
              likesCount,
              replies: commentsCount // Keep replies for backward compatibility
            }
          } catch (error) {
            console.error(`Error fetching details for thread ${thread.id}:`, error)
            return {
              ...thread,
              clubName: 'Unknown Club',
              commentsCount: 0,
              likesCount: 0,
              replies: 0
            }
          }
        })
      )
      
      return threadsWithFullDetails
    } catch (error) {
      console.error('Error fetching user threads:', error)
      return []
    }
  }

  const handleProfilePicSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setProfilePicPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    handleProfilePicUpload(file)
  }

  const handleProfilePicUpload = async (file: File) => {
    try {
      setUploadingProfilePic(true)
      
      const formData = new FormData()
      formData.append("profilePicture", file)
      
      // For now, we'll use updateUserProfile with the profilePic field
      const updatedUser = await apiService.updateUserProfile(user!.id, { profilePic: URL.createObjectURL(file) })
      if (updatedUser) {
        setUser(updatedUser)
      }
      setProfilePicPreview(null)
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully!"
      })
    } catch (error) {
      console.error("Error uploading profile picture:", error)
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive"
      })
      setProfilePicPreview(null)
    } finally {
      setUploadingProfilePic(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      if (!user) return

      const updatedUser = await apiService.updateUserProfile(user.id, {
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      })
      
      if (updatedUser) {
        setUser(updatedUser)
        setIsEditing(false)
        
        toast({
          title: "Success",
          description: "Profile updated successfully!"
        })
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      })
      // Navigation is handled by the auth context
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      })
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  const cardVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      rotateX: -15
    },
    visible: {
      scale: 1,
      opacity: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  }

  const profileHeaderVariants = {
    hidden: { 
      scale: 0.5, 
      opacity: 0,
      y: -50
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.3
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
          className="w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Profile Not Available</h2>
          <p className="text-purple-200 mb-6">Please log in to view your profile.</p>
          <Link href="/sign-in">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Sign In
            </Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      <Head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      {/* Prevent caching */}
      <Head>
        <meta httpEquiv="Cache-Control" content="no-store, no-cache, must-revalidate, proxy-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>

      {/* Back Button - Floating */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="fixed top-6 left-6 z-50"
      >
        <motion.button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-xl shadow-2xl border border-white/30 transition-all duration-300 hover:bg-white/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back</span>
        </motion.button>
      </motion.div>

      {/* Logout Button - Floating */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="fixed top-6 right-6 z-50"
      >
        <motion.button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-4 py-2 rounded-xl shadow-2xl border border-white/30 transition-all duration-300 hover:bg-white/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut className="h-4 w-4" />
          <span className="font-medium">Logout</span>
        </motion.button>
      </motion.div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {floatingParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              scale: 0
            }}
            animate={{
              y: [`${particle.y}vh`, `${particle.y - 20}vh`, `${particle.y}vh`],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Profile Header */}
        <motion.div 
          className="text-center mb-12"
          variants={profileHeaderVariants}
        >
          <div className="relative inline-block group perspective-1000">
            <motion.div
              className="relative"
              whileHover={{ 
                rotateY: 10,
                scale: 1.05
              }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="w-40 h-40 mx-auto mb-6 border-4 border-white/20 shadow-2xl group-hover:shadow-purple-500/50 transition-shadow duration-300">
                <AvatarImage 
                  src={profilePicPreview || user?.profilePic || "/placeholder-user.jpg"} 
                  alt={user?.username || "User"} 
                />
                <AvatarFallback className="text-6xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Profile Picture Upload Overlay */}
              <motion.button
                className="absolute bottom-6 right-4 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingProfilePic}
                whileHover={{ scale: 1.1, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                {uploadingProfilePic ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Upload className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </motion.button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePicSelect}
                className="hidden"
              />
            </motion.div>

            {/* Sparkle Effects */}
            <motion.div
              className="absolute -top-4 -right-4 text-yellow-400"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <motion.div
              className="absolute -bottom-4 -left-4 text-pink-400"
              animate={{
                rotate: [360, 0],
                scale: [1, 1.3, 1]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Star className="w-6 h-6" />
            </motion.div>
          </div>

          <motion.h1 
            className="text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {user?.username}
          </motion.h1>
          
          <motion.p 
            className="text-xl text-purple-200 mb-6 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            {user?.bio || "Welcome to my MediaSphere profile! 🚀"}
          </motion.p>

          {/* User Details */}
          <motion.div 
            className="flex flex-wrap items-center justify-center gap-6 mb-8 text-purple-200"
            variants={itemVariants}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'Unknown'}</span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex gap-4 justify-center"
            variants={itemVariants}
          >
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="editing"
                  className="flex gap-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="view"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12"
          variants={itemVariants}
        >
          {[
            { label: "Threads", value: userStats?.threadsCreated || 0, icon: MessageSquare, gradient: "from-blue-500 to-cyan-500" },
            { label: "Comments", value: userStats?.commentsPosted || 0, icon: Heart, gradient: "from-pink-500 to-rose-500" },
            { label: "Events", value: userStats?.eventsAttended || 0, icon: Calendar, gradient: "from-purple-500 to-indigo-500" },
            { label: "Clubs", value: userStats?.clubsJoined || 0, icon: Users, gradient: "from-emerald-500 to-teal-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover="hover"
              className="perspective-1000"
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl">
                <CardContent className="p-6 text-center">
                  <motion.div
                    className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 15 }}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <motion.div
                    className="text-3xl font-bold text-white mb-2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring" }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-purple-200">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-md border-white/20">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white/20 text-white">
                Profile
              </TabsTrigger>
              <TabsTrigger value="threads" className="data-[state=active]:bg-white/20 text-white">
                Threads
              </TabsTrigger>
              <TabsTrigger value="clubs" className="data-[state=active]:bg-white/20 text-white">
                Clubs
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-white/20 text-white">
                Achievements
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-8">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="edit-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Settings className="w-5 h-5" />
                          Edit Profile
                        </CardTitle>
                        <CardDescription className="text-purple-200">
                          Update your profile information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="username" className="text-white">Username</Label>
                            <Input
                              id="username"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                              placeholder="Enter username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="bg-white/10 border-white/20 text-white placeholder:text-purple-200"
                              placeholder="Enter email"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-white">Bio</Label>
                          <Textarea
                            id="bio"
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder:text-purple-200 min-h-[100px]"
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="view-profile"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                      <CardHeader>
                        <CardTitle className="text-white">Profile Information</CardTitle>
                        <CardDescription className="text-purple-200">
                          Your personal information and settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label className="text-purple-200">Username</Label>
                            <p className="text-white text-lg">{user.username}</p>
                          </div>
                          <div>
                            <Label className="text-purple-200">Email</Label>
                            <p className="text-white text-lg">{user.email}</p>
                          </div>
                        </div>
                        {user.bio && (
                          <div>
                            <Label className="text-purple-200">Bio</Label>
                            <p className="text-white text-lg leading-relaxed">{user.bio}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Threads Tab */}
            <TabsContent value="threads" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {threads.length > 0 ? (
                  threads.map((thread, index) => (
                    <motion.div
                      key={thread.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 10 }}
                    >
                      <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-white mb-2">
                                {thread.title}
                              </h3>
                              <p className="text-purple-200 mb-4 line-clamp-2">
                                {thread.content}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-purple-300">
                                <span className="flex items-center gap-1">
                                  <MessageSquare className="w-4 h-4" />
                                  {thread.replies || 0} replies
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  {thread.likes || 0} likes
                                </span>
                                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-white/20"
                            >
                              Discussion
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <MessageSquare className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No threads yet</h3>
                    <p className="text-purple-200 mb-6">Start creating threads to share your thoughts!</p>
                    <Link href="/threads">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Create Thread
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Clubs Tab */}
            <TabsContent value="clubs" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {clubs.length > 0 ? (
                  clubs.map((club, index) => (
                    <motion.div
                      key={club.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      className="perspective-1000"
                    >
                      <Link href={`/clubs/${club.id}`}>
                        <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl h-full">
                          <CardContent className="p-6">
                            <div className="text-center mb-4">
                              <motion.div
                                className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg"
                                whileHover={{ scale: 1.1, rotate: 15 }}
                              >
                                <Users className="w-8 h-8 text-white" />
                              </motion.div>
                              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                                {club.name}
                              </h3>
                              <p className="text-purple-200 text-sm line-clamp-2 mb-4">
                                {club.description}
                              </p>
                              <div className="flex items-center justify-center gap-4 text-xs text-purple-300">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {club.role || 'Member'}
                                </span>
                                <Badge 
                                  variant="secondary" 
                                  className="bg-white/10 text-white border-white/20 text-xs"
                                >
                                  Club
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full text-center py-12"
                  >
                    <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No clubs joined</h3>
                    <p className="text-purple-200 mb-6">Join clubs to connect with people who share your interests!</p>
                    <Link href="/clubs">
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        Explore Clubs
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {achievements.length > 0 ? (
                  achievements.map((achievement, index) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      className="perspective-1000"
                    >
                      <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl">
                        <CardContent className="p-6 text-center">
                          <motion.div
                            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg"
                            whileHover={{ scale: 1.1, rotate: 15 }}
                          >
                            <Trophy className="w-8 h-8 text-white" />
                          </motion.div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {achievement.title}
                          </h3>
                          <p className="text-purple-200 text-sm mb-4">
                            {achievement.description}
                          </p>
                          <div className="text-xs text-purple-300">
                            {achievement.earned}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="col-span-full text-center py-12"
                  >
                    <Trophy className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No achievements yet</h3>
                    <p className="text-purple-200 mb-6">Start participating to unlock achievements!</p>
                  </motion.div>
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}