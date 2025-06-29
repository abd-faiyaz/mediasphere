"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, MessageSquare, Calendar, TrendingUp, Star, Lock } from "lucide-react"
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
                <Input 
                  placeholder="Search clubs, threads, events..." 
                  className="pl-10 w-full"
                  type="text"
                />
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
              {isSignedIn ? (
                <>
                  <Link href="/ai-services">
                    <Button variant="ghost">AI Services</Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost">Notifications</Button>
                  </Link>
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
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                        <Users className="mr-2 h-5 w-5" />
                        Get Started
                      </Button>
                    </motion.div>
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
              <Link href="/sign-in">
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

        {/* Content based on authentication status */}
        {isSignedIn ? (
          // Authenticated user content - will be populated with real data
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Stats - Will be fetched from backend */}
            <motion.div variants={statsVariants}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                {[
                  { icon: Users, value: "Loading...", label: "Active Clubs", color: "text-blue-600" },
                  { icon: MessageSquare, value: "Loading...", label: "Discussions", color: "text-green-600" },
                  { icon: Calendar, value: "Loading...", label: "Events", color: "text-purple-600" },
                  { icon: Star, value: "Loading...", label: "Members", color: "text-yellow-600" },
                ].map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 text-center">
                      <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-gray-600">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Placeholder for real data sections */}
            <motion.div variants={itemVariants}>
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading Your Content</h3>
                <p className="text-gray-600">We're fetching your personalized clubs, discussions, and events...</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // Non-authenticated user content - simple landing page
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* Features Preview */}
            <motion.div variants={itemVariants}>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Can Do</h3>
                <p className="text-gray-600">Join our community to unlock all features</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Users,
                    title: "Join Clubs",
                    description: "Connect with like-minded people in your favorite topics",
                    color: "text-blue-600",
                  },
                  {
                    icon: MessageSquare,
                    title: "Start Discussions",
                    description: "Share your thoughts and engage in meaningful conversations",
                    color: "text-green-600",
                  },
                  {
                    icon: Calendar,
                    title: "Attend Events",
                    description: "Participate in virtual and in-person community events",
                    color: "text-purple-600",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    whileHover="hover"
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="text-center p-6">
                      <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                      <p className="text-gray-600">{feature.description}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div variants={itemVariants} className="text-center">
              <Card className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
                <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6">
                  Sign in to access all features, join clubs, and start participating in discussions.
                </p>
                <Link href="/sign-in">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Users className="mr-2 h-5 w-5" />
                      Sign In to Continue
                    </Button>
                  </motion.div>
                </Link>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
