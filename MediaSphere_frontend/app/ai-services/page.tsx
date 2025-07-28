"use client"

export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Brain, FileText, HelpCircle, TrendingUp, Sparkles, Upload, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { SummaryTab } from "@/components/ai/SummaryTab"
import { QuizTab } from "@/components/ai/QuizTab"

function AIServicesContent() {
  const router = useRouter()

  const services = [
    {
      id: "summarize",
      title: "Content Summarization",
      description: "Get concise summaries of long discussions, articles, or documents",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    // {
    //   id: "quiz",
    //   title: "Quiz Generation",
    //   description: "Create interactive quizzes from any content to test understanding",
    //   icon: HelpCircle,
    //   color: "bg-green-100 text-green-600",
    // },
    // {
    //   id: "analyze",
    //   title: "Content Analysis",
    //   description: "Analyze sentiment, topics, and key insights from discussions",
    //   icon: TrendingUp,
    //   color: "bg-purple-100 text-purple-600",
    // },
    // {
    //   id: "recommend",
    //   title: "Smart Recommendations",
    //   description: "Get personalized suggestions for clubs, threads, and content",
    //   icon: Sparkles,
    //   color: "bg-yellow-100 text-yellow-600",
    // },
  ]

  // const recentResults = [
  //   {
  //     id: 1,
  //     type: "Summary",
  //     title: "AI in Education Discussion Summary",
  //     content: "Key points: Personalized learning, ethical concerns, privacy issues...",
  //     timestamp: "2 hours ago",
  //   },
  //   {
  //     id: 2,
  //     type: "Quiz",
  //     title: "Web Development Quiz",
  //     content: "10 questions generated from React documentation",
  //     timestamp: "1 day ago",
  //   },
  //   {
  //     id: 3,
  //     type: "Analysis",
  //     title: "Club Sentiment Analysis",
  //     content: "Overall positive sentiment (78%) in Tech Innovators discussions",
  //     timestamp: "2 days ago",
  //   },
  // ]

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

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
  }

  return (
    <div className="min-h-screen bg-[#f7ecdf]">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent">
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
                  className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 rounded-xl px-3 py-2 font-['Open Sans']"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back</span>
                </Button>
              </motion.div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/media">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">Media</Button>
              </Link>
              <Link href="/clubs">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">Clubs</Button>
              </Link>
              <Link href="/ai-services">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">AI Services</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">Notifications</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">Profile</Button>
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
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] p-3 rounded-full">
              <motion.div
                // animate={{ rotate: 360 }}  
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <Brain className="h-8 w-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent mb-4"
          >
            AI Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-[#333333]/70 font-['Open Sans'] max-w-2xl mx-auto"
          >
            Enhance your Mediasphere experience with powerful AI tools for content analysis, summarization, and
            personalized recommendations
          </motion.p>
        </motion.div>

        <div className="flex justify-center">
          {/* AI Services */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full max-w-4xl"
          >
            <Tabs defaultValue="summarize" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-xl border border-[#90CAF9]/30 rounded-xl p-1">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  >
                    <TabsTrigger
                      value={service.id}
                      className="text-xs font-['Open Sans'] data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white rounded-lg transition-all duration-300"
                    >
                      {service.title.split(" ")[0]}
                    </TabsTrigger>
                  </motion.div>
                ))}
              </TabsList>

              {services.map((service, index) => (
                <TabsContent key={service.id} value={service.id} className="mt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-xl border border-[#90CAF9]/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <motion.div
                            variants={iconVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                            className={`p-3 rounded-lg ${service.color}`}
                          >
                            <service.icon className="h-6 w-6" />
                          </motion.div>
                          <div>
                            <CardTitle className="text-2xl font-['Nunito'] text-[#333333]">{service.title}</CardTitle>
                            <CardDescription className="text-base mt-1 font-['Open Sans'] text-[#333333]/70">{service.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {service.id === "summarize" && (
                          <SummaryTab />
                        )}

                        {service.id === "quiz" && (
                          <QuizTab />
                        )}

                        {service.id === "analyze" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2 font-['Open Sans']">Content to Analyze</label>
                              <Textarea
                                placeholder="Enter discussion threads, comments, or any text content..."
                                className="min-h-[150px] bg-white/50 border-[#90CAF9]/30 focus:border-[#1E3A8A] transition-colors"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded border-[#90CAF9]/30 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                                <span className="text-sm font-['Open Sans'] text-[#333333]">Sentiment Analysis</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded border-[#90CAF9]/30 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                                <span className="text-sm font-['Open Sans'] text-[#333333]">Topic Extraction</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded border-[#90CAF9]/30 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                                <span className="text-sm font-['Open Sans'] text-[#333333]">Key Insights</span>
                              </label>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Open Sans'] font-medium shadow-lg rounded-xl px-6 py-2">
                                <TrendingUp className="mr-2 h-4 w-4" />
                                Analyze Content
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}

                        {service.id === "recommend" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-4"
                          >
                            <div className="bg-[#F0F7FF] p-4 rounded-lg border border-[#90CAF9]/30">
                              <h4 className="font-medium text-[#333333] mb-2 font-['Nunito']">Based on your activity:</h4>
                              <ul className="text-sm text-[#333333]/70 space-y-1 font-['Open Sans']">
                                <li>• Member of 3 technology-related clubs</li>
                                <li>• Active in AI and machine learning discussions</li>
                                <li>• Attended 5 virtual events this month</li>
                              </ul>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-[#333333] mb-2 font-['Open Sans']">
                                What are you looking for?
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" defaultChecked className="rounded border-[#90CAF9]/30 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                                  <span className="text-sm font-['Open Sans'] text-[#333333]">New Clubs</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" defaultChecked className="rounded border-[#90CAF9]/30 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                                  <span className="text-sm font-['Open Sans'] text-[#333333]">Discussion Threads</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" className="rounded border-[#90CAF9]/30 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                                  <span className="text-sm font-['Open Sans'] text-[#333333]">Events</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" className="rounded border-[#90CAF9]/30 text-[#1E3A8A] focus:ring-[#1E3A8A]" />
                                  <span className="text-sm font-['Open Sans'] text-[#333333]">People to Follow</span>
                                </label>
                              </div>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Open Sans'] font-medium shadow-lg rounded-xl px-6 py-2">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Get Recommendations
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-[#1E3A8A]/10 to-[#90CAF9]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-l from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-[#1E3A8A]/5 to-[#90CAF9]/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

export default function AIServicesPage() {
  return (
    <AIServicesContent />
  )
}
