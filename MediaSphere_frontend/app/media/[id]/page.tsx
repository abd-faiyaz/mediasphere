"use client"

// Force dynamic rendering to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, Book, Image, Music, Video, FileText, Gamepad2, Monitor, Trophy, GraduationCap, Play, Calendar, User, Tag, Clock, Star, Users } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@clerk/nextjs"
import { useRouter, useParams } from "next/navigation"
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

export default function MediaDetailsPage() {
  const [media, setMedia] = useState<Media | null>(null)
  const [relatedClubs, setRelatedClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [clubsLoading, setClubsLoading] = useState(true)
  
  const { user, isLoading: authLoading } = useAuth()
  const { isSignedIn } = useUser()
  const router = useRouter()
  const params = useParams()
  const mediaId = params.id as string

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
    return <IconComponent className="h-5 w-5" />
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

  // Fetch media details
  const fetchMediaDetails = async () => {
    try {
      setLoading(true)
      const token = authService.getToken()
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/media/${mediaId}`

      console.log('Fetching media details from:', apiUrl)

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Media Not Found",
            description: "The requested media item could not be found.",
          })
          router.push('/media')
          return
        }
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to fetch media details: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Media details:', data)
      setMedia(data)
    } catch (error) {
      console.error('Error fetching media details:', error)
      toast({
        title: "Error",
        description: `Failed to load media details: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch related clubs based on media type
  const fetchRelatedClubs = async () => {
    if (!media) return
    
    try {
      setClubsLoading(true)
      const token = authService.getToken()
      
      // Use different endpoints based on authentication status
      let apiUrl: string
      if (isSignedIn && token) {
        apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/with-membership`
      } else {
        apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/`
      }

      console.log('Fetching related clubs from:', apiUrl)

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error(`Failed to fetch clubs: ${response.status} ${response.statusText}`)
      }

      const allClubs = await response.json()
      
      // Filter clubs by the same media type
      const filtered = allClubs.filter((club: Club) => 
        club.mediaType.id === media.mediaType.id || 
        club.mediaType.name === media.mediaType.name
      )
      
      console.log('Related clubs:', filtered)
      setRelatedClubs(filtered)
    } catch (error) {
      console.error('Error fetching related clubs:', error)
      // Don't show toast for clubs error, just log it
    } finally {
      setClubsLoading(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Fetch data on component mount
  useEffect(() => {
    if (mediaId) {
      fetchMediaDetails()
    }
  }, [mediaId])

  // Fetch related clubs when media is loaded
  useEffect(() => {
    if (media) {
      fetchRelatedClubs()
    }
  }, [media, isSignedIn])

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
              Loading Media Details
            </h3>
            <p className="text-[#333333]/70 font-['Open Sans']">
              Please wait while we fetch the media information
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1E3A8A] mb-4">Media Not Found</h1>
          <p className="text-[#333333] mb-6">The requested media item could not be found.</p>
          <Link href="/media">
            <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white">
              Back to Media Library
            </Button>
          </Link>
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
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Media Details Card */}
          <motion.div variants={itemVariants}>
            <Card className="overflow-hidden bg-white/90 backdrop-blur-xl border-[#90CAF9]/30 rounded-xl shadow-[0_8px_28px_-6px_rgba(30,58,138,0.12)]">
              {/* Header with gradient background */}
              <div
                className="h-48 relative overflow-hidden"
                style={{ background: getMediaBackgroundImage(media.mediaType.name) }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="text-white space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-white/20 text-white font-['Nunito'] font-medium backdrop-blur-sm px-4 py-1 rounded-full flex items-center gap-2">
                        {getMediaTypeIcon(media.mediaType.name)}
                        <span>{media.mediaType.name}</span>
                      </Badge>
                      <Badge variant="outline" className="bg-white/20 text-white font-['Nunito'] font-medium backdrop-blur-sm border-white/50">
                        {media.releaseYear}
                      </Badge>
                    </div>
                    <h1 className="text-4xl font-['Nunito'] font-bold mb-2">
                      {media.title}
                    </h1>
                    <p className="text-white/90 font-['Open Sans'] text-lg">
                      by {media.author}
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h2 className="text-2xl font-['Nunito'] font-bold text-[#1E3A8A] mb-4">
                        Description
                      </h2>
                      <p className="text-[#333333] font-['Open Sans'] text-lg leading-relaxed">
                        {media.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {media.tags && media.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-['Nunito'] font-bold text-[#1E3A8A] mb-3 flex items-center gap-2">
                          <Tag className="h-5 w-5" />
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {media.tags.map((tag, index) => (
                            <Badge 
                              key={index}
                              variant="outline" 
                              className="text-[#1E3A8A] border-[#90CAF9]/50 hover:bg-[#F0F7FF] transition-colors"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[#F0F7FF] to-white p-6 rounded-xl border border-[#90CAF9]/30">
                      <h3 className="text-lg font-['Nunito'] font-bold text-[#1E3A8A] mb-4">
                        Media Information
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#333333]/70">
                            <User className="h-4 w-4" />
                            <span className="font-medium">Author</span>
                          </div>
                          <span className="text-[#1E3A8A] font-semibold">{media.author}</span>
                        </div>
                        
                        <Separator className="bg-[#90CAF9]/20" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#333333]/70">
                            <Tag className="h-4 w-4" />
                            <span className="font-medium">Genre</span>
                          </div>
                          <Badge variant="outline" className="text-[#1E3A8A] border-[#90CAF9]/50">
                            {media.genre}
                          </Badge>
                        </div>
                        
                        <Separator className="bg-[#90CAF9]/20" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#333333]/70">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Release Year</span>
                          </div>
                          <span className="text-[#1E3A8A] font-semibold">{media.releaseYear}</span>
                        </div>
                        
                        {media.duration && (
                          <>
                            <Separator className="bg-[#90CAF9]/20" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#333333]/70">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">Duration</span>
                              </div>
                              <span className="text-[#1E3A8A] font-semibold">{media.duration}</span>
                            </div>
                          </>
                        )}
                        
                        {media.rating && (
                          <>
                            <Separator className="bg-[#90CAF9]/20" />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-[#333333]/70">
                                <Star className="h-4 w-4" />
                                <span className="font-medium">Rating</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-[#1E3A8A] font-semibold">{media.rating}/5</span>
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Separator className="bg-[#90CAF9]/20" />
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[#333333]/70">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Added</span>
                          </div>
                          <span className="text-[#1E3A8A] font-semibold text-sm">
                            {formatDate(media.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Related Clubs Section */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent">
                  Related Clubs
                </h2>
                <p className="text-[#333333]/70 font-['Open Sans'] mt-2">
                  Clubs focused on {media.mediaType.name} content
                </p>
              </div>
              <Link href="/clubs">
                <Button variant="outline" className="border-[#90CAF9]/50 text-[#1E3A8A] hover:bg-[#F0F7FF]">
                  View All Clubs
                </Button>
              </Link>
            </div>

            {clubsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1E3A8A]" />
                <p className="text-[#333333]/70 mt-2">Loading related clubs...</p>
              </div>
            ) : relatedClubs.length === 0 ? (
              <Card className="text-center py-12 bg-white/90 backdrop-blur-xl border-[#90CAF9]/30">
                <Users className="h-12 w-12 mx-auto mb-4 text-[#1E3A8A] opacity-50" />
                <h3 className="text-xl font-['Nunito'] font-bold text-[#1E3A8A] mb-2">
                  No Related Clubs
                </h3>
                <p className="text-[#333333] font-['Open Sans'] mb-4">
                  There are no clubs currently focused on {media.mediaType.name} content.
                </p>
                {isSignedIn && (
                  <Link href="/clubs/create">
                    <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white">
                      Create a Club
                    </Button>
                  </Link>
                )}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedClubs.slice(0, 6).map((club, index) => (
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
                        style={{ background: getMediaBackgroundImage(club.mediaType.name) }}
                      />

                      {/* Header with gradient background */}
                      <div
                        className="h-24 relative overflow-hidden"
                        style={{ background: getMediaBackgroundImage(club.mediaType.name) }}
                      >
                        <div className="absolute inset-0 bg-black bg-opacity-10" />
                        <div className="absolute top-3 right-3">
                          <Badge variant="secondary" className="bg-white/20 text-white font-['Nunito'] font-medium backdrop-blur-sm">
                            {club.mediaType.name}
                          </Badge>
                        </div>
                        {club.isMember && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-green-500/80 text-white font-['Nunito'] font-medium backdrop-blur-sm">
                              Member
                            </Badge>
                          </div>
                        )}
                      </div>

                      <CardHeader className="relative z-10 pb-3">
                        <CardTitle className="text-lg mb-2 group-hover:text-[#1E3A8A] transition-colors text-[#333333] font-['Nunito'] line-clamp-1">
                          <Link href={`/clubs/${club.id}`}>
                            {club.name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="line-clamp-2 text-sm text-[#333333]/70 font-['Open Sans']">
                          {club.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="relative z-10 pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm text-[#333333]/70">
                            <span>Created by {club.createdBy.firstName} {club.createdBy.lastName}</span>
                            {club.memberCount && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{club.memberCount}</span>
                              </div>
                            )}
                          </div>

                          <Link href={`/clubs/${club.id}`} className="block">
                            <Button 
                              variant="outline" 
                              className="w-full group-hover:border-[#1E3A8A] group-hover:bg-[#F0F7FF] text-[#333333] border-[#90CAF9]/50 hover:bg-[#F0F7FF] font-['Open Sans'] transition-colors"
                            >
                              View Club
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
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
