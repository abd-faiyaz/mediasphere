"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, Calendar, Settings, Plus, Pin, TrendingUp } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function ClubDetailsPage({ params }: { params: { id: string } }) {
  const club = {
    id: params.id,
    name: "Tech Innovators",
    description:
      "A community of technology enthusiasts discussing the latest innovations, sharing insights, and collaborating on cutting-edge projects.",
    members: 1250,
    category: "Technology",
    joined: true,
    rules: [
      "Be respectful and constructive in all discussions",
      "No spam or self-promotion without permission",
      "Stay on topic - focus on technology and innovation",
      "Share reliable sources when posting news or research",
    ],
    moderators: [
      { name: "Sarah Chen", role: "Admin", avatar: "/placeholder.svg?height=32&width=32" },
      { name: "Mike Rodriguez", role: "Moderator", avatar: "/placeholder.svg?height=32&width=32" },
    ],
  }

  const discussions = [
    {
      id: 1,
      title: "The Future of AI in Education",
      author: "Sarah Chen",
      replies: 45,
      likes: 23,
      pinned: true,
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Quantum Computing Breakthrough Discussion",
      author: "Mike Johnson",
      replies: 32,
      likes: 18,
      pinned: false,
      time: "4 hours ago",
    },
    {
      id: 3,
      title: "Best Practices for Remote Development Teams",
      author: "Emma Davis",
      replies: 28,
      likes: 15,
      pinned: false,
      time: "6 hours ago",
    },
    {
      id: 4,
      title: "Web3 and Blockchain: Hype or Reality?",
      author: "Alex Kim",
      replies: 67,
      likes: 34,
      pinned: false,
      time: "8 hours ago",
    },
  ]

  const events = [
    {
      id: 1,
      title: "AI Workshop: Building Chatbots",
      date: "Dec 15",
      time: "2:00 PM",
      attendees: 45,
      type: "Workshop",
    },
    {
      id: 2,
      title: "Tech Talk: Future of Web Development",
      date: "Dec 20",
      time: "6:00 PM",
      attendees: 78,
      type: "Presentation",
    },
    { id: 3, title: "Networking Mixer", date: "Dec 25", time: "7:00 PM", attendees: 120, type: "Social" },
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
                    {club.category}
                  </Badge>
                </motion.div>
                {club.joined && (
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
                <span className="font-medium">{club.members.toLocaleString()}</span>
                <span className="ml-1">members</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex gap-3"
            >
              {!club.joined ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Join Club
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="outline" size="lg">
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

              <TabsContent value="discussions" className="mt-6">
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

                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {discussions.map((thread, index) => (
                    <motion.div key={thread.id} variants={cardVariants} whileHover="hover">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {thread.pinned && (
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
                                by {thread.author} • {thread.time}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 + index * 0.1 }}
                                className="flex items-center"
                              >
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {thread.likes}
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 + index * 0.1 }}
                                className="flex items-center"
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {thread.replies}
                              </motion.div>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="events" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex justify-between items-center mb-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900">Club Events</h2>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Event
                    </Button>
                  </motion.div>
                </motion.div>

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
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                                >
                                  <Badge variant="outline">{event.type}</Badge>
                                </motion.div>
                              </div>
                              <div className="flex items-center gap-4 text-gray-600">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {event.date} at {event.time}
                                </div>
                                <div className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {event.attendees} attending
                                </div>
                              </div>
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
            {/* Club Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Club Rules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    {club.rules.map((rule, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                        className="flex items-start"
                      >
                        <span className="font-medium text-gray-900 mr-2">{index + 1}.</span>
                        {rule}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            {/* Moderators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Moderators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {club.moderators.map((mod, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                        className="flex items-center gap-3"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={mod.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {mod.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{mod.name}</div>
                          <div className="text-xs text-gray-600">{mod.role}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Club Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: "Total Members", value: club.members.toLocaleString() },
                      { label: "Active Discussions", value: "24" },
                      { label: "Upcoming Events", value: "3" },
                      { label: "Founded", value: "Jan 2023" },
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
          </motion.div>
        </div>
      </main>
    </div>
  )
}
