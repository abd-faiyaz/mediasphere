"use client"

// Force dynamic rendering to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, ArrowLeft, Loader2, Play, Book, Image, Music, Video, FileText, Gamepad2, Monitor, Trophy, GraduationCap } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"

interface Media {
  id: string
  title: string
  description: string
  genre: string
  author: string
  releaseYear: number
  mediaType: {
    id: string
    name: string
    description: string
  }
  createdAt: string
  rating?: number
  duration?: string
  tags?: string[]
}

interface FilterOptions {
  genres: string[]
  authors: string[]
  mediaTypes: string[]
  releaseYears: number[]
}

export default function MediaPage() {
  const [media, setMedia] = useState<Media[]>([])
  const [filteredMedia, setFilteredMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("All")
  const [selectedAuthor, setSelectedAuthor] = useState("All")
  const [selectedYear, setSelectedYear] = useState("All")
  const [sortBy, setSortBy] = useState("newest")
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    genres: [],
    authors: [],
    mediaTypes: [],
    releaseYears: []
  })

  const { user, isLoading: authLoading } = useAuth()
  const { isSignedIn } = useUser()
  const router = useRouter()

  // Infinite scroll states
  const [visibleCount, setVisibleCount] = useState(12) // Show 12 media items initially
  const mediaPerPage = 12

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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
      scale: 1.03,
      y: -8,
      rotateY: 3,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      },
    },
  }

  // Get icon for media type
  const getMediaTypeIcon = (mediaType: string) => {
    const icons: Record<string, any> = {
      'Book': Book,
      'Music': Music,
      'Video': Video,
      'Photography': Image,
      'Writing': FileText,
      'Gaming': Gamepad2,
      'Technology': Monitor,
      'Sports': Trophy,
      'Education': GraduationCap,
      'Art': Image,
      'default': Play
    }
    const IconComponent = icons[mediaType] || icons.default
    return <IconComponent className="h-4 w-4" />
  }

  // Generate background gradient for each media type
  const getMediaBackgroundImage = (mediaType: string) => {
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
      'Book': 'linear-gradient(135deg, #1E3A8A 20%, #90CAF9 80%)',
      'default': 'linear-gradient(135deg, #1E3A8A 0%, #90CAF9 100%)'
    }
    return backgrounds[mediaType] || backgrounds.default
  }

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const token = authService.getToken()
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/media/filter-options`

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch filter options: ${response.status}`)
      }

      const data = await response.json()
      setFilterOptions(data)
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  // Fetch all media from backend (once on mount)
  const fetchMedia = async () => {
    try {
      setLoading(true)
      const token = authService.getToken()

      // Fetch all media without any filters
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/media/`

      console.log('Fetching all media from:', apiUrl)

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to fetch media: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Media data:', data)
      setMedia(data)
      setFilteredMedia(data)
    } catch (error) {
      console.error('Error fetching media:', error)
      toast({
        title: "Error",
        description: `Failed to load media: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        visibleCount < filteredMedia.length
      ) {
        setVisibleCount((prev) => Math.min(prev + mediaPerPage, filteredMedia.length))
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [visibleCount, filteredMedia.length])

  // Client-side filter and sort media (like clubs page)
  useEffect(() => {
    let filtered = media

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by genre
    if (selectedGenre !== "All") {
      filtered = filtered.filter(item => item.genre === selectedGenre)
    }

    // Filter by author
    if (selectedAuthor !== "All") {
      filtered = filtered.filter(item => item.author === selectedAuthor)
    }

    // Filter by release year
    if (selectedYear !== "All") {
      filtered = filtered.filter(item => item.releaseYear.toString() === selectedYear)
    }

    // Sort media
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.author.localeCompare(b.author)
        case "year":
          return b.releaseYear - a.releaseYear
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    setFilteredMedia(filtered)
  }, [media, searchTerm, selectedGenre, selectedAuthor, selectedYear, sortBy])

  // Fetch data on component mount only
  useEffect(() => {
    fetchFilterOptions()
    fetchMedia()
  }, [])

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
              Loading Media
            </h3>
            <p className="text-[#333333]/70 font-['Open Sans']">
              Please wait while we fetch the latest media
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#f7ecdf] overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href={"/"}
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
              >
                <Button
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
                  <Link href="/media">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Media</span>
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
                  <Link href="/media">
                    <Button
                      variant="ghost"
                      className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A]"
                    >
                      <span className="relative z-10">Media</span>
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
                Media Library
                <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] rounded-full"></div>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[#333333] mt-4 font-['Open Sans'] text-lg tracking-wide"
              >
                Explore our collection of books, videos, music, and more
              </motion.p>
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
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="flex-1"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1E3A8A] h-4 w-4" />
                <Input
                  placeholder="Search media by title, author, or description..."
                  className="pl-10 bg-gradient-to-r from-[#F0F7FF]/50 to-white border-[#90CAF9]/30 text-[#333333] placeholder-[#90CAF9]/70 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] rounded-xl shadow-[inset_0_2px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_8px_-2px_rgba(0,0,0,0.08)] transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </motion.div>
            
            {/* Filter Controls */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              {/* Genre Filter */}
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-40 border-[#90CAF9]/30 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Genres</SelectItem>
                  {filterOptions.genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Author Filter */}
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-40 border-[#90CAF9]/30 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
                  <SelectValue placeholder="Author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Authors</SelectItem>
                  {filterOptions.authors.map((author) => (
                    <SelectItem key={author} value={author}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Release Year Filter */}
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-40 border-[#90CAF9]/30 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Years</SelectItem>
                  {filterOptions.releaseYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 border-[#90CAF9]/30 focus:ring-[#1E3A8A] focus:border-[#1E3A8A]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="author">Author A-Z</SelectItem>
                  <SelectItem value="year">Release Year</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </motion.div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
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
              <Play className="h-12 w-12 mx-auto mb-4 text-[#1E3A8A] opacity-50" />
              <h3 className="text-xl font-['Nunito'] font-bold text-[#1E3A8A] mb-2">
                {searchTerm || selectedGenre !== "All" || selectedAuthor !== "All" || selectedYear !== "All"
                  ? "No Matches Found"
                  : "No Media Available"}
              </h3>
              <p className="text-[#333333] text-lg font-['Open Sans']">
                {searchTerm || selectedGenre !== "All" || selectedAuthor !== "All" || selectedYear !== "All"
                  ? "No media matches your search criteria."
                  : "No media items available at the moment."}
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredMedia.slice(0, visibleCount).map((mediaItem, index) => (
              <motion.div
                key={mediaItem.id}
                variants={cardVariants}
                whileHover="hover"
                custom={index}
                className="perspective-1000"
              >
                <Card className="overflow-hidden hover:shadow-[0_8px_28px_-6px_rgba(30,58,138,0.12)] hover:scale-[1.02] transition-all duration-500 cursor-pointer h-full relative group bg-white/90 backdrop-blur-xl border-[#90CAF9]/30 rounded-xl transform hover:-translate-y-1">
                  {/* Background gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                    style={{ background: getMediaBackgroundImage(mediaItem.mediaType.name) }}
                  />

                  {/* Header with gradient background */}
                  <div
                    className="h-32 relative overflow-hidden"
                    style={{ background: getMediaBackgroundImage(mediaItem.mediaType.name) }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-10" />
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="absolute top-4 right-4"
                    >
                      <Badge variant="secondary" className="bg-[#1E3A8A] text-white font-['Nunito'] font-medium shadow-[0_2px_8px_-1px_rgba(30,58,138,0.25)] px-4 py-1 rounded-full hover:scale-105 transition-transform flex items-center gap-1">
                        {getMediaTypeIcon(mediaItem.mediaType.name)}
                        <span>{mediaItem.mediaType.name}</span>
                      </Badge>
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="absolute top-4 left-4"
                    >
                      <Badge variant="outline" className="bg-white/90 text-[#1E3A8A] font-['Nunito'] font-medium shadow-md border-white/50">
                        {mediaItem.releaseYear}
                      </Badge>
                    </motion.div>
                  </div>

                  <CardHeader className="relative z-10">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                    >
                      <CardTitle className="text-lg mb-2 group-hover:text-[#1E3A8A] transition-colors text-[#333333] font-['Nunito'] line-clamp-2">
                        <Link href={`/media/${mediaItem.id}`}>
                          {mediaItem.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-sm text-[#333333]/70 font-['Open Sans']">
                        {mediaItem.description}
                      </CardDescription>
                    </motion.div>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6 }}
                      className="space-y-3"
                    >
                      {/* Author and Genre */}
                      <div className="flex flex-col gap-1 text-sm text-[#333333]/70">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Author:</span>
                          <span className="text-[#1E3A8A] font-semibold">{mediaItem.author}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Genre:</span>
                          <Badge variant="outline" className="text-xs border-[#90CAF9]/50 text-[#1E3A8A]">
                            {mediaItem.genre}
                          </Badge>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Link href={`/media/${mediaItem.id}`} className="block">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full"
                        >
                          <Button 
                            variant="outline" 
                            className="w-full group-hover:border-[#1E3A8A] group-hover:bg-[#F0F7FF] text-[#333333] border-[#90CAF9]/50 hover:bg-[#F0F7FF] font-['Open Sans'] transition-colors"
                          >
                            View Details
                          </Button>
                        </motion.div>
                      </Link>
                    </motion.div>
                  </CardContent>

                  {/* Decorative elements */}
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: getMediaBackgroundImage(mediaItem.mediaType.name) }}
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: 1, rotate: -360 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute -bottom-2 -left-2 w-6 h-6 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
                    style={{ background: getMediaBackgroundImage(mediaItem.mediaType.name) }}
                  />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Loading indicator for infinite scroll */}
        {visibleCount < filteredMedia.length && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-[#333333]/70 font-['Open Sans']">
              Scroll down to load more media...
            </div>
          </motion.div>
        )}
      </main>

      {/* Decorative Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#1E3A8A]/10 to-[#90CAF9]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-l from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}
