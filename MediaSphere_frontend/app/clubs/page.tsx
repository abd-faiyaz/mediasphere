"use client"

// Force dynamic rendering to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Users, Filter, Plus, Loader2, ArrowLeft, AlertTriangle, LogOut } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
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
  isMember?: boolean
  memberCount?: number
}

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("members")
  const [showModal, setShowModal] = useState(false)
  const [modalAction, setModalAction] = useState<'join' | 'leave' | null>(null)
  const [selectedClub, setSelectedClub] = useState<Club | null>(null)
  
  // Leave club modal states
  const [leaveReason, setLeaveReason] = useState("")
  const [isLeavingClub, setIsLeavingClub] = useState(false)
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Debug authentication state
  useEffect(() => {
    console.log('Auth State Debug:', {
      user,
      isAuthenticated,
      authLoading,
      hasToken: !!authService.getToken()
    })
  }, [user, isAuthenticated, authLoading])

  // Redirect to home if user logs out while on a protected area
  useEffect(() => {
    // Only check after auth is loaded and if we're not loading
    if (!authLoading && !isAuthenticated && user === null) {
      // User has explicitly logged out, refresh clubs data for non-authenticated view
      fetchClubs()
    }
  }, [isAuthenticated, authLoading, user])

  // Get unique categories from clubs (using mediaType.name)
  const categories = ["All", ...Array.from(new Set(clubs.map(club => club.mediaType.name)))]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
        duration: 0.6,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      },
    },
    hover: {
      scale: 1.05,
      y: -10,
      rotateY: 5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      },
    },
  }

  // Generate background image for each club based on media type
  const getClubBackgroundImage = (mediaType: string) => {
    const backgrounds: Record<string, string> = {
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
    return backgrounds[mediaType] || backgrounds.default
  }

  // Modal helper functions
  const openJoinModal = (club: Club) => {
    setSelectedClub(club)
    setModalAction('join')
    setShowModal(true)
  }

  const openLeaveModal = (club: Club) => {
    setSelectedClub(club)
    setModalAction('leave')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedClub(null)
    setModalAction(null)
    setLeaveReason("")
    setIsLeavingClub(false)
  }

  const confirmAction = async () => {
    if (!selectedClub || !modalAction) return

    if (modalAction === 'join') {
      await performJoinClub(selectedClub.id)
    } else if (modalAction === 'leave') {
      await performLeaveClub(selectedClub.id, leaveReason)
    }
    
    closeModal()
  }

  // Perform join club action
  const performJoinClub = async (clubId: string) => {
    if (!isAuthenticated) {
      router.push('/sign-in')
      return
    }

    try {
      const token = authService.getToken()
      console.log('Joining club:', clubId)
      console.log('Token:', token)
      console.log('User:', user)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${clubId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error('Failed to join club')
      }

      toast({
        title: "Success",
        description: "Successfully joined the club!",
      })
      
      // Refresh the clubs data to get updated information
      fetchClubs()
    } catch (error) {
      console.error('Error joining club:', error)
      toast({
        title: "Error",
        description: "Failed to join club. Please try again.",
      })
    }
  }

  // Perform leave club action
  const performLeaveClub = async (clubId: string, reason: string = "") => {
    try {
      setIsLeavingClub(true)
      const token = authService.getToken()
      console.log('Leaving club:', clubId)
      console.log('Token:', token)
      console.log('Reason:', reason)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${clubId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error('Failed to leave club')
      }

      toast({
        title: "Success",
        description: "Successfully left the club!",
      })
      
      // Refresh the clubs data to get updated information
      fetchClubs()
    } catch (error) {
      console.error('Error leaving club:', error)
      toast({
        title: "Error",
        description: "Failed to leave club. Please try again.",
      })
    } finally {
      setIsLeavingClub(false)
    }
  }

  // Join club function (now just opens modal)
  const joinClub = (club: Club) => {
    openJoinModal(club)
  }

  // Leave club function (now just opens modal)
  const leaveClub = (club: Club) => {
    openLeaveModal(club)
  }

  // Fetch clubs from backend
  const fetchClubs = async () => {
    try {
      setLoading(true)
      const token = authService.getToken()
      
      // Use different endpoints based on authentication status
      let apiUrl: string
      if (isAuthenticated && token) {
        apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/with-membership`
      } else {
        apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/`
      }
      
      console.log('Fetching clubs from:', apiUrl)
      console.log('Token:', token ? 'Present' : 'Not present')
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to fetch clubs: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Clubs data:', data)
      setClubs(data)
      setFilteredClubs(data)
    } catch (error) {
      console.error('Error fetching clubs:', error)
      toast({
        title: "Error",
        description: `Failed to load clubs: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort clubs
  useEffect(() => {
    let filtered = clubs

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category (mediaType.name)
    if (selectedCategory !== "All") {
      filtered = filtered.filter(club => club.mediaType.name === selectedCategory)
    }

    // Sort clubs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "members":
          // For now, sort by creation date as a proxy for popularity
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "active":
          // For now, sort by creation date as a proxy for activity
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredClubs(filtered)
  }, [clubs, searchTerm, selectedCategory, sortBy])

  // Fetch clubs on component mount
  useEffect(() => {
    fetchClubs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                href={isAuthenticated ? "/profile" : "/"} 
                className="text-2xl font-bold text-gray-900"
              >
                Mediasphere
              </Link>
              
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
                // Authenticated user navigation
                <>
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
                </>
              ) : (
                // Non-authenticated user navigation
                <>
                  <Link href="/">
                    <Button variant="ghost">Home</Button>
                  </Link>
                  <Link href="/clubs">
                    <Button variant="ghost">Clubs</Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="ghost">Sign Up</Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex justify-between items-center mb-8"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Clubs
            </h1>
            <p className="text-gray-600 mt-2">Discover and join communities that match your interests</p>
          </motion.div>
          <motion.div 
            initial={{ x: 50, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/clubs/create">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Club
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white rounded-lg border border-gray-200 p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex-1"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input 
                  placeholder="Search clubs..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex gap-4"
            >
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="members">Most Members</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="active">Most Active</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </motion.div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 text-lg">
              {searchTerm || selectedCategory !== "All" 
                ? "No clubs match your search criteria." 
                : "No clubs available at the moment."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClubs.map((club, index) => (
              <motion.div
                key={club.id}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
                transition={{ delay: index * 0.1 }}
                className="perspective-1000"
              >
                <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer h-full relative group">
                  {/* Background gradient overlay */}
                  <div 
                    className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  />
                  
                  {/* Header with gradient background */}
                  <div 
                    className="h-32 relative overflow-hidden"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-20" />
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 0.6 }}
                      className="absolute top-4 right-4"
                    >
                      <Badge variant="secondary" className="bg-white/90 text-gray-800 shadow-lg">
                        {club.mediaType.name}
                      </Badge>
                    </motion.div>
                    {club.isMember && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                        className="absolute top-4 left-4"
                      >
                        <Badge variant="default" className="bg-green-500/90 text-white shadow-lg">
                          Member
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  <CardHeader className="relative z-10">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}
                    >
                      <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                        <Link href={`/clubs/${club.id}`}>
                          {club.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">
                        {club.description}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="flex justify-between items-center mb-4"
                    >
                      <div className="flex items-center text-sm text-gray-600">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center"
                        >
                          <Users className="h-4 w-4 mr-2 text-blue-500" />
                          <span className="font-medium">
                            {club.memberCount ? `${club.memberCount} members` : new Date(club.createdAt).toLocaleDateString()}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                      className="flex gap-2"
                    >
                      <Link href={`/clubs/${club.id}`} className="flex-1">
                        <motion.div 
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full group-hover:border-blue-500 transition-colors">
                            View Details
                          </Button>
                        </motion.div>
                      </Link>
                      {club.isMember ? (
                        <motion.div 
                          whileHover={{ scale: 1.02, rotateX: 5 }} 
                          whileTap={{ scale: 0.98 }} 
                          className="flex-1"
                        >
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                            whileHover={{
                              boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)",
                              transition: { duration: 0.2 }
                            }}
                          >
                            <Button 
                              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg group relative overflow-hidden transition-all duration-300"
                              onClick={() => leaveClub(club)}
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={false}
                              />
                              <motion.span
                                className="relative z-10 flex items-center gap-2 font-medium"
                                whileHover={{ x: -2 }}
                                transition={{ duration: 0.2 }}
                              >
                                <LogOut className="h-4 w-4" />
                                Leave Club
                              </motion.span>
                            </Button>
                          </motion.div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          whileHover={{ scale: 1.02 }} 
                          whileTap={{ scale: 0.98 }} 
                          className="flex-1"
                        >
                          <Button 
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                            onClick={() => joinClub(club)}
                          >
                            Join Club
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  </CardContent>

                  {/* Decorative elements */}
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ delay: 0.8 + index * 0.1, duration: 1, ease: "easeOut" }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: -360 }}
                    transition={{ delay: 1 + index * 0.1, duration: 1.2, ease: "easeOut" }}
                    className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Load More - Only show if there are more clubs to load */}
        {filteredClubs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-center mt-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="lg">
                Load More Clubs
              </Button>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Enhanced Confirmation Modal */}
      {showModal && selectedClub && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className={`p-2 rounded-full ${
                    modalAction === 'join' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {modalAction === 'join' ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    <LogOut className="h-5 w-5" />
                  )}
                </motion.div>
                <div>
                  <motion.h3
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl font-bold text-gray-900"
                  >
                    {modalAction === 'join' ? 'Join Club' : 'Leave Club'}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm text-gray-500"
                  >
                    {selectedClub.name}
                  </motion.p>
                </div>
              </div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6"
              >
                {modalAction === 'join' ? (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Users className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <p className="text-blue-800">
                      You're about to join <span className="font-semibold">"{selectedClub.name}"</span>. 
                      You'll be able to participate in discussions and events.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200 mb-4">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-800">
                        You're about to leave <span className="font-semibold">"{selectedClub.name}"</span>. 
                        You'll lose access to club discussions and events.
                      </p>
                    </div>

                    {/* Reason Input */}
                    <div className="space-y-3">
                      <Label htmlFor="leave-reason" className="text-sm font-medium text-gray-700">
                        Why are you leaving? <span className="text-gray-400">(Optional)</span>
                      </Label>
                      <Textarea
                        id="leave-reason"
                        placeholder="Help us improve by sharing your reason for leaving..."
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        className="min-h-[80px] resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-400 text-right">
                        {leaveReason.length}/500 characters
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3 justify-end"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={closeModal}
                    disabled={isLeavingClub}
                    className="px-6 py-2 border-gray-300 hover:border-gray-400"
                  >
                    Cancel
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={confirmAction}
                    disabled={isLeavingClub}
                    className={`px-6 py-2 font-medium shadow-lg transition-all duration-200 ${
                      modalAction === 'join' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                    }`}
                  >
                    {isLeavingClub ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Loader2 className="h-4 w-4" />
                        </motion.div>
                        Leaving...
                      </div>
                    ) : (
                      modalAction === 'join' ? 'Join Club' : 'Leave Club'
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
