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
import { AuthGuard } from "@/components/auth-guard"

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
    {
      id: "quiz",
      title: "Quiz Generation",
      description: "Create interactive quizzes from any content to test understanding",
      icon: HelpCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "analyze",
      title: "Content Analysis",
      description: "Analyze sentiment, topics, and key insights from discussions",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
    {
      id: "recommend",
      title: "Smart Recommendations",
      description: "Get personalized suggestions for clubs, threads, and content",
      icon: Sparkles,
      color: "bg-yellow-100 text-yellow-600",
    },
  ]

  const recentResults = [
    {
      id: 1,
      type: "Summary",
      title: "AI in Education Discussion Summary",
      content: "Key points: Personalized learning, ethical concerns, privacy issues...",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      type: "Quiz",
      title: "Web Development Quiz",
      content: "10 questions generated from React documentation",
      timestamp: "1 day ago",
    },
    {
      id: 3,
      type: "Analysis",
      title: "Club Sentiment Analysis",
      content: "Overall positive sentiment (78%) in Tech Innovators discussions",
      timestamp: "2 days ago",
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
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold text-gray-900">
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
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300 rounded-xl px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back</span>
                </Button>
              </motion.div>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/media">
                <Button variant="ghost">Media</Button>
              </Link>
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
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full">
              <motion.div
                animate={{ rotate: 360 }}
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
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            AI Services
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Enhance your Mediasphere experience with powerful AI tools for content analysis, summarization, and
            personalized recommendations
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* AI Services */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="summarize" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {services.map((service, index) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                  >
                    <TabsTrigger value={service.id} className="text-xs">
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
                    <Card>
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
                            <CardTitle className="text-2xl">{service.title}</CardTitle>
                            <CardDescription className="text-base mt-1">{service.description}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {service.id === "summarize" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content to Summarize
                              </label>
                              <Textarea
                                placeholder="Paste your content here or upload a file..."
                                className="min-h-[200px]"
                              />
                            </div>
                            <div className="flex gap-4">
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Generate Summary
                                </Button>
                              </motion.div>
                              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button variant="outline">
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload File
                                </Button>
                              </motion.div>
                            </div>
                          </motion.div>
                        )}

                        {service.id === "quiz" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Source Content</label>
                              <Textarea
                                placeholder="Enter the content you want to create a quiz from..."
                                className="min-h-[150px]"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Number of Questions
                                </label>
                                <select className="w-full p-2 border border-gray-300 rounded-md">
                                  <option>5 questions</option>
                                  <option>10 questions</option>
                                  <option>15 questions</option>
                                  <option>20 questions</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                                <select className="w-full p-2 border border-gray-300 rounded-md">
                                  <option>Easy</option>
                                  <option>Medium</option>
                                  <option>Hard</option>
                                  <option>Mixed</option>
                                </select>
                              </div>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-green-600 hover:bg-green-700">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Generate Quiz
                              </Button>
                            </motion.div>
                          </motion.div>
                        )}

                        {service.id === "analyze" && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Content to Analyze</label>
                              <Textarea
                                placeholder="Enter discussion threads, comments, or any text content..."
                                className="min-h-[150px]"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm">Sentiment Analysis</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" defaultChecked className="rounded" />
                                <span className="text-sm">Topic Extraction</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                <input type="checkbox" className="rounded" />
                                <span className="text-sm">Key Insights</span>
                              </label>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-purple-600 hover:bg-purple-700">
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
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">Based on your activity:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Member of 3 technology-related clubs</li>
                                <li>• Active in AI and machine learning discussions</li>
                                <li>• Attended 5 virtual events this month</li>
                              </ul>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                What are you looking for?
                              </label>
                              <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <span className="text-sm">New Clubs</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" defaultChecked className="rounded" />
                                  <span className="text-sm">Discussion Threads</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-sm">Events</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input type="checkbox" className="rounded" />
                                  <span className="text-sm">People to Follow</span>
                                </label>
                              </div>
                            </div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button className="bg-yellow-600 hover:bg-yellow-700">
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

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Recent Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Results</CardTitle>
                  <CardDescription>Your latest AI-generated content</CardDescription>
                </CardHeader>
                <CardContent>
                  <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                    {recentResults.map((result, index) => (
                      <motion.div
                        key={result.id}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        className="border-b border-gray-200 last:border-0 pb-4 last:pb-0 cursor-pointer"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.1, type: "spring" }}
                          >
                            <Badge variant="outline" className="text-xs">
                              {result.type}
                            </Badge>
                          </motion.div>
                          <span className="text-xs text-gray-500">{result.timestamp}</span>
                        </div>
                        <h4 className="font-medium text-sm text-gray-900 mb-1">{result.title}</h4>
                        <p className="text-xs text-gray-600">{result.content}</p>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto text-xs">
                            <Download className="mr-1 h-3 w-3" />
                            Download
                          </Button>
                        </motion.div>
                      </motion.div>
                    ))}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Usage Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: "Summaries Generated", value: "12" },
                      { label: "Quizzes Created", value: "5" },
                      { label: "Content Analyzed", value: "8" },
                      { label: "Recommendations", value: "15" },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                        className="flex justify-between"
                      >
                        <span className="text-gray-600">{stat.label}</span>
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.2 + index * 0.1, type: "spring" }}
                          className="font-medium"
                        >
                          {stat.value}
                        </motion.span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pro Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-gray-600 space-y-2">
                    {[
                      "Use summarization for long discussion threads",
                      "Create quizzes to test your knowledge",
                      "Analyze club discussions for insights",
                      "Get recommendations based on your interests",
                    ].map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.4 + index * 0.1, duration: 0.4 }}
                      >
                        • {tip}
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function AIServicesPage() {
  return (
    <AuthGuard>
      <AIServicesContent />
    </AuthGuard>
  )
}
