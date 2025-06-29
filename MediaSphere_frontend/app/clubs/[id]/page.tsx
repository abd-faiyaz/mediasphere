"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, Calendar, Settings, Plus, Pin, TrendingUp, Loader2 } from "lucide-react"
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
  memberCount?: number
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

export default function ClubDetailsPage({ params }: { params: { id: string } }) {
  const [club, setClub] = useState<Club | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [threadsLoading, setThreadsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Fetch club details
  const fetchClubDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Club not found')
      }

      const clubData = await response.json()
      setClub(clubData)
    } catch (error) {
      console.error('Error fetching club details:', error)
      toast({
        title: "Error",
        description: "Failed to load club details",
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${params.id}/membership`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${params.id}/threads`)
      
      if (response.ok) {
        const threadsData = await response.json()
        setThreads(threadsData)
      } else {
        setThreads([])
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      setThreads([])
    } finally {
      setThreadsLoading(false)
    }
  }

  // Fetch club events
  const fetchEvents = async () => {
    try {
      setEventsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${params.id}/events`)
      
      if (response.ok) {
        const eventsData = await response.json()
        setEvents(eventsData)
      } else {
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${params.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to join club')
      }

      toast({
        title: "Success",
        description: "Successfully joined the club!",
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

  // Leave club
  const leaveClub = async () => {
    try {
      const token = authService.getToken()
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${params.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to leave club')
      }

      toast({
        title: "Success",
        description: "Successfully left the club!",
      })
      
      // Refresh membership status
      await checkMembership()
    } catch (error) {
      console.error('Error leaving club:', error)
      toast({
        title: "Error",
        description: "Failed to leave club. Please try again.",
      })
    }
  }

  // Load data on component mount
  useEffect(() => {
    fetchClubDetails()
    checkMembership()
    fetchThreads()
    fetchEvents()
  }, [params.id, isAuthenticated])

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        duration: 0.2,
      },
    },
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
        {/* Club Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg border border-gray-200 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center gap-4 mb-4"
              >
                <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }}>
                  <Badge variant="secondary" className="text-sm">
                    {club.mediaType.name}
                  </Badge>
                </motion.div>
                {isMember && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6, type: "spring" }}>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Member
                    </Badge>
                  </motion.div>
                )}
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-gray-600 text-lg mb-4"
              >
                {club.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center text-gray-600"
              >
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">{club.memberCount?.toLocaleString() || "Loading..."}</span>
                <span className="ml-1">members</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex gap-3"
            >
              {!isMember ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={joinClub}>
                    <Plus className="mr-2 h-4 w-4" />
                    Join Club
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg" onClick={leaveClub}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-3"
          >
            <Tabs defaultValue="discussions" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discussions">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-between items-center mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Discussion Threads</h2>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      New Thread
                    </Button>
                  </motion.div>
                </motion.div>

                {threadsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading discussions...</p>
                  </div>
                ) : threads.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No discussions yet. Start the first thread!</p>
                  </div>
                ) : (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {threads.map((thread, index) => (
                      <motion.div key={thread.id} variants={cardVariants} whileHover="hover">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {thread.isPinned && (
                                    <motion.div
                                      initial={{ rotate: -45, scale: 0 }}
                                      animate={{ rotate: 0, scale: 1 }}
                                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                                    >
                                      <Pin className="h-4 w-4 text-blue-600" />
                                    </motion.div>
                                  )}
                                  <CardTitle className="text-lg">
                                    <Link href={`/threads/${thread.id}`} className="hover:text-blue-600">
                                      {thread.title}
                                    </Link>
                                  </CardTitle>
                                </div>
                                <CardDescription>
                                  by {thread.createdBy.firstName} {thread.createdBy.lastName} • {new Date(thread.createdAt).toLocaleString()}
                                </CardDescription>
                              </div>
                              <div className="flex items-center gap-4">
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.7 + index * 0.1 }}
                                  className="flex items-center"
                                >
                                  <TrendingUp className="h-4 w-4 mr-1" />
                                  {thread.viewCount}
                                </motion.div>
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 0.8 + index * 0.1 }}
                                  className="flex items-center"
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  {thread.commentCount}
                                </motion.div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="events">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-between items-center mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Event
                    </Button>
                  </motion.div>
                </motion.div>

                {eventsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-gray-600">Loading events...</p>
                  </div>
                ) : events.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No upcoming events.</p>
                  </div>
                ) : (
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {events.map((event, index) => (
                      <motion.div key={event.id} variants={cardVariants} whileHover="hover">
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-lg">
                                    <Link href={`/events/${event.id}`} className="hover:text-blue-600">
                                      {event.title}
                                    </Link>
                                  </CardTitle>
                                </div>
                                <div className="flex items-center gap-4 text-gray-600">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(event.date).toLocaleDateString()} at {event.time}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {event.currentAttendees} / {event.maxAttendees} attending
                                  </div>
                                </div>
                                {event.location && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    📍 {event.location}
                                  </div>
                                )}
                              </div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline">RSVP</Button>
                              </motion.div>
                            </div>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Club Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Club Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: "Total Members", value: club.memberCount?.toLocaleString() || "Loading..." },
                      { label: "Active Discussions", value: threads.length.toString() },
                      { label: "Upcoming Events", value: events.length.toString() },
                      { label: "Founded", value: new Date(club.createdAt).toLocaleDateString() },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}
                        className="flex justify-between"
                      >
                        <span className="text-gray-600">{stat.label}</span>
                        <span className="font-medium">{stat.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Club Creator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Club Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback>
                        {club.createdBy.firstName.charAt(0) + club.createdBy.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{club.createdBy.firstName} {club.createdBy.lastName}</div>
                      <div className="text-xs text-gray-600">@{club.createdBy.username}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
