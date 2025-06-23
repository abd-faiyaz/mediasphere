"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, MessageSquare, Calendar, TrendingUp, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useUser, UserButton } from "@clerk/nextjs"
import { useAuth } from "@/lib/auth-context"
import { PageLoader } from "@/components/ui/loading"

export default function HomePage() {
  const { isSignedIn, user, isLoaded } = useUser()
  const { isLoading: authLoading } = useAuth()

  // Show loading state while authentication is being determined
  if (!isLoaded || authLoading) {
    return <PageLoader text="Loading Mediasphere..." />
  }

  const featuredClubs = [
    {
      id: 1,
      name: "Tech Innovators",
      members: 1250,
      description: "Discussing latest in technology and innovation",
      category: "Technology",
    },
    {
      id: 2,
      name: "Book Lovers",
      members: 890,
      description: "Monthly book discussions and reviews",
      category: "Literature",
    },
    {
      id: 3,
      name: "Fitness Enthusiasts",
      members: 2100,
      description: "Workout tips, nutrition, and motivation",
      category: "Health",
    },
  ]

  const featuredThreads = [
    {
      id: 1,
      title: "The Future of AI in Education",
      club: "Tech Innovators",
      replies: 45,
      author: "Sarah Chen",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Best Books of 2024 - Your Recommendations",
      club: "Book Lovers",
      replies: 23,
      author: "Mike Johnson",
      time: "4 hours ago",
    },
    {
      id: 3,
      title: "30-Day Fitness Challenge Results",
      club: "Fitness Enthusiasts",
      replies: 67,
      author: "Emma Davis",
      time: "6 hours ago",
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: "AI Workshop: Building Chatbots",
      club: "Tech Innovators",
      date: "Dec 15",
      time: "2:00 PM",
      attendees: 45,
    },
    { id: 2, title: "Virtual Book Club Meeting", club: "Book Lovers", date: "Dec 18", time: "7:00 PM", attendees: 23 },
    {
      id: 3,
      title: "Group Workout Session",
      club: "Fitness Enthusiasts",
      date: "Dec 20",
      time: "6:00 AM",
      attendees: 67,
    },
  ]

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
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
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

  const statsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
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
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center space-x-4"
            >
              <h1 className="text-2xl font-bold text-gray-900">Mediasphere</h1>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex-1 max-w-lg mx-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search clubs, threads, events..." className="pl-10 w-full" />
              </div>
            </motion.div>

            <motion.nav
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex items-center space-x-4"
            >
              <Link href="/clubs">
                <Button variant="ghost">Clubs</Button>
              </Link>
              <Link href="/ai-services">
                <Button variant="ghost">AI Services</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost">Notifications</Button>
              </Link>
              {isSignedIn ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                    afterSignOutUrl="/"
                  />
                </>
              ) : (
                <>
                  <Link href="/sign-in">
                    <Button variant="ghost">OAuth Sign In</Button>
                  </Link>
                  <Link href="/local-auth">
                    <Button variant="outline">Local Auth</Button>
                  </Link>
                  <Link href="/sign-up">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Connect, Discuss, and Grow Together
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl text-gray-600 mb-8"
          >
            Join clubs, participate in meaningful discussions, and attend exciting events
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex justify-center space-x-4"
          >
            {isSignedIn ? (
              <Link href="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Users className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </motion.div>
              </Link>
            ) : (
              <Link href="/sign-up">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Users className="mr-2 h-5 w-5" />
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            )}
            <Link href="/clubs">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Explore Clubs
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
        >
          {[
            { icon: Users, value: "150+", label: "Active Clubs", color: "text-blue-600" },
            { icon: MessageSquare, value: "2.5K+", label: "Discussions", color: "text-green-600" },
            { icon: Calendar, value: "500+", label: "Events", color: "text-purple-600" },
            { icon: Star, value: "10K+", label: "Members", color: "text-yellow-600" },
          ].map((stat, index) => (
            <motion.div key={index} variants={statsVariants}>
              <Card>
                <CardContent className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 + index * 0.1 }}
                    className="text-2xl font-bold text-gray-900"
                  >
                    {stat.value}
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                    className="text-gray-600"
                  >
                    {stat.label}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Featured Clubs */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Featured Clubs</h3>
              <Link href="/clubs">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </motion.div>
              </Link>
            </div>
            <div className="space-y-4">
              {featuredClubs.map((club, index) => (
                <motion.div
                  key={club.id}
                  variants={cardVariants}
                  whileHover="hover"
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            <Link href={`/clubs/${club.id}`} className="hover:text-blue-600">
                              {club.name}
                            </Link>
                          </CardTitle>
                          <CardDescription className="mt-1">{club.description}</CardDescription>
                        </div>
                        <Badge variant="secondary">{club.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {club.members.toLocaleString()} members
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Featured Discussions */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Trending Discussions</h3>
              <Link href="/clubs">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </motion.div>
              </Link>
            </div>
            <div className="space-y-4">
              {featuredThreads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  variants={cardVariants}
                  whileHover="hover"
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        <Link href={`/threads/${thread.id}`} className="hover:text-blue-600">
                          {thread.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>in {thread.club}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>by {thread.author}</span>
                          <span>{thread.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          {thread.replies}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Upcoming Events</h3>
              <Link href="/clubs">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </motion.div>
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  variants={cardVariants}
                  whileHover="hover"
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">
                        <Link href={`/events/${event.id}`} className="hover:text-blue-600">
                          {event.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>in {event.club}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {event.date} at {event.time}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {event.attendees}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
