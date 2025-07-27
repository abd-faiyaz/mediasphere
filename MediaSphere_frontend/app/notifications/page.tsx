"use client"

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from "react"
import { apiService, type Notification } from "@/lib/api-service"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Bell, MessageSquare, Users, Calendar, Brain, Check, X, Settings, ArrowLeft, Loader2, Trash2, RefreshCw, Filter, Heart, ThumbsUp, ThumbsDown, MoreHorizontal, User as UserIcon, Mail, Volume2, Smartphone } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AuthGuard } from "@/components/auth-guard"

function NotificationsContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [newNotificationIds, setNewNotificationIds] = useState<Set<string>>(new Set())
  const [isSSEConnected, setIsSSEConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    realTimeNotifications: true,
    soundAlerts: true,
    pushNotifications: true
  })
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_settings')
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings))
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notification_settings', JSON.stringify(notificationSettings))
  }, [notificationSettings])

  // Update setting function
  const updateSetting = (key: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }))

    // Show feedback toast
    const settingNames = {
      emailNotifications: 'Email notifications',
      realTimeNotifications: 'Real-time notifications',
      soundAlerts: 'Sound alerts',
      pushNotifications: 'Push notifications'
    }

    toast({
      title: `${settingNames[key]} ${value ? 'enabled' : 'disabled'}`,
      description: `Your ${settingNames[key].toLowerCase()} have been ${value ? 'turned on' : 'turned off'}.`,
    })

    // Handle real-time connection based on setting
    if (key === 'realTimeNotifications') {
      if (value) {
        connectSSE()
      } else {
        disconnectSSE()
      }
    }
  }

  // SSE connection for real-time notifications
  const connectSSE = () => {
    if (!user || !notificationSettings.realTimeNotifications) return

    const token = localStorage.getItem('auth_token')
    if (!token) return

    try {
      const eventSource = new EventSource(`http://localhost:8080/api/notifications/stream?token=${token}`)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        console.log('Real-time notifications connected')
        setIsSSEConnected(true)
      }

      eventSource.onmessage = (event) => {
        try {
          const newNotification = JSON.parse(event.data)

          // Transform the notification to match frontend format
          const transformedNotification = {
            ...newNotification,
            message: newNotification.content,
            read: newNotification.isRead,
            timestamp: formatTimeAgo(newNotification.createdAt),
            link: generateNotificationLink(newNotification)
          }

          // Add new notification to the list
          setNotifications(prev => [transformedNotification, ...prev])
          setNewNotificationIds(prev => new Set([...prev, newNotification.id]))

          // Show toast notification for instant feedback
          toast({
            title: "New Notification",
            description: newNotification.title,
            duration: 3000,
          })

          // Play notification sound (simple beep)
          if (notificationSettings.soundAlerts) {
            try {
              const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
              const oscillator = audioContext.createOscillator()
              const gainNode = audioContext.createGain()

              oscillator.connect(gainNode)
              gainNode.connect(audioContext.destination)

              oscillator.frequency.value = 800
              oscillator.type = 'sine'
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

              oscillator.start(audioContext.currentTime)
              oscillator.stop(audioContext.currentTime + 0.2)
            } catch (error) {
              console.log('Audio notification not supported:', error)
            }
          }

          // Remove from new notifications after 5 seconds
          setTimeout(() => {
            setNewNotificationIds(prev => {
              const newSet = new Set(prev)
              newSet.delete(newNotification.id)
              return newSet
            })
          }, 5000)
        } catch (error) {
          console.error('Error parsing SSE message:', error)
        }
      }

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        setIsSSEConnected(false)
        eventSource.close()
        // Reconnect after 3 seconds
        setTimeout(connectSSE, 3000)
      }
    } catch (error) {
      console.error('Error setting up real-time connection:', error)
    }
  }

  // Cleanup SSE connection
  const disconnectSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      setIsSSEConnected(false)
    }
  }

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
        // Remove from new notifications
        setNewNotificationIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(notificationId)
          return newSet
        })
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
        // Clear all new notification indicators
        setNewNotificationIds(new Set())
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
    connectSSE()

    // Cleanup on unmount
    return () => {
      disconnectSSE()
    }
  }, [user])

  // Setup real-time notification updates using Server-Sent Events
  const setupRealTimeUpdates = () => {
    // This function is deprecated - use connectSSE instead
    connectSSE()
  }

  // Get user avatar with fallback
  const getUserAvatar = (notification: Notification) => {
    // Use actor for action-based notifications, fallback to user for recipient
    const userToShow = notification.actor || notification.user
    if (userToShow?.avatar || userToShow?.profilePic) {
      return userToShow.avatar || userToShow.profilePic
    }
    return null
  }

  // Get user initials for avatar fallback
  const getUserInitials = (notification: Notification) => {
    // Use actor for action-based notifications, fallback to user for recipient
    const userToShow = notification.actor || notification.user
    if (userToShow?.firstName && userToShow?.lastName) {
      return `${userToShow.firstName.charAt(0)}${userToShow.lastName.charAt(0)}`
    }
    if (userToShow?.username) {
      return userToShow.username.charAt(0).toUpperCase()
    }
    return "U"
  }

  // Format notification message in Facebook style
  const formatNotificationMessage = (notification: Notification) => {
    // Use actor for action-based notifications, fallback to user for recipient
    const actorUser = notification.actor || notification.user
    const userName = actorUser?.firstName
      ? `${actorUser.firstName} ${actorUser.lastName || ''}`
      : actorUser?.username || 'Someone'

    switch (notification.type) {
      case "comment":
        return `${userName} commented on your post`
      case "thread_reply":
        return `${userName} replied to your thread`
      case "thread_like":
        return `${userName} liked your thread`
      case "comment_like":
        return `${userName} liked your comment`
      case "thread_dislike":
        return `${userName} disliked your thread`
      case "comment_dislike":
        return `${userName} disliked your comment`
      case "club_join":
        return `${userName} joined your club`
      case "club_leave":
        return `${userName} left your club`
      case "club_thread_created":
        return `${userName} created a new thread in your club`
      case "reaction":
        return `${userName} reacted to your post`
      case "mention":
        return `${userName} mentioned you in a post`
      case "event":
      case "event_created":
        return `${userName} created a new event`
      case "event_updated":
        return `${userName} updated an event`
      case "event_cancelled":
        return `${userName} cancelled an event`
      case "event_reminder":
        return `Event reminder: ${notification.content || notification.title}`
      case "ai":
        return `AI service notification`
      default:
        return notification.content || notification.title
    }
  }

  // Get notification preview text
  const getNotificationPreview = (notification: Notification) => {
    if (notification.content && notification.content !== notification.title) {
      return notification.content.length > 80
        ? `${notification.content.substring(0, 80)}...`
        : notification.content
    }
    return ""
  }

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "comment":
      case "thread_reply":
        return MessageSquare
      case "thread_like":
      case "comment_like":
        return ThumbsUp
      case "thread_dislike":
      case "comment_dislike":
        return ThumbsDown
      case "reaction":
        return Heart
      case "mention":
        return MessageSquare
      case "club_join":
      case "club_leave":
      case "club_thread_created":
        return Users
      case "event":
      case "event_created":
      case "event_updated":
      case "event_cancelled":
      case "event_reminder":
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
      case "thread_like":
      case "comment_like":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "thread_dislike":
      case "comment_dislike":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "reaction":
        return "bg-pink-500/10 text-pink-400 border-pink-500/20"
      case "mention":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "club_join":
      case "club_leave":
      case "club_thread_created":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "event":
      case "event_created":
      case "event_updated":
      case "event_cancelled":
      case "event_reminder":
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

    // Comments tab: thread comments and replies
    if (activeTab === "comment") {
      return notification.type === "comment" ||
        notification.type === "thread_reply"
    }

    // Reactions tab: likes, dislikes, and other reactions
    if (activeTab === "reaction") {
      return notification.type === "thread_like" ||
        notification.type === "comment_like" ||
        notification.type === "thread_dislike" ||
        notification.type === "comment_dislike" ||
        notification.type === "reaction"
    }

    // Club tab: club activities
    if (activeTab === "club") {
      return notification.type === "club_join" ||
        notification.type === "club_leave" ||
        notification.type === "club_thread_created"
    }

    // Event tab: event activities
    if (activeTab === "event") {
      return notification.type === "event" ||
        notification.type === "event_created" ||
        notification.type === "event_updated" ||
        notification.type === "event_cancelled" ||
        notification.type === "event_reminder"
    }

    // AI and other tabs
    return notification.type === activeTab
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const totalNewCount = unreadCount + newNotificationIds.size

  // Get counts for each tab (only unread notifications)
  const getTabCounts = () => {
    const counts = {
      all: notifications.filter(n => !n.read).length,
      comment: notifications.filter(n => !n.read && (n.type === "comment" || n.type === "thread_reply")).length,
      reaction: notifications.filter(n => !n.read && ["thread_like", "comment_like", "thread_dislike", "comment_dislike", "reaction"].includes(n.type)).length,
      club: notifications.filter(n => !n.read && ["club_join", "club_leave", "club_thread_created"].includes(n.type)).length,
      event: notifications.filter(n => !n.read && ["event", "event_created", "event_updated", "event_cancelled", "event_reminder"].includes(n.type)).length,
      ai: notifications.filter(n => !n.read && n.type === "ai").length,
    }
    return counts
  }

  const tabCounts = getTabCounts()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      },
    },
    hover: {
      y: -2,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      },
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Loader2 className="h-8 w-8 mx-auto mb-4 text-blue-400" />
          </motion.div>
          <p className="text-blue-400">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#f7ecdf] overflow-hidden">
      {/* Decorative Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Static decorative elements for SSR */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#1E3A8A]/10 to-[#90CAF9]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-l from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>
      </div>

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
                href="/"
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
                  className="text-[#333333] relative overflow-hidden group font-['Open Sans'] transition-all duration-300 hover:text-[#1E3A8A] relative"
                >
                  <span className="relative z-10">Notifications</span>
                  <div className="absolute inset-0 bg-[#F0F7FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-lg"></div>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                      {newNotificationIds.size > 0 && (
                        <motion.div
                          className="absolute inset-0 bg-red-600 rounded-full"
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [1, 0.5, 1]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </motion.div>
                  )}
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
              <h1 className="text-5xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent pb-2 relative flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                >
                  <Bell className="h-10 w-10 text-[#90CAF9]" />
                </motion.div>
                Notifications
                {totalNewCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  >
                    <Badge className="bg-red-500 text-white relative">
                      {totalNewCount}
                      {newNotificationIds.size > 0 && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [1, 0.7, 1]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      )}
                    </Badge>
                  </motion.div>
                )}
                <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] rounded-full"></div>
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[#333333] mt-4 font-['Open Sans'] text-lg tracking-wide"
              >
                Stay updated with your community activity
              </motion.p>
            </div>
          </motion.div>
          <motion.div
            initial={{ x: 50, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="flex gap-3"
          >
            {newNotificationIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <motion.div
                  className="w-2 h-2 bg-red-500 rounded-full"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <span className="text-red-400 text-sm font-medium">Live</span>
              </motion.div>
            )}

            {/* Connection Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F0F7FF]/50 border border-[#90CAF9]/30 rounded-lg">
              <motion.div
                className={`w-2 h-2 rounded-full ${isSSEConnected && notificationSettings.realTimeNotifications ? 'bg-green-500' : 'bg-red-500'}`}
                animate={{
                  scale: isSSEConnected && notificationSettings.realTimeNotifications ? [1, 1.2, 1] : [1, 0.8, 1],
                  opacity: isSSEConnected && notificationSettings.realTimeNotifications ? [1, 0.7, 1] : [1, 0.5, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <span className={`text-xs font-medium ${isSSEConnected && notificationSettings.realTimeNotifications ? 'text-green-600' : 'text-red-600'}`}>
                {isSSEConnected && notificationSettings.realTimeNotifications ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={refreshing}
                className="border-[#90CAF9]/30 text-[#333333] hover:bg-[#F0F7FF] hover:text-[#1E3A8A] font-['Open Sans']"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={markAllAsRead}
                disabled={markingAllRead || totalNewCount === 0}
                className="border-[#90CAF9]/30 text-[#333333] hover:bg-[#F0F7FF] hover:text-[#1E3A8A] font-['Open Sans']"
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
              <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-[#90CAF9]/30 text-[#333333] hover:bg-[#F0F7FF] hover:text-[#1E3A8A] font-['Open Sans']"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white/95 backdrop-blur-xl border-[#90CAF9]/30 text-[#333333] max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent flex items-center gap-2 font-['Nunito']">
                      <Settings className="h-5 w-5 text-[#90CAF9]" />
                      Notification Settings
                    </DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6 mt-6">
                    {/* Email Notifications */}
                    <div className="flex items-center justify-between p-4 bg-[#F0F7FF]/50 rounded-lg border border-[#90CAF9]/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <Mail className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#333333] font-['Open Sans']">Email Notifications</h3>
                          <p className="text-sm text-[#333333]/70 font-['Open Sans']">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                        className="data-[state=checked]:bg-[#1E3A8A]"
                      />
                    </div>

                    {/* Real-time Notifications */}
                    <div className="flex items-center justify-between p-4 bg-[#F0F7FF]/50 rounded-lg border border-[#90CAF9]/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <Bell className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#333333] font-['Open Sans']">Real-time Updates</h3>
                          <p className="text-sm text-[#333333]/70 font-['Open Sans']">Live notification updates</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.realTimeNotifications}
                        onCheckedChange={(checked) => updateSetting('realTimeNotifications', checked)}
                        className="data-[state=checked]:bg-[#1E3A8A]"
                      />
                    </div>

                    {/* Sound Alerts */}
                    <div className="flex items-center justify-between p-4 bg-[#F0F7FF]/50 rounded-lg border border-[#90CAF9]/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                          <Volume2 className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#333333] font-['Open Sans']">Sound Alerts</h3>
                          <p className="text-sm text-[#333333]/70 font-['Open Sans']">Play sound for new notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.soundAlerts}
                        onCheckedChange={(checked) => updateSetting('soundAlerts', checked)}
                        className="data-[state=checked]:bg-[#1E3A8A]"
                      />
                    </div>

                    {/* Push Notifications */}
                    <div className="flex items-center justify-between p-4 bg-[#F0F7FF]/50 rounded-lg border border-[#90CAF9]/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <Smartphone className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-[#333333] font-['Open Sans']">Push Notifications</h3>
                          <p className="text-sm text-[#333333]/70 font-['Open Sans']">Browser push notifications</p>
                        </div>
                      </div>
                      <Switch
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                        className="data-[state=checked]:bg-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[#90CAF9]/30">
                    <Button
                      variant="outline"
                      onClick={() => setSettingsDialogOpen(false)}
                      className="border-[#90CAF9]/30 text-[#333333] hover:bg-[#F0F7FF] font-['Open Sans']"
                    >
                      Done
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 bg-white/90 backdrop-blur-xl border border-[#90CAF9]/30 p-1 rounded-xl">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1E3A8A] data-[state=active]:to-[#90CAF9] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
              >
                All
                {tabCounts.all > 0 && (
                  <Badge variant="secondary" className="bg-[#F0F7FF] text-[#1E3A8A] text-xs px-1.5 py-0.5 h-5">
                    {tabCounts.all}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="comment"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1E3A8A] data-[state=active]:to-[#90CAF9] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
              >
                Comments
                {tabCounts.comment > 0 && (
                  <Badge variant="secondary" className="bg-[#F0F7FF] text-[#1E3A8A] text-xs px-1.5 py-0.5 h-5">
                    {tabCounts.comment}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="reaction"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1E3A8A] data-[state=active]:to-[#90CAF9] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
              >
                Reactions
                {tabCounts.reaction > 0 && (
                  <Badge variant="secondary" className="bg-[#F0F7FF] text-[#1E3A8A] text-xs px-1.5 py-0.5 h-5">
                    {tabCounts.reaction}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="club"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1E3A8A] data-[state=active]:to-[#90CAF9] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
              >
                Clubs
                {tabCounts.club > 0 && (
                  <Badge variant="secondary" className="bg-[#F0F7FF] text-[#1E3A8A] text-xs px-1.5 py-0.5 h-5">
                    {tabCounts.club}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="event"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1E3A8A] data-[state=active]:to-[#90CAF9] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
              >
                Events
                {tabCounts.event > 0 && (
                  <Badge variant="secondary" className="bg-[#F0F7FF] text-[#1E3A8A] text-xs px-1.5 py-0.5 h-5">
                    {tabCounts.event}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1E3A8A] data-[state=active]:to-[#90CAF9] data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg font-medium flex items-center gap-2"
              >
                AI Services
                {tabCounts.ai > 0 && (
                  <Badge variant="secondary" className="bg-[#F0F7FF] text-[#1E3A8A] text-xs px-1.5 py-0.5 h-5">
                    {tabCounts.ai}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-8">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {filteredNotifications.length === 0 ? (
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
                      <Bell className="h-12 w-12 mx-auto mb-4 text-[#1E3A8A] opacity-50" />
                      <h3 className="text-xl font-['Nunito'] font-bold text-[#1E3A8A] mb-2">
                        {activeTab === "all" ? "No notifications yet" : `No ${activeTab} notifications yet`}
                      </h3>
                      <p className="text-[#333333] text-lg font-['Open Sans']">
                        {activeTab === "all"
                          ? "When you get notifications, they'll show up here"
                          : `No ${activeTab} activity to show right now`
                        }
                      </p>
                    </motion.div>
                  </motion.div>
                ) : (
                  filteredNotifications.map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type)
                    const isProcessing = processingIds.has(notification.id)
                    const userAvatar = getUserAvatar(notification)
                    const userInitials = getUserInitials(notification)
                    const formattedMessage = formatNotificationMessage(notification)
                    const previewText = getNotificationPreview(notification)

                    return (
                      <motion.div key={notification.id} variants={cardVariants} whileHover="hover" custom={index}>
                        <Card
                          className={`overflow-hidden hover:shadow-[0_8px_28px_-6px_rgba(30,58,138,0.12)] hover:scale-[1.02] transition-all duration-500 cursor-pointer h-full relative group bg-white/90 backdrop-blur-xl border-[#90CAF9]/30 rounded-xl transform hover:-translate-y-1 ${!notification.read ? "border-l-4 border-l-[#1E3A8A] bg-[#F0F7FF]/30" : ""} ${newNotificationIds.has(notification.id) ? "border-2 border-red-500/50 shadow-red-500/20 shadow-lg" : ""}`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id)
                            }
                          }}
                        >
                          <CardContent className="p-0">
                            <div className="flex items-start gap-0 relative">
                              {/* Quick visual scanning icon */}
                              <div className="flex flex-col items-center justify-center pl-4 pr-2 pt-6">
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                                  className={`rounded-full p-2 ${getNotificationColor(notification.type)}`}
                                >
                                  <Icon className="h-5 w-5" />
                                </motion.div>
                                {/* Pulse for new notification */}
                                {newNotificationIds.has(notification.id) && (
                                  <motion.div
                                    className="w-3 h-3 rounded-full bg-red-400 mt-2"
                                    animate={{
                                      scale: [1, 1.5, 1],
                                      opacity: [1, 0.5, 1]
                                    }}
                                    transition={{
                                      duration: 1.2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  />
                                )}
                              </div>
                              {/* User Avatar */}
                              <div className="relative p-4 pb-0">
                                <motion.div
                                  initial={{ scale: 0, rotate: -180 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  transition={{ delay: 0.3 + index * 0.1, type: "spring", stiffness: 200 }}
                                  className="relative"
                                >
                                  {userAvatar ? (
                                    <img
                                      src={userAvatar}
                                      alt="User avatar"
                                      className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-700">
                                      {userInitials}
                                    </div>
                                  )}
                                </motion.div>
                              </div>

                              {/* Notification Content */}
                              <div className="flex-1 p-4 pl-2">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    {/* Main Message */}
                                    <motion.p
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.4 + index * 0.1 }}
                                      className="text-[#333333] text-sm font-medium leading-relaxed font-['Open Sans']"
                                    >
                                      {formattedMessage}
                                    </motion.p>

                                    {/* Preview Text */}
                                    {previewText && (
                                      <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + index * 0.1 }}
                                        className="text-[#333333]/70 text-xs mt-1 leading-relaxed font-['Open Sans']"
                                      >
                                        {previewText}
                                      </motion.p>
                                    )}

                                    {/* Timestamp */}
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: 0.6 + index * 0.1 }}
                                      className="text-[#333333]/50 text-xs mt-2 flex items-center gap-2 font-['Open Sans']"
                                    >
                                      {notification.timestamp}
                                      {!notification.read && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ delay: 0.7 + index * 0.1, type: "spring" }}
                                          className="w-2 h-2 bg-blue-500 rounded-full"
                                        />
                                      )}
                                      {newNotificationIds.has(notification.id) && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{
                                            scale: [1, 1.3, 1],
                                            opacity: [1, 0.6, 1]
                                          }}
                                          transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                          }}
                                          className="w-2 h-2 bg-red-500 rounded-full"
                                        />
                                      )}
                                    </motion.div>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-1 ml-2">
                                    <motion.div
                                      initial={{ opacity: 0, x: 10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.8 + index * 0.1 }}
                                      className="flex gap-1"
                                    >
                                      {/* View Button */}
                                      <Link href={notification.link || '#'} onClick={e => e.stopPropagation()}>
                                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-[#333333]/50 hover:text-[#1E3A8A] hover:bg-[#F0F7FF] rounded-full"
                                          >
                                            <ArrowLeft className="h-3 w-3 rotate-180" />
                                          </Button>
                                        </motion.div>
                                      </Link>

                                      {/* Mark as Read Button */}
                                      {!notification.read && (
                                        <motion.div
                                          whileHover={{ scale: 1.1 }}
                                          whileTap={{ scale: 0.9 }}
                                          onClick={e => e.stopPropagation()}
                                        >
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => markAsRead(notification.id)}
                                            disabled={isProcessing}
                                            className="h-8 w-8 p-0 text-[#333333]/50 hover:text-green-600 hover:bg-green-500/10 rounded-full"
                                          >
                                            {isProcessing ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Check className="h-3 w-3" />
                                            )}
                                          </Button>
                                        </motion.div>
                                      )}

                                      {/* Delete Button */}
                                      <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={e => e.stopPropagation()}
                                      >
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => deleteNotification(notification.id)}
                                          disabled={isProcessing}
                                          className="h-8 w-8 p-0 text-[#333333]/50 hover:text-red-600 hover:bg-red-500/10 rounded-full"
                                        >
                                          {isProcessing ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <X className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </motion.div>
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
        {filteredNotifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center mt-12"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="border-[#90CAF9]/30 text-[#333333] hover:bg-[#F0F7FF] hover:text-[#1E3A8A] px-8 py-3 rounded-xl font-medium transition-all duration-300 font-['Open Sans']"
              >
                Load Older Notifications
              </Button>
            </motion.div>
          </motion.div>
        )}
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
