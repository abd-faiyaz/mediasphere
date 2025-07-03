"use client"

// Force dynamic rendering to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Users, Filter, Plus, Loader2 } from "lucide-react"
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
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Get unique categories from clubs (using mediaType.name)
  const categories = ["All", ...Array.from(new Set(clubs.map(club => club.mediaType.name)))]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
      },
    },
    hover: {
      scale: 1.03,
      y: -5,
      transition: {
        duration: 0.2,
      },
    },
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
  }

  const confirmAction = async () => {
    if (!selectedClub || !modalAction) return

    if (modalAction === 'join') {
      await performJoinClub(selectedClub.id)
    } else if (modalAction === 'leave') {
      await performLeaveClub(selectedClub.id)
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
  const performLeaveClub = async (clubId: string) => {
    try {
      const token = authService.getToken()
      console.log('Leaving club:', clubId)
      console.log('Token:', token)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${clubId}/leave`, {
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
        description: `Failed to load clubs: ${error.message}`,
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
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clubs</h1>
            <p className="text-gray-600 mt-2">Discover bhaiand join communities that match your interests</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/clubs/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
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
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">
                          <Link href={`/clubs/${club.id}`} className="hover:text-blue-600">
                            {club.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-2">{club.description}</CardDescription>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                      >
                        <Badge variant="secondary">{club.mediaType.name}</Badge>
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {club.memberCount ? `${club.memberCount} members` : new Date(club.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/clubs/${club.id}`} className="flex-1">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button variant="outline" className="w-full">
                            View Details
                          </Button>
                        </motion.div>
                      </Link>
                      {club.isMember ? (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button 
                            className="w-full bg-red-600 hover:bg-red-700"
                            onClick={() => leaveClub(club)}
                          >
                            Leave Club
                          </Button>
                        </motion.div>
                      ) : (
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            onClick={() => joinClub(club)}
                          >
                            Join Club
                          </Button>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
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

      {/* Confirmation Modal */}
      {showModal && selectedClub && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">
              {modalAction === 'join' ? 'Join Club' : 'Leave Club'}
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to {modalAction} "{selectedClub.name}"?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={closeModal}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                className={`px-4 py-2 ${
                  modalAction === 'join' 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                onClick={confirmAction}
              >
                {modalAction === 'join' ? 'Join' : 'Leave'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
