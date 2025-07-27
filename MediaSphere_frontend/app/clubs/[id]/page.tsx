"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, Calendar, Plus, Pin, Eye, Globe, Crown, Activity, ArrowLeft, X, BarChart3, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, use } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"
import { useUser } from "@clerk/nextjs"
import CreateThreadModal from "@/components/CreateThreadModal"
import CreateEventModal from "@/components/CreateEventModal"

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
  // clubvalue?: number
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
  likeCount: number
  dislikeCount: number
  isPinned: boolean
  isLocked: boolean
  images?: Array<{
    id: string
    imageUrl: string
    fullImageUrl?: string
    imageName?: string
    fileSize?: number
    contentType?: string
    uploadedAt?: string
  }>
}

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  location?: string
  maxParticipants?: number
  currentParticipants: number
  createdBy: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  createdAt: string
  updatedAt?: string
}

interface ClubMember {
  id: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    email: string
  }
  joinedAt: string
  mutualClubs: {
    id: string
    name: string
  }[]
}

interface ClubValue {
  id: string
  clubvalue: number
}

export default function ClubDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [club, setClub] = useState<Club | null>(null)
  const [threads, setThreads] = useState<Thread[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [members, setMembers] = useState<ClubMember[]>([])
  const [clubvalue, setClubValues] = useState<ClubValue[]>([])
  const [isMember, setIsMember] = useState(false)
  const [loading, setLoading] = useState(true)
  const [threadsLoading, setThreadsLoading] = useState(false)
  const [eventsLoading, setEventsLoading] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [showSidePanel, setShowSidePanel] = useState(false)
  const [showMembersPanel, setShowMembersPanel] = useState(false)
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
  const [showCreateThreadModal, setShowCreateThreadModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const { user, isLoading: isAuthLoading, isAuthenticated, isReady } = useAuth()
  const router = useRouter()
  const { isSignedIn } = useUser()

  // Fetch club details
  const fetchClubDetails = async () => {
    try {
      setLoading(true)
      console.log('Fetching club details for ID:', resolvedParams.id)

      const headers: { [key: string]: string } = {}
      if (isSignedIn) {
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
      if (isSignedIn && clubData.isMember !== undefined) {
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
    if (!isSignedIn) {
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

      const headers: { [key: string]: string } = {
        'Content-Type': 'application/json'
      }

      if (isSignedIn) {
        const token = authService.getToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/threads`, {
        headers
      })

      console.log('Threads response status:', response.status)

      if (response.ok) {
        const threadsData = await response.json()
        console.log('Threads loaded:', threadsData.length, 'threads')
        setThreads(threadsData)
      } else if (response.status === 401) {
        console.log('Authentication required for viewing threads')
        setThreads([])
        if (isSignedIn) {
          toast({
            title: "Authentication Error",
            description: "Please log in again to view discussions",
            variant: "destructive"
          })
        }
      } else if (response.status === 403) {
        console.log('Access denied - not a club member')
        setThreads([])
        toast({
          title: "Access Denied",
          description: "You must be a club member to view discussions",
          variant: "destructive"
        })
      } else {
        console.log('No threads found or error occurred')
        setThreads([])
        toast({
          title: "Warning",
          description: "Could not load discussion threads",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
      setThreads([])
      toast({
        title: "Error",
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

  // Fetch club members
  const fetchMembers = async () => {
    try {
      setMembersLoading(true)
      console.log('Fetching members for club:', resolvedParams.id)

      const headers: { [key: string]: string } = {}
      if (isSignedIn) {
        const token = authService.getToken()
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/members`, {
        headers
      })

      console.log('Members response status:', response.status)

      if (response.ok) {
        const membersData = await response.json()
        console.log('Members loaded:', membersData.length, 'members')
        setMembers(membersData)
      } else {
        console.log('No members found or error occurred')
        setMembers([])
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      setMembers([])
      toast({
        title: "Warning",
        description: "Could not load club members",
        variant: "destructive"
      })
    } finally {
      setMembersLoading(false)
    }
  }

  // // Fetch club values
  // const fetchClubValues = async () => {
  //   try {
  //     console.log('Fetching club values for club:', resolvedParams.id)

  //     const headers: { [key: string]: string } = {}
  //     if (isSignedIn) {
  //       const token = authService.getToken()
  //       if (token) {
  //         headers['Authorization'] = `Bearer ${token}`
  //       }
  //     }

  //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/clubvalue`, {
  //       headers
  //     })

  //     console.log('Club values response status:', response.status)

  //     if (response.ok) {
  //       const clubValuesData = await response.json()
  //       console.log('Club values loaded:', clubValuesData)
  //       setClubValues(clubValuesData)
  //     } else {
  //       console.log('No club values found or error occurred')
  //       setClubValues([])
  //     }
  //   } catch (error) {
  //     console.error('Error fetching club values:', error)
  //     setClubValues([])
  //     toast({
  //       title: "Warning",
  //       description: "Could not load club values",
  //       variant: "destructive"
  //     })
  //   }
  // }

  // Join club
  const joinClub = async () => {
    if (!isSignedIn) {
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

      toast({
        title: "🎉 Welcome to the club!",
        description: "You've successfully joined the community!",
      })

      // Refresh membership status
      await checkMembership()
      await fetchClubDetails()
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${resolvedParams.id}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: ""
        })
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
      await fetchClubDetails()
    } catch (error) {
      console.error('Error leaving club:', error)
      toast({
        title: "Error",
        description: "Failed to leave club. Please try again.",
      })
    }
  }

  // Handle leave club confirmation
  const handleLeaveClub = () => {
    setShowLeaveConfirmation(true)
  }

  // Confirm leave club
  const confirmLeaveClub = async () => {
    setShowLeaveConfirmation(false)
    setShowSidePanel(false)
    await leaveClub()
  }

  // Cancel leave club
  const cancelLeaveClub = () => {
    setShowLeaveConfirmation(false)
  }

  // Load data on component mount
  useEffect(() => {
    // Guard clause: Wait for authentication to be completely ready
    if (!isReady) {
      console.log("Authentication is not ready yet, waiting...")
      return
    }

    console.log('Loading club data for ID:', resolvedParams.id)
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
    console.log('Is authenticated:', isAuthenticated)
    console.log('User:', user)

    fetchClubDetails()
    checkMembership()
    fetchThreads()
    fetchEvents()
    fetchMembers()
    // fetchClubValues()

  }, [resolvedParams.id, isReady])

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
          <p className="text-[#333333]/70 font-['Open Sans']">Authenticating...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
          <p className="text-[#333333]/70 font-['Open Sans']">Loading club details...</p>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#1E3A8A] mb-4">Club Not Found</h1>
          <p className="text-[#333333]/70 mb-6">The club you're looking for doesn't exist.</p>
          <Link href="/clubs">
            <Button className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] text-white">Back to Clubs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7ecdf]">
      {/* Header */}
      <header className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link
                href={isSignedIn ? "/profile" : "/"}
                className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent"
              >
                Mediasphere
              </Link>

              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 rounded-xl px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back</span>
              </Button>
            </div>
            <nav className="flex items-center space-x-4">
              {isSignedIn ? (
                <>
                  <Link href="/media">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Media
                    </Button>
                  </Link>
                  <Link href="/clubs">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Clubs
                    </Button>
                  </Link>
                  <Link href="/ai-services">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      AI Services
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Notifications
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Home
                    </Button>
                  </Link>
                  <Link href="/media">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Media
                    </Button>
                  </Link>
                  <Link href="/clubs">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Clubs
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Club Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1E3A8A] to-[#90CAF9] rounded-xl flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{club.name}</h1>
                  {isMember && (
                    <Badge className="bg-green-100 text-green-700 border border-green-200">
                      <Crown className="w-3 h-3 mr-1" />
                      Member
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="mb-2">
                  {club.mediaType.name}
                </Badge>
                <p className="text-gray-600 max-w-2xl">{club.description}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!isMember ? (
                <Button onClick={joinClub} className="bg-[#1E3A8A] hover:bg-[#15306E]">
                  <Plus className="h-4 w-4 mr-2" />
                  Join Club
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setShowSidePanel(true)}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Club Info
                </Button>
              )}
              {!isMember && (
                <Button variant="outline" onClick={() => setShowSidePanel(true)}>
                  View Info
                </Button>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#1E3A8A]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{club.memberCount?.toLocaleString() || "0"}</p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-[#1E3A8A]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{threads.length}</p>
                  <p className="text-sm text-gray-600">Discussions</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-[#1E3A8A]" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{events.length}</p>
                  <p className="text-sm text-gray-600">Events</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Tabs defaultValue="discussions" className="w-full">
            <div className="border-b border-gray-200 px-6 py-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg">
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Discussions
                </TabsTrigger>
                <TabsTrigger value="events" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Events
                </TabsTrigger>
                <TabsTrigger value="members" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="discussions" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Discussion Threads</h2>
                  <p className="text-gray-600">Join the conversation and share your thoughts</p>
                </div>
                <Button
                  onClick={() => setShowCreateThreadModal(true)}
                  disabled={!isMember}
                  className="bg-[#1E3A8A] hover:bg-[#15306E]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Thread
                </Button>
              </div>

              {threadsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 text-[#1E3A8A] animate-spin" />
                  <p className="text-gray-600">Loading discussions...</p>
                </div>
              ) : threads.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  {!isMember ? (
                    <>
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Join to View Discussions</h3>
                      <p className="text-gray-600 mb-4">You need to be a club member to view and participate in discussions.</p>
                      {isSignedIn && (
                        <Button onClick={joinClub} className="bg-[#1E3A8A] hover:bg-[#15306E]">
                          <Users className="mr-2 h-4 w-4" />
                          Join Club
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                      <p className="text-gray-600">Be the first to start a conversation!</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {threads.map((thread) => (
                    <Card key={thread.id} className="hover:shadow-md transition-shadow border border-gray-200">
                      <Link href={`/threads/${thread.id}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {thread.isPinned && (
                                  <Pin className="h-4 w-4 text-yellow-600" />
                                )}
                                <CardTitle className="text-lg font-medium text-gray-900 hover:text-[#1E3A8A]">
                                  {thread.title}
                                </CardTitle>
                              </div>

                              <CardDescription className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                                <Avatar className="w-5 h-5">
                                  <AvatarFallback className="text-xs bg-gray-200 text-gray-700">
                                    {thread.createdBy.firstName?.[0]}{thread.createdBy.lastName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>by {thread.createdBy.firstName} {thread.createdBy.lastName}</span>
                                <span>•</span>
                                <span>{new Date(thread.createdAt).toLocaleDateString()}</span>
                              </CardDescription>

                              {thread.content && (
                                <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                                  {thread.content}
                                </p>
                              )}

                              {/* Thread Images */}
                              {thread.images && thread.images.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                  {thread.images.slice(0, 4).map((image, imgIndex) => (
                                    <div key={image.id} className="relative group">
                                      <div className="aspect-square overflow-hidden rounded bg-gray-100">
                                        <img
                                          src={image.fullImageUrl || image.imageUrl}
                                          alt={image.imageName || `Thread Image ${imgIndex + 1}`}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = "/placeholder.svg";
                                          }}
                                        />
                                      </div>
                                      {imgIndex === 3 && thread.images!.length > 4 && (
                                        <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center">
                                          <span className="text-white font-medium text-sm">
                                            +{thread.images!.length - 4}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4 text-sm text-gray-500">
                              <Eye className="h-4 w-4" />
                              <span>{thread.viewCount}</span>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <span>👍</span>
                                <span>{thread.likeCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>👎</span>
                                <span>{thread.dislikeCount || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{thread.commentCount || 0} Comments</span>
                              </div>
                            </div>

                            <div className="text-sm text-[#1E3A8A] font-medium">
                              View Details →
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="events" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                  <p className="text-gray-600">Don't miss out on exciting happenings</p>
                </div>
                <Button
                  onClick={() => setShowCreateEventModal(true)}
                  disabled={!isMember}
                  className="bg-[#1E3A8A] hover:bg-[#15306E]"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Button>
              </div>

              {eventsLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 text-[#1E3A8A] animate-spin" />
                  <p className="text-gray-600">Loading events...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-gray-600">Stay tuned for exciting events!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`} className="block">
                      <Card className="hover:shadow-md transition-shadow border border-gray-200 cursor-pointer">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-medium text-gray-900 mb-2">
                                {event.title}
                              </CardTitle>

                              <div className="flex items-center gap-4 text-gray-600 mb-3">
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(event.eventDate).toLocaleString()}</span>
                                </div>
                                {event.maxParticipants && (
                                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                                    <Users className="h-4 w-4" />
                                    <span>{event.currentParticipants}/{event.maxParticipants}</span>
                                  </div>
                                )}
                                {event.location && (
                                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                                    <Globe className="h-4 w-4" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                              </div>

                              <p className="text-gray-700 mb-3">{event.description}</p>

                              <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>Created by {event.createdBy.firstName} {event.createdBy.lastName}</span>
                                <span>•</span>
                                <span>{new Date(event.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="members" className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Club Members</h2>
                  <p className="text-gray-600">Connect with fellow club members</p>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span className="font-medium">{members.length} member{members.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {membersLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 text-[#1E3A8A] animate-spin" />
                  <p className="text-gray-600">Loading members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-600">Be the first to join this club!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {members.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="text-lg font-medium bg-gray-200 text-gray-700">
                              {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-medium text-gray-900 truncate">
                                {member.user.firstName} {member.user.lastName}
                              </h3>
                              {member.user.id === club?.createdBy.id && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Owner
                                </Badge>
                              )}
                            </div>

                            <p className="text-gray-600 font-medium mb-2 truncate">
                              @{member.user.username}
                            </p>

                            <div className="text-sm text-gray-500 mb-3">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </div>

                            {/* Mutual Clubs */}
                            {member.mutualClubs && member.mutualClubs.length > 0 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                  Mutual Clubs
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {member.mutualClubs.slice(0, 2).map((mutualClub) => (
                                    <Badge
                                      key={mutualClub.id}
                                      variant="secondary"
                                      className="text-xs bg-gray-100 text-gray-700"
                                    >
                                      {mutualClub.name}
                                    </Badge>
                                  ))}
                                  {member.mutualClubs.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs text-gray-500"
                                    >
                                      +{member.mutualClubs.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Create Thread Modal */}
      <CreateThreadModal
        isOpen={showCreateThreadModal}
        onClose={() => setShowCreateThreadModal(false)}
        clubId={resolvedParams.id}
        clubName={club?.name || ""}
        onThreadCreated={() => {
          fetchThreads() // Refresh the threads list
          setShowCreateThreadModal(false)
        }}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        clubId={resolvedParams.id}
        clubName={club?.name || ""}
        onEventCreated={() => {
          fetchEvents() // Refresh the events list
          setShowCreateEventModal(false)
        }}
      />

      {/* Side Panel for Club Info */}
      {showSidePanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowSidePanel(false)}
          />

          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Club Information</h2>
                <button
                  onClick={() => setShowSidePanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Club Statistics */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Club Statistics</h3>
                <div className="space-y-4">
                  {[
                    {
                      label: "Total Members",
                      value: club?.memberCount?.toLocaleString() || "0",
                      icon: "👥",
                      clickable: true,
                      onClick: () => setShowMembersPanel(true)
                    },
                    { label: "Active Discussions", value: threads.length.toString(), icon: "💬" },
                    { label: "Upcoming Events", value: events.length.toString(), icon: "📅" },
                    { label: "Founded", value: club ? new Date(club.createdAt).getFullYear().toString() : "", icon: "🏆" },
                  ].map((stat, index) => (
                    <div
                      key={stat.label}
                      onClick={stat.clickable ? stat.onClick : undefined}
                      className={`flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 ${stat.clickable ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{stat.icon}</span>
                        <span className="font-medium text-gray-700">{stat.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg text-gray-900">{stat.value}</span>
                        {stat.clickable && (
                          <ArrowLeft className="h-4 w-4 text-gray-500 rotate-180" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4 text-gray-900">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: "New member joined", time: "2 hours ago", icon: Users },
                    { action: "Discussion started", time: "5 hours ago", icon: MessageSquare },
                    { action: "Event created", time: "1 day ago", icon: Calendar },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <activity.icon className="h-4 w-4 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Member Actions */}
              {isMember && (
                <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-gray-900 mb-3">Member Actions</h4>
                  <button
                    onClick={handleLeaveClub}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                  >
                    Leave Club
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Members Panel */}
      {showMembersPanel && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowMembersPanel(false)}
          />

          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Club Members</h2>
                  <p className="text-gray-600 mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  onClick={() => setShowMembersPanel(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {membersLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 mx-auto mb-4 text-[#1E3A8A] animate-spin" />
                  <p className="text-gray-600">Loading members...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-600">Be the first to join this club!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="text-lg font-medium bg-gray-200 text-gray-700">
                            {member.user.firstName?.[0]}{member.user.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {member.user.firstName} {member.user.lastName}
                            </h3>
                            {member.user.id === club?.createdBy.id && (
                              <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Owner
                              </Badge>
                            )}
                          </div>

                          <p className="text-gray-600 text-sm">@{member.user.username}</p>

                          <p className="text-xs text-gray-500 mt-1">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>

                          {member.mutualClubs && member.mutualClubs.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-500 mb-1">
                                Mutual Clubs ({member.mutualClubs.length})
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {member.mutualClubs.slice(0, 2).map((mutualClub) => (
                                  <Badge
                                    key={mutualClub.id}
                                    variant="secondary"
                                    className="text-xs bg-gray-100 text-gray-700"
                                  >
                                    {mutualClub.name}
                                  </Badge>
                                ))}
                                {member.mutualClubs.length > 2 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-gray-500"
                                  >
                                    +{member.mutualClubs.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Leave Club Confirmation Dialog */}
      {showLeaveConfirmation && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={cancelLeaveClub}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl z-50 w-96">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Club</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to leave this club?</p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={cancelLeaveClub}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmLeaveClub}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Leave Club
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
