"use client"

export const dynamic = 'force-dynamic'

import { useUser, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Calendar, TrendingUp, Star, Bell, LogOut } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { redirect } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser()
  const { user: authUser, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  // Check if user is authenticated via either method
  const isUserAuthenticated = isAuthenticated || isSignedIn
  const displayUser = authUser || clerkUser

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isUserAuthenticated) {
    redirect("/")
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    redirect("/sign-in")
  }

  const userClubs = [
    {
      id: 1,
      name: "Tech Innovators",
      members: 1250,
      role: "Member",
      unreadMessages: 3,
    },
    {
      id: 2,
      name: "AI Enthusiasts",
      members: 890,
      role: "Moderator",
      unreadMessages: 7,
    },
    {
      id: 3,
      name: "Web Developers",
      members: 2100,
      role: "Member",
      unreadMessages: 1,
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: "comment",
      message: "You commented on 'The Future of AI in Education'",
      time: "2 hours ago",
      club: "Tech Innovators",
    },
    {
      id: 2,
      type: "event",
      message: "You RSVP'd to 'AI Workshop: Building Chatbots'",
      time: "1 day ago",
      club: "AI Enthusiasts",
    },
    {
      id: 3,
      type: "thread",
      message: "You created 'Best Practices for Remote Teams'",
      time: "2 days ago",
      club: "Web Developers",
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
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900">
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
                <Button variant="ghost" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>
              </Link>
              
              {/* Show appropriate user button based on auth method */}
              {authUser?.isClerkUser === false ? (
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              )}
            </nav>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {displayUser?.firstName || displayUser?.username || "User"}! 👋
          </h1>
          <p className="text-gray-600">Here's what's happening in your communities today.</p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { icon: Users, value: "3", label: "Clubs Joined", color: "text-blue-600" },
            { icon: MessageSquare, value: "24", label: "Discussions", color: "text-green-600" },
            { icon: Calendar, value: "5", label: "Events Attended", color: "text-purple-600" },
            { icon: Star, value: "156", label: "Total Points", color: "text-yellow-600" },
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card>
                <CardContent className="p-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                  >
                    <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                  </motion.div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Your Clubs */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your Clubs</h2>
              <Link href="/clubs">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="sm">
                    Browse All
                  </Button>
                </motion.div>
              </Link>
            </div>
            <div className="space-y-4">
              {userClubs.map((club, index) => (
                <motion.div
                  key={club.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
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
                          <CardDescription className="mt-1">{club.members.toLocaleString()} members</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={club.role === "Moderator" ? "default" : "secondary"}>{club.role}</Badge>
                          {club.unreadMessages > 0 && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                            >
                              <Badge variant="destructive" className="text-xs">
                                {club.unreadMessages} new
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                          className={`p-2 rounded-lg ${
                            activity.type === "comment"
                              ? "bg-blue-100 text-blue-600"
                              : activity.type === "event"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-green-100 text-green-600"
                          }`}
                        >
                          {activity.type === "comment" && <MessageSquare className="h-4 w-4" />}
                          {activity.type === "event" && <Calendar className="h-4 w-4" />}
                          {activity.type === "thread" && <TrendingUp className="h-4 w-4" />}
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 mb-1">{activity.message}</p>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>in {activity.club}</span>
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/clubs">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      Explore New Clubs
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/ai-services">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Try AI Services
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
