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
import { Search, Users, Filter, Plus, Loader2, ArrowLeft, AlertTriangle, LogOut, Star, Heart, Trophy, Crown, Sparkles, Award, Activity, Globe, Zap } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"
import { AnimatedDots } from './components/AnimatedDots';

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
  const [clubView, setClubView] = useState<'all' | 'my'>('all')
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
  const { user, isLoading: authLoading } = useAuth()
  const { isSignedIn } = useUser()
  const router = useRouter()

  // Debug authentication state
  useEffect(() => {
    console.log('Auth State Debug:', {
      user,
      isSignedIn,
      authLoading,
      hasToken: !!authService.getToken()
    })
  }, [user, isSignedIn, authLoading])

  // Redirect to home if user logs out while on a protected area
  useEffect(() => {
    // Only check after auth is loaded and if we're not loading
    if (!authLoading && !isSignedIn && user === null) {
      // User has explicitly logged out, refresh clubs data for non-authenticated view
      fetchClubs()
    }
  }, [isSignedIn, authLoading, user])

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
      'Photography': 'linear-gradient(135deg, #1E3A8A 0%, #90CAF9 100%)',
      'Music': 'linear-gradient(135deg, #1E3A8A 0%, #90CAF9 70%)',
      'Video': 'linear-gradient(135deg, #90CAF9 0%, #1E3A8A 100%)',
      'Art': 'linear-gradient(135deg, #1E3A8A 30%, #90CAF9 100%)',
      'Writing': 'linear-gradient(135deg, #90CAF9 30%, #1E3A8A 100%)',
      'Gaming': 'linear-gradient(135deg, #1E3A8A 10%, #90CAF9 90%)',
      'Technology': 'linear-gradient(135deg, #90CAF9 10%, #1E3A8A 90%)',
      'Sports': 'linear-gradient(135deg, #1E3A8A 50%, #90CAF9 100%)',
      'Education': 'linear-gradient(135deg, #90CAF9 50%, #1E3A8A 100%)',
      'default': 'linear-gradient(135deg, #1E3A8A 0%, #90CAF9 100%)'
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
    if (!isSignedIn) {
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
      if (isSignedIn && token) {
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

    // Filter by clubView
    if (clubView === 'my') {
      filtered = filtered.filter(club => club.isMember || (user && club.createdBy.id === user.id))
    }

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
  }, [clubs, searchTerm, selectedCategory, sortBy, clubView, user])

  // Fetch clubs on component mount
  useEffect(() => {
    fetchClubs()
  }, [])

  // Infinite scroll states
  const [visibleCount, setVisibleCount] = useState(9); // Show 9 clubs initially
  const clubsPerPage = 9;

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        visibleCount < filteredClubs.length
      ) {
        setVisibleCount((prev) => Math.min(prev + clubsPerPage, filteredClubs.length));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [visibleCount, filteredClubs.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center relative overflow-hidden">
        <div className="text-center bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-[#90CAF9]/20 relative z-10">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="relative inline-block"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] rounded-full blur-xl opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] p-6 rounded-full">
              <Loader2 className="h-10 w-10 text-white" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 space-y-3"
          >
            <h3 className="text-xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent">
              Loading Clubs
            </h3>
            <p className="text-[#333333]/70 font-['Open Sans']">
              Please wait while we fetch the latest clubs
            </p>
          </motion.div>
        </div>

        {/* Loading state background effects */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-gradient-to-r from-[#1E3A8A]/10 to-[#90CAF9]/10 rounded-full blur-3xl"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#f7ecdf] overflow-hidden">
      {/* Rest of the page content */}
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        // transition={{ duration: 0.3, ease: "easeOut" }}
        className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href={isSignedIn ? "/profile" : "/"}
                className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] bg-clip-text text-transparent transition-all duration-300 hover:scale-105 inline-block"
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
              >                  <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 rounded-xl px-3 py-2"
              >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back</span>
                </Button>
              </motion.div>
            </div>
            <nav className="flex items-center space-x-4">
              {isSignedIn ? (
                // Authenticated user navigation
                <>
                  <Link href="/clubs">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Clubs</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                  <Link href="/ai-services">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">AI Services</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Notifications</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Profile</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                </>
              ) : (
                // Non-authenticated user navigation
                <>
                  <Link href="/">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Home</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                  <Link href="/clubs">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Clubs</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Sign In</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Sign Up</span>
                      <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                    </Button>
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
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex justify-between items-center mb-8"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
          >
            <div className="relative">
              <h1 className="text-5xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent pb-2 relative">
                Clubs
                <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] rounded-full"></div>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[#333333] mt-4 font-['Open Sans'] text-lg tracking-wide"
              >
                Discover and join communities that match your interests
              </motion.p>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex flex-col items-end gap-2">
              { isSignedIn && (
                <Link href="/clubs/create">
                <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Club
                </Button>
              </Link>
              )}
              {/* Club View Segmented Toggle Button */}
              <div className="mt-2 flex rounded-lg overflow-hidden border border-[#90CAF9]/30 bg-white shadow-sm">
                <button
                  className={`px-4 py-2 font-['Nunito'] text-sm font-semibold transition-colors duration-200 focus:outline-none ${clubView === 'all' ? 'bg-[#90CAF9] text-white' : 'bg-white text-[#1E3A8A] hover:bg-[#F0F7FF]'}`}
                  onClick={() => setClubView('all')}
                  aria-pressed={clubView === 'all'}
                >
                  All Clubs
                </button>
                <button
                  className={`px-4 py-2 font-['Nunito'] text-sm font-semibold transition-colors duration-200 focus:outline-none ${clubView === 'my' ? 'bg-[#90CAF9] text-white' : 'bg-white text-[#1E3A8A] hover:bg-[#F0F7FF]'}`}
                  onClick={() => setClubView('my')}
                  aria-pressed={clubView === 'my'}
                >
                  My Clubs
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-xl border border-[#90CAF9]/30 p-6 mb-8 shadow-[0_5px_20px_-5px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] transition-shadow duration-300"
        >
          <div className="flex flex-col md:flex-row gap-4">
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
              className="flex-1"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1E3A8A] h-4 w-4" />
                <Input
                  placeholder="Search clubs..."
                  className="pl-10 bg-gradient-to-r from-[#F0F7FF]/50 to-white border-[#90CAF9]/30 text-[#333333] placeholder-[#90CAF9]/70 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] rounded-xl shadow-[inset_0_2px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_8px_-2px_rgba(0,0,0,0.08)] transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
              className="flex gap-4"
            >
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-[#90CAF9]/30 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
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
                <SelectTrigger className="w-40 border-[#90CAF9]/30 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl border border-[#90CAF9]/30 p-8 max-w-md mx-auto shadow-xl"
            >
              <Users className="h-12 w-12 mx-auto mb-4 text-[#1E3A8A] opacity-50" />
              <h3 className="text-xl font-['Nunito'] font-bold text-[#1E3A8A] mb-2">
                {clubView === 'my' && !isSignedIn
                  ? "Please login first"
                  : searchTerm || selectedCategory !== "All"
                    ? "No Matches Found"
                    : "Coming Soon"}
              </h3>
              <p className="text-[#333333] text-lg font-['Open Sans']">
                {clubView === 'my' && !isSignedIn
                  ? "You need to be logged in to view your clubs."
                  : searchTerm || selectedCategory !== "All"
                    ? "No clubs match your search criteria."
                    : "No clubs available at the moment."}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClubs.slice(0, visibleCount).map((club, index) => (
              <motion.div
                key={club.id}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
                className="perspective-1000"
              >
                <Card className="overflow-hidden hover:shadow-[0_8px_28px_-6px_rgba(30,58,138,0.12)] hover:scale-[1.02] transition-all duration-500 cursor-pointer h-full relative group bg-white/90 backdrop-blur-xl border-[#90CAF9]/30 rounded-xl transform hover:-translate-y-1">
                  {/* Background gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  />

                  {/* Header with gradient background */}
                  <div
                    className="h-32 relative overflow-hidden"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-10" />
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="absolute top-4 right-4"
                    >
                      <Badge variant="secondary" className="bg-[#1E3A8A] text-white font-['Nunito'] font-medium shadow-[0_2px_8px_-1px_rgba(30,58,138,0.25)] px-4 py-1 rounded-full hover:scale-105 transition-transform">
                        {club.mediaType.name}
                      </Badge>
                    </motion.div>
                    {club.isMember && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="absolute top-4 left-4"
                      >
                        <Badge variant="default" className="bg-[#1E3A8A] text-white font-['Nunito'] font-medium shadow-md">
                          Member
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  <CardHeader className="relative z-10">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <CardTitle className="text-xl mb-2 group-hover:text-[#1E3A8A] transition-colors text-[#333333] font-['Nunito']">
                        <Link href={`/clubs/${club.id}`}>
                          {club.name}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm text-[#333333]/70 font-['Open Sans']">
                        {club.description}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="flex justify-between items-center mb-4"
                    >
                      <div className="flex items-center text-sm text-[#333333]/70">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          className="flex items-center"
                        >
                          <Users className="h-4 w-4 mr-2 text-[#1E3A8A]" />
                          <span className="font-medium">
                            {club.memberCount ? `${club.memberCount} members` : new Date(club.createdAt).toLocaleDateString()}
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="flex gap-2"
                    >
                      <Link href={`/clubs/${club.id}`} className="flex-1">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button variant="outline" className="w-full group-hover:border-[#1E3A8A] text-[#333333] border-[#90CAF9]/50 hover:bg-[#F0F7FF] font-['Open Sans'] transition-colors">
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
                            transition={{ duration: 0.5 }}
                            whileHover={{
                              boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)",
                              transition: { duration: 0.2 }
                            }}
                          >
                            <Button
                              className="w-full bg-red-500 hover:bg-red-600 shadow-md group relative overflow-hidden transition-all duration-300 text-white"
                              onClick={() => leaveClub(club)}
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                initial={false}
                              />
                              <motion.span
                                className="relative z-10 flex items-center gap-2 font-medium font-['Nunito']"
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
                        >                              <Button
                          className="w-full bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Nunito'] font-medium shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
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
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: -360 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: getClubBackgroundImage(club.mediaType.name) }}
                  />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Infinite scroll replaces Load More button */}
        {/* No button here, clubs load as you scroll */}
      </main>

      {/* Enhanced Confirmation Modal */}
      <AnimatePresence>
        {showModal && selectedClub && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#90CAF9]/30"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className={`p-2 rounded-full ${modalAction === 'join'
                      ? 'bg-[#90CAF9]/20 text-[#1E3A8A]'
                      : 'bg-red-100 text-red-500'
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
                      className="text-xl font-bold text-[#333333] font-['Nunito']"
                    >
                      {modalAction === 'join' ? 'Join Club' : 'Leave Club'}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-sm text-[#333333]/70 font-['Open Sans']"
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
                    <div className="flex items-center gap-3 p-4 bg-[#90CAF9]/10 rounded-xl border border-[#90CAF9]/20">
                      <Users className="h-5 w-5 text-[#1E3A8A] flex-shrink-0" />
                      <p className="text-[#333333] font-['Open Sans']">
                        You're about to join <span className="font-semibold text-[#1E3A8A]">"{selectedClub.name}"</span>.
                        You'll be able to participate in discussions and events.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100 mb-4">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        <p className="text-[#333333] font-['Open Sans']">
                          You're about to leave <span className="font-semibold text-red-500">"{selectedClub.name}"</span>.
                          You'll lose access to club discussions and events.
                        </p>
                      </div>

                      {/* Reason Input */}
                      <div className="space-y-3">
                        <Label htmlFor="leave-reason" className="text-sm font-medium text-[#333333] font-['Open Sans']">
                          Why are you leaving? <span className="text-[#333333]/50">(Optional)</span>
                        </Label>
                        <Textarea
                          id="leave-reason"
                          placeholder="Help us improve by sharing your reason for leaving..."
                          value={leaveReason}
                          onChange={(e) => setLeaveReason(e.target.value)}
                          className="min-h-[80px] resize-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] bg-[#F0F7FF]/50 border-[#90CAF9]/30 text-[#333333] placeholder-[#90CAF9]/70 font-['Open Sans']"
                          maxLength={500}
                        />
                        <p className="text-xs text-[#333333]/50 text-right font-['Open Sans']">
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
                      className="px-6 py-2 border-[#90CAF9]/30 hover:border-[#1E3A8A] text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF]/50 font-['Open Sans']"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={confirmAction}
                      disabled={isLeavingClub}
                      className={`px-6 py-2 font-medium shadow-md transition-all duration-200 ${modalAction === 'join'
                        ? 'bg-[#1E3A8A] hover:bg-[#15306E] text-white font-["Nunito"]'
                        : 'bg-red-500 hover:bg-red-600 text-white font-["Nunito"]'
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
                          <span className="font-['Open Sans']">Leaving...</span>
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
      </AnimatePresence>

      {/* Decorative Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Static decorative elements for SSR */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#1E3A8A]/10 to-[#90CAF9]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-l from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>

        {/* Client-side only animated dots */}
        <AnimatedDots />
      </div>
    </div>
  )
}
