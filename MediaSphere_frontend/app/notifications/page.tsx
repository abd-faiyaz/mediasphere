"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, Users, Calendar, Brain, Check, X, Settings } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "comment",
      title: "New comment on your thread",
      message: "Mike Johnson replied to 'The Future of AI in Education'",
      timestamp: "5 minutes ago",
      read: false,
      avatar: "/placeholder.svg?height=32&width=32",
      link: "/threads/1",
    },
    {
      id: 2,
      type: "event",
      title: "Event reminder",
      message: "AI Workshop: Building Chatbots starts in 1 hour",
      timestamp: "1 hour ago",
      read: false,
      avatar: "/placeholder.svg?height=32&width=32",
      link: "/events/1",
    },
    {
      id: 3,
      type: "club",
      title: "New member joined",
      message: "Emma Davis joined Tech Innovators",
      timestamp: "2 hours ago",
      read: true,
      avatar: "/placeholder.svg?height=32&width=32",
      link: "/clubs/1",
    },
    {
      id: 4,
      type: "ai",
      title: "AI analysis complete",
      message: "Your content analysis for 'Web Development Trends' is ready",
      timestamp: "4 hours ago",
      read: true,
      avatar: "/placeholder.svg?height=32&width=32",
      link: "/ai-services",
    },
    {
      id: 5,
      type: "comment",
      title: "Thread liked",
      message: "Sarah Chen liked your comment in 'Best Practices for Remote Teams'",
      timestamp: "6 hours ago",
      read: true,
      avatar: "/placeholder.svg?height=32&width=32",
      link: "/threads/3",
    },
    {
      id: 6,
      type: "event",
      title: "Event invitation",
      message: "You're invited to 'Networking Mixer' by Tech Innovators",
      timestamp: "1 day ago",
      read: true,
      avatar: "/placeholder.svg?height=32&width=32",
      link: "/events/3",
    },
  ]

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
        return MessageSquare
      case "club":
        return Users
      case "event":
        return Calendar
      case "ai":
        return Brain
      default:
        return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "comment":
        return "bg-blue-100 text-blue-600"
      case "club":
        return "bg-green-100 text-green-600"
      case "event":
        return "bg-purple-100 text-purple-600"
      case "ai":
        return "bg-yellow-100 text-yellow-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-gray-900 flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <Bell className="h-8 w-8" />
              </motion.div>
              Notifications
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                >
                  <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                </motion.div>
              )}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-gray-600 mt-2"
            >
              Stay updated with your community activity
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex gap-3"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">
                <Check className="mr-2 h-4 w-4" />
                Mark All Read
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="comment">Comments</TabsTrigger>
              <TabsTrigger value="club">Clubs</TabsTrigger>
              <TabsTrigger value="event">Events</TabsTrigger>
              <TabsTrigger value="ai">AI Services</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                {notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type)
                  return (
                    <motion.div key={notification.id} variants={cardVariants} whileHover="hover" custom={index}>
                      <Card
                        className={`hover:shadow-md transition-shadow cursor-pointer ${
                          !notification.read ? "border-blue-200 bg-blue-50/30" : ""
                        }`}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                              className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}
                            >
                              <Icon className="h-4 w-4" />
                            </motion.div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">{notification.timestamp}</span>
                                  {!notification.read && (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
                                      className="w-2 h-2 bg-blue-600 rounded-full"
                                    ></motion.div>
                                  )}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{notification.message}</p>
                              <div className="flex justify-between items-center">
                                <Link href={notification.link}>
                                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" size="sm">
                                      View
                                    </Button>
                                  </motion.div>
                                </Link>
                                <div className="flex gap-2">
                                  {!notification.read && (
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button variant="ghost" size="sm">
                                        <Check className="h-4 w-4" />
                                      </Button>
                                    </motion.div>
                                  )}
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button variant="ghost" size="sm">
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </motion.div>
            </TabsContent>

            {["comment", "club", "event", "ai"].map((type) => (
              <TabsContent key={type} value={type} className="mt-6">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {notifications
                    .filter((n) => n.type === type)
                    .map((notification, index) => {
                      const Icon = getNotificationIcon(notification.type)
                      return (
                        <motion.div key={notification.id} variants={cardVariants} whileHover="hover" custom={index}>
                          <Card
                            className={`hover:shadow-md transition-shadow cursor-pointer ${
                              !notification.read ? "border-blue-200 bg-blue-50/30" : ""
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                                  className={`p-2 rounded-lg ${getNotificationColor(notification.type)}`}
                                >
                                  <Icon className="h-4 w-4" />
                                </motion.div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-medium text-gray-900">{notification.title}</h3>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm text-gray-500">{notification.timestamp}</span>
                                      {!notification.read && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                                          className="w-2 h-2 bg-blue-600 rounded-full"
                                        ></motion.div>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-gray-600 mb-3">{notification.message}</p>
                                  <div className="flex justify-between items-center">
                                    <Link href={notification.link}>
                                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button variant="outline" size="sm">
                                          View
                                        </Button>
                                      </motion.div>
                                    </Link>
                                    <div className="flex gap-2">
                                      {!notification.read && (
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                          <Button variant="ghost" size="sm">
                                            <Check className="h-4 w-4" />
                                          </Button>
                                        </motion.div>
                                      )}
                                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Button variant="ghost" size="sm">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </motion.div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  {notifications.filter((n) => n.type === type).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Card>
                        <CardContent className="p-8 text-center">
                          <div className="text-gray-500">No {type} notifications yet</div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-8"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="outline">Load Older Notifications</Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
