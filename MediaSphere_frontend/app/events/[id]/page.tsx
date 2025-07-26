"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Calendar, MapPin, Users, Heart, ArrowLeft, Clock, Globe,
    Star, Sparkles, TrendingUp, Loader2, Share, MoreHorizontal
} from "lucide-react"
import Link from "next/link"
import { use, useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { authService } from "@/lib/auth-service"
import { toast } from "@/hooks/use-toast"
import { useUser } from "@clerk/nextjs"

interface User {
    id: string
    username: string
    firstName?: string
    lastName?: string
    profilePic?: string
}

interface Event {
    id: string
    title: string
    description: string
    eventDate: string
    location?: string
    maxParticipants?: number
    currentParticipants: number
    createdBy: User
    club: {
        id: string
        name: string
    }
    createdAt: string
    interestedCount: number
    isUserInterested: boolean
}

interface InterestedUser {
    id: string
    username: string
    firstName?: string
    lastName?: string
    profilePic?: string
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params)
    const { user, isLoading: isAuthLoading, isAuthenticated, isReady } = useAuth()
    const { user: currentUser } = useUser()
    const isSignedIn = !!currentUser

    const [event, setEvent] = useState<Event | null>(null)
    const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [isInterested, setIsInterested] = useState(false)
    const [interestedCount, setInterestedCount] = useState(0)
    const [showInterestedUsers, setShowInterestedUsers] = useState(false)
    const [interestLoading, setInterestLoading] = useState(false)

    const [currentParticipants, setCurrentParticipants] = useState(0)


    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({ target: containerRef })

    // Parallax effects
    const headerY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
    const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0.8])

    // Floating icons for background animation
    const floatingIcons = [
        { icon: Star, delay: 0.5, x: -30, y: -40 },
        { icon: Heart, delay: 0.8, x: 40, y: -35 },
        { icon: Sparkles, delay: 1.1, x: -35, y: 30 },
        { icon: TrendingUp, delay: 1.4, x: 35, y: 40 },
        { icon: Calendar, delay: 1.7, x: -40, y: -20 },
        { icon: Users, delay: 2.0, x: 30, y: 35 },
    ]

    useEffect(() => {
        if (!isReady) {
            console.log("Authentication is not ready yet, waiting...")
            return
        }

        fetchEventDetails()
    }, [resolvedParams.id, isReady])

    const fetchEventDetails = async () => {
        setLoading(true)
        setError("")
        try {
            const token = authService.getToken()

            // Fetch event details
            const eventResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${resolvedParams.id}`, {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            })

            if (!eventResponse.ok) throw new Error("Event not found")

            const eventData = await eventResponse.json()
            setEvent(eventData)
            setInterestedCount(eventData.interestedCount || 0)
            setIsInterested(eventData.isUserInterested || false)
            setCurrentParticipants(eventData.interestedCount || 0)


            // Fetch interested users if signed in
            if (isSignedIn && token) {
                const interestedResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${resolvedParams.id}/interested-users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })

                if (interestedResponse.ok) {
                    const interestedData = await interestedResponse.json()
                    setInterestedUsers(interestedData)
                }
            }
        } catch (error) {
            console.error("Failed to fetch event:", error)
            setError("Failed to load event. Please try again later.")
        } finally {
            setLoading(false)
        }
    }

    const handleInterest = async () => {
        if (!isSignedIn || interestLoading) return

        setInterestLoading(true)
        const wasInterested = isInterested

        try {
            // Optimistic update
            setIsInterested(!wasInterested)

            setInterestedCount(prev => wasInterested ? prev - 1 : prev + 1)

            setCurrentParticipants(prev =>
                wasInterested
                    ? prev - 1
                    : prev < (event?.maxParticipants || Infinity) ? prev + 1 : prev)
            const token = authService.getToken()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${resolvedParams.id}/interest`, {
                method: wasInterested ? 'DELETE' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setInterestedCount(data.interestedCount)
                setIsInterested(data.isUserInterested)
                setCurrentParticipants(data.interestedCount)

                // Refresh interested users list
                await fetchInterestedUsers()

                toast({
                    title: wasInterested ? "Interest removed" : "Interest added",
                    description: wasInterested
                        ? "You are no longer interested in this event"
                        : "You've shown interest in this event!",
                })
            } else {
                throw new Error("Failed to update interest")
            }
        } catch (error) {
            // Revert optimistic update
            setIsInterested(wasInterested)
            setInterestedCount(prev => wasInterested ? prev + 1 : prev - 1)

            toast({
                title: "Error",
                description: "Failed to update interest",
                variant: "destructive"
            })
        } finally {
            setInterestLoading(false)
        }
    }

    const fetchInterestedUsers = async () => {
        if (!isSignedIn) return

        try {
            const token = authService.getToken()
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/events/${resolvedParams.id}/interested-users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            if (response.ok) {
                const interestedData = await response.json()
                setInterestedUsers(interestedData)
                setCurrentParticipants(interestedData.length)
            }
        } catch (error) {
            console.error('Failed to fetch interested users:', error)
        }
    }

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString)
        return {
            date: date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            })
        }
    }

    const getInterestedUsersText = () => {
        if (interestedUsers.length === 0) return "No one has shown interest yet"

        const displayUsers = interestedUsers.slice(0, 3)
        const remainingCount = interestedUsers.length - 3

        const names = displayUsers.map(user => `${user.firstName} ${user.lastName}`).join(", ")

        if (remainingCount > 0) {
            return `${names} and ${remainingCount} others are interested`
        }

        return `${names} ${interestedUsers.length === 1 ? 'is' : 'are'} interested`
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <Loader2 className="h-12 w-12 mx-auto text-white animate-spin mb-4" />
                    <p className="text-white text-lg">Loading event details...</p>
                </motion.div>
            </div>
        )
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <h1 className="text-white text-2xl font-bold mb-4">Event Not Found</h1>
                    <p className="text-white/80 mb-6">{error || "This event doesn't exist or has been removed."}</p>
                    <Link href="/clubs">
                        <Button variant="secondary">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Clubs
                        </Button>
                    </Link>
                </motion.div>
            </div>
        )
    }

    const eventDateTime = formatEventDate(event.eventDate)

    return (
        <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-[#1E3A8A] via-[#3B82F6] to-[#8B5CF6]">
            {/* Floating background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {floatingIcons.map((item, index) => (
                    <motion.div
                        key={index}
                        className="absolute"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 0.3, 0],
                            scale: [0, 1, 0],
                            x: [item.x, item.x + 20, item.x],
                            y: [item.y, item.y - 20, item.y]
                        }}
                        transition={{
                            duration: 4,
                            delay: item.delay,
                            repeat: Infinity,
                            repeatDelay: 2
                        }}
                        style={{
                            left: `${20 + (index * 15)}%`,
                            top: `${30 + (index * 10)}%`
                        }}
                    >
                        <item.icon className="h-6 w-6 text-white/20" />
                    </motion.div>
                ))}
            </div>

            {/* Header */}
            <motion.div
                style={{ y: headerY, opacity }}
                className="relative z-10 pt-20 pb-16"
            >
                <div className="max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        <Link
                            href={`/clubs/${event.club.id}`}
                            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to {event.club.name}
                        </Link>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            {event.title}
                        </h1>

                        <div className="flex flex-wrap justify-center gap-4 text-white/90">
                            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                                <Calendar className="h-5 w-5" />
                                <span className="font-medium">{eventDateTime.date}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">{eventDateTime.time}</span>
                            </div>
                            {event.location && (
                                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                                    <MapPin className="h-5 w-5" />
                                    <span className="font-medium">{event.location}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                                <Heart className="h-5 w-5" />
                                <span className="font-medium">{interestedCount} interested</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="relative z-20 -mt-8">
                <div className="bg-white rounded-t-3xl min-h-screen">
                    <div className="max-w-4xl mx-auto px-6 py-12">

                        {/* Event Details Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <Card className="mb-8 shadow-lg border-0">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-[#1E3A8A] text-white text-lg font-medium">
                                                    {event.createdBy.firstName?.[0]}{event.createdBy.lastName?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">
                                                    {event.createdBy.firstName} {event.createdBy.lastName}
                                                </h3>
                                                <p className="text-gray-600 text-sm">@{event.createdBy.username}</p>
                                                <p className="text-gray-500 text-sm">
                                                    Created on {new Date(event.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="outline" size="sm">
                                                <Share className="h-4 w-4 mr-2" />
                                                Share
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                            {event.description}
                                        </p>
                                    </div>

                                    {/* Event Info Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 p-6 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <Calendar className="h-5 w-5 text-[#1E3A8A]" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{eventDateTime.date}</p>
                                                        <p className="text-gray-600 text-sm">{eventDateTime.time}</p>
                                                    </div>
                                                </div>

                                                {event.location && (
                                                    <div className="flex items-center gap-3">
                                                        <MapPin className="h-5 w-5 text-[#1E3A8A]" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">Location</p>
                                                            <p className="text-gray-600 text-sm">{event.location}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <Globe className="h-5 w-5 text-[#1E3A8A]" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">Hosted by</p>
                                                        <p className="text-gray-600 text-sm">{event.club.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Attendance</h4>
                                            <div className="space-y-3">
                                                {event.maxParticipants && (
                                                    <div className="flex items-center gap-3">
                                                        <Users className="h-5 w-5 text-[#1E3A8A]" />
                                                        <div>
                                                            <p className="font-medium text-gray-900">Capacity</p>
                                                            <p className="text-gray-600 text-sm">
                                                                {currentParticipants} / {event.maxParticipants} participants
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-3">
                                                    <Heart className="h-5 w-5 text-[#1E3A8A]" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">Interest</p>
                                                        <p className="text-gray-600 text-sm">
                                                            {interestedCount} {interestedCount === 1 ? 'person is' : 'people are'} interested
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Interest Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <Card className="mb-8 shadow-lg border-0">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                                Interested in this event?
                                            </h3>
                                            <p className="text-gray-600 mb-4">
                                                {getInterestedUsersText()}
                                            </p>

                                            {interestedUsers.length > 0 && (
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="flex -space-x-2">
                                                        {interestedUsers.slice(0, 5).map((user, index) => (
                                                            <Avatar key={user.id} className="w-8 h-8 border-2 border-white">
                                                                <AvatarFallback className="bg-[#1E3A8A] text-white text-xs">
                                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        ))}
                                                        {interestedUsers.length > 5 && (
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                                                                <span className="text-xs text-gray-600">+{interestedUsers.length - 5}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {interestedUsers.length > 3 && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setShowInterestedUsers(true)}
                                                            className="text-[#1E3A8A]"
                                                        >
                                                            See all {interestedUsers.length} interested
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-end gap-3">
                                            <motion.div
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <Button
                                                    onClick={handleInterest}
                                                    disabled={!isSignedIn || interestLoading}
                                                    className={`${isInterested
                                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                                        : 'bg-[#1E3A8A] hover:bg-[#15306E] text-white'
                                                        } px-6 py-2`}
                                                >
                                                    {interestLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    <Heart className={`mr-2 h-4 w-4 ${isInterested ? 'fill-current' : ''}`} />
                                                    {isInterested ? 'Remove Interest' : 'Show Interest'}
                                                </Button>
                                            </motion.div>

                                            <p className="text-sm text-gray-500">
                                                {interestedCount} interested
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                    </div>
                </div>
            </div>

            {/* Interested Users Modal */}
            <Dialog open={showInterestedUsers} onOpenChange={setShowInterestedUsers}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Interested Users</DialogTitle>
                        <DialogDescription>
                            People who have shown interest in this event
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-96 overflow-y-auto">
                        {interestedUsers.map((user) => (
                            <div key={user.id} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                                <Avatar className="w-10 h-10">
                                    <AvatarFallback className="bg-[#1E3A8A] text-white">
                                        {user.firstName?.[0]}{user.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-gray-600 text-sm">@{user.username}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
