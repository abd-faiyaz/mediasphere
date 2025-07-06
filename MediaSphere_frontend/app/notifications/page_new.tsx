"use client"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, MessageSquare, Users, Calendar, Brain, Check, X, Settings, ArrowLeft, Loader2, Trash2, RefreshCw, Filter } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AuthGuard } from "@/components/auth-guard"
import { useEffect, useState } from "react"
import { apiService, type Notification } from "@/lib/api-service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

function NotificationsContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllNotifications()
      
      // Transform backend data to frontend format
      const transformedNotifications = data.map(notification => ({
        ...notification,
        message: notification.content,
        read: notification.isRead,
        timestamp: formatTimeAgo(notification.createdAt),
        link: generateNotificationLink(notification)
      }))
      
      setNotifications(transformedNotifications)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return date.toLocaleDateString()
  }

  // Generate notification link based on type and reference
  const generateNotificationLink = (notification: Notification): string => {
    switch (notification.referenceType) {
      case 'thread':
        return `/threads/${notification.referenceId}`
      case 'club':
        return `/clubs/${notification.referenceId}`
      case 'event':
        return `/events/${notification.referenceId}`
      case 'comment':
        return `/threads/${notification.referenceId}` // Assuming comment references thread
      default:
        return '#'
    }
  }

  // Refresh notifications
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchNotifications()
    setRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Notifications have been updated.",
    })
  }

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return
    
    setProcessingIds(prev => new Set(prev).add(notificationId))
    
    try {
      const success = await apiService.markNotificationAsRead(notificationId)
      if (success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, isRead: true, read: true } : n
          )
        )
        toast({
          title: "Marked as read",
          description: "Notification has been marked as read.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive"
      })
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setMarkingAllRead(true)
    try {
      const success = await apiService.markAllNotificationsAsRead()
      if (success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, isRead: true, read: true }))
        )
        toast({
          title: "All marked as read",
          description: "All notifications have been marked as read.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive"
      })
    } finally {
      setMarkingAllRead(false)
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    if (processingIds.has(notificationId)) return
    
    setProcessingIds(prev => new Set(prev).add(notificationId))
    
    try {
      const success = await apiService.deleteNotification(notificationId)
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        toast({
          title: "Deleted",
          description: "Notification has been deleted.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive"
      })
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(notificationId)
        return newSet
      })
    }
  }

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
      case "thread_reply":
        return MessageSquare
      case "club":
      case "club_join":
        return Users
      case "event":
        return Calendar
      case "ai":
        return Brain
      default:
        return Bell
    }
  }

  // Get notification color based on type (matching project theme)
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "comment":
      case "thread_reply":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "club":
      case "club_join":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "event":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "ai":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    return notification.type === activeTab || 
           (activeTab === "comment" && notification.type === "thread_reply") ||
           (activeTab === "club" && notification.type === "club_join")
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  // Animation variants
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-purple-400" />
          </motion.div>
          <p className="text-slate-400">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
          { icon: Bell, delay: 0.5, x: -30, y: -40, size: 'h-8 w-8' },
          { icon: MessageSquare, delay: 0.8, x: 40, y: -30, size: 'h-6 w-6' },
          { icon: Users, delay: 1.1, x: -40, y: 30, size: 'h-10 w-10' },
          { icon: Calendar, delay: 1.4, x: 30, y: 40, size: 'h-7 w-7' },
          { icon: Brain, delay: 1.7, x: 0, y: -50, size: 'h-5 w-5' },
          { icon: Check, delay: 2.0, x: 50, y: 0, size: 'h-9 w-9' },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ 
              opacity: [0, 0.3, 0.6, 0.3, 0],
              scale: [0, 1.2, 1, 1.2, 0],
              rotate: 360,
              x: [item.x, item.x + 20, item.x - 10, item.x + 15, item.x],
              y: [item.y, item.y - 15, item.y + 10, item.y - 20, item.y]
            }}
            transition={{ 
              duration: 20,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute"
            style={{
              left: `${50 + item.x}%`,
              top: `${50 + item.y}%`,
            }}
          >
            <item.icon className={`${item.size} text-purple-400/20`} />
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-purple-400 bg-clip-text text-transparent">
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
                  className="flex items-center gap-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800/50 transition-all duration-300 rounded-xl px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back</span>
                </Button>
              </motion.div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/clubs">
                <Button variant="ghost" className="text-slate-300 hover:text-purple-400 hover:bg-slate-800/50">Clubs</Button>
              </Link>
              <Link href="/ai-services">
                <Button variant="ghost" className="text-slate-300 hover:text-purple-400 hover:bg-slate-800/50">AI Services</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" className="text-slate-300 hover:text-purple-400 hover:bg-slate-800/50">Notifications</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="text-slate-300 hover:text-purple-400 hover:bg-slate-800/50">Profile</Button>
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
              className="text-3xl font-bold bg-gradient-to-r from-slate-100 to-purple-400 bg-clip-text text-transparent flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
              >
                <Bell className="h-8 w-8 text-purple-400" />
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
              className="text-slate-400 mt-2"
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
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-purple-400"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                onClick={markAllAsRead}
                disabled={markingAllRead || unreadCount === 0}
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-purple-400"
              >
                {markingAllRead ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Mark All Read
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-purple-400"
              >
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
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 bg-slate-900/90 border-slate-800/50">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="comment" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Comments</TabsTrigger>
              <TabsTrigger value="club" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Clubs</TabsTrigger>
              <TabsTrigger value="event" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">Events</TabsTrigger>
              <TabsTrigger value="ai" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">AI Services</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-slate-900/90 backdrop-blur-xl border-slate-800/50">
                      <CardContent className="p-8 text-center">
                        <Bell className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                        <div className="text-slate-400">
                          {activeTab === "all" ? "No notifications yet" : `No ${activeTab} notifications yet`}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  filteredNotifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type)
                    const isProcessing = processingIds.has(notification.id)
                    
                    return (
                      <motion.div key={notification.id} variants={cardVariants} whileHover="hover" custom={index}>
                        <Card
                          className={`hover:shadow-lg transition-all duration-300 cursor-pointer bg-slate-900/90 backdrop-blur-xl border-slate-800/50 ${
                            !notification.read ? "border-l-4 border-l-purple-500 bg-purple-500/5" : ""
                          }`}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                                className={`p-2 rounded-lg border ${getNotificationColor(notification.type)}`}
                              >
                                <Icon className="h-4 w-4" />
                              </motion.div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-medium text-slate-200">{notification.title}</h3>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">{notification.timestamp}</span>
                                    {!notification.read && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.9 + index * 0.1, type: "spring" }}
                                        className="w-2 h-2 bg-purple-500 rounded-full"
                                      ></motion.div>
                                    )}
                                  </div>
                                </div>
                                <p className="text-slate-400 mb-3">{notification.message}</p>
                                <div className="flex justify-between items-center">
                                  <Link href={notification.link}>
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                      <Button variant="outline" size="sm" className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-purple-400">
                                        View
                                      </Button>
                                    </motion.div>
                                  </Link>
                                  <div className="flex gap-2">
                                    {!notification.read && (
                                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => markAsRead(notification.id)}
                                          disabled={isProcessing}
                                          className="text-slate-400 hover:text-green-400 hover:bg-green-500/10"
                                        >
                                          {isProcessing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Check className="h-4 w-4" />
                                          )}
                                        </Button>
                                      </motion.div>
                                    )}
                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => deleteNotification(notification.id)}
                                        disabled={isProcessing}
                                        className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                      >
                                        {isProcessing ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
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
                  })
                )}
              </motion.div>
            </TabsContent>
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
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-purple-400">
              Load Older Notifications
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <AuthGuard>
      <NotificationsContent />
    </AuthGuard>
  )
}
