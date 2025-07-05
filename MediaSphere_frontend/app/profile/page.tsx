"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, MessageSquare, Calendar, Users, Trophy, Settings, Camera, Upload, Star, Heart, Eye, Sparkles, MapPin, Globe, Loader2, ArrowLeft } from "lucide-react"
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth()
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

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const currentUser = await apiService.getCurrentUser()
      if (!currentUser) return

      const [userData, statsData, clubsData, threadsData, achievementsData] = await Promise.all([
        apiService.getUserProfile(currentUser.id),
        apiService.getUserStats(currentUser.id),
        apiService.getUserClubs(currentUser.id),
        apiService.getUserThreads(currentUser.id),
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
            { label: "Achievements", value: achievements?.length || 0, icon: Trophy, gradient: "from-yellow-500 to-orange-500" },
            { label: "Events", value: userStats?.eventsAttended || 0, icon: Calendar, gradient: "from-purple-500 to-indigo-500" },
            { label: "Clubs", value: userStats?.clubsJoined || 0, icon: Users, gradient: "from-emerald-500 to-teal-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover="hover"
              className="perspective-1000 cursor-pointer"
              onClick={() => setSelectedStatsCard(selectedStatsCard === stat.label ? null : stat.label)}
            >
              <Card className={`bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40 transition-all duration-300 shadow-xl ${selectedStatsCard === stat.label ? 'ring-2 ring-purple-400' : ''}`}>
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
            <TabsList className="grid w-full grid-cols-1 bg-white/10 backdrop-blur-md border-white/20">
              <TabsTrigger value="profile" className="data-[state=active]:bg-white/20 text-white">
                Profile
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

              {/* Stats Details Section */}
              <AnimatePresence>
                {selectedStatsCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-8"
                  >
                    {selectedStatsCard === "Threads" && (
                      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5" />
                            My Threads ({threads.length})
                          </CardTitle>
                          <CardDescription className="text-purple-200">
                            All threads you've created
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {threads.length > 0 ? (
                            <div className="space-y-4">
                              {threads.map((thread, index) => (
                                <motion.div
                                  key={thread.id}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="text-lg font-semibold text-white mb-2">
                                        {thread.title}
                                      </h3>
                                      <div className="flex items-center gap-4 text-sm text-purple-300">
                                        <span className="flex items-center gap-1">
                                          <Users className="w-4 h-4" />
                                          {(thread as any).clubName || 'Unknown Club'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="w-4 h-4" />
                                          {new Date(thread.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MessageSquare className="w-4 h-4" />
                                          {thread.replies || 0} replies
                                        </span>
                                      </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-200 border-blue-300/20">
                                      Thread
                                    </Badge>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <MessageSquare className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                              <p className="text-purple-200">No threads created yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {selectedStatsCard === "Clubs" && (
                      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            My Clubs ({clubs.length})
                          </CardTitle>
                          <CardDescription className="text-purple-200">
                            Clubs you're a member of
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {clubs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {clubs.map((club, index) => (
                                <motion.div
                                  key={club.id}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Link href={`/clubs/${club.id}`}>
                                    <Card className="bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer h-full">
                                      <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                                            <Users className="w-6 h-6 text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-1">
                                              {club.name}
                                            </h3>
                                            <p className="text-purple-200 text-sm mb-3 line-clamp-2">
                                              {club.description || 'No description available'}
                                            </p>
                                            <div className="space-y-1 text-xs text-purple-300">
                                              <div className="flex items-center gap-1">
                                                <Users className="w-3 h-3" />
                                                <span>{(club as any).memberCount || 0} members</span>
                                              </div>
                                              <div className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>Joined {club.joined || 'Recently'}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Users className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                              <p className="text-purple-200">No clubs joined yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {selectedStatsCard === "Achievements" && (
                      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Trophy className="w-5 h-5" />
                            My Achievements ({achievements.length})
                          </CardTitle>
                          <CardDescription className="text-purple-200">
                            Your earned achievements and milestones
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {achievements.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {achievements.map((achievement, index) => (
                                <motion.div
                                  key={achievement.id}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <Card className="bg-white/5 hover:bg-white/10 transition-all duration-300 h-full">
                                    <CardContent className="p-4 text-center">
                                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                                        <Trophy className="w-6 h-6 text-white" />
                                      </div>
                                      <h3 className="text-lg font-semibold text-white mb-2">
                                        {achievement.title}
                                      </h3>
                                      <p className="text-purple-200 text-sm mb-3">
                                        {achievement.description}
                                      </p>
                                      <div className="text-xs text-purple-300">
                                        Earned {achievement.earned}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <Trophy className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                              <p className="text-purple-200">No achievements earned yet</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {selectedStatsCard === "Events" && (
                      <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            My Events ({userStats?.eventsAttended || 0})
                          </CardTitle>
                          <CardDescription className="text-purple-200">
                            Events you've attended
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8">
                            <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-4" />
                            <p className="text-purple-200">Events feature coming soon</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  )
}