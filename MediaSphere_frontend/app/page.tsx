"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, MessageSquare, Calendar, TrendingUp, Star, Lock, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { useAuth } from "@/lib/auth-context"
import { PageLoader } from "@/components/ui/loading"
import { useUser } from "@clerk/nextjs"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { InfiniteScrollFeed } from "@/components/feed/infinite-scroll-feed"
import { SearchBar } from "@/components/search/search-bar"

export default function HomePage() {
  const { isAuthenticated, isReady } = useAuth()
  const { isSignedIn } = useUser()
  const { stats, isLoading: isDashboardLoading, error: dashboardError, refetch } = useDashboardData()
  
  // Show loading state while authentication is being determined
  if (!isReady) {
    return <PageLoader text="Loading Mediasphere..." />
  }

  // Create dashboard stats array with real data
  const dashboardStats = [
    { 
      icon: Users, 
      value: isDashboardLoading ? "Loading..." : stats.clubsCount.toString(), 
      label: "Active Clubs", 
      color: "text-[#1E3A8A]" 
    },
    { 
      icon: MessageSquare, 
      value: isDashboardLoading ? "Loading..." : stats.discussionsCount.toString(), 
      label: "Discussions", 
      color: "text-[#1E3A8A]" 
    },
    { 
      icon: Calendar, 
      value: isDashboardLoading ? "Loading..." : stats.eventsCount.toString(), 
      label: "Events", 
      color: "text-[#1E3A8A]" 
    },
  ]

  return (
    <div className="min-h-screen bg-[#f7ecdf]">
      {/* Header */}
      <header className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent">
                Mediasphere
              </h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-8">
              <SearchBar 
                placeholder="Search clubs, threads, events..." 
                className="w-full"
              />
            </div>

            <nav className="flex items-center space-x-4">
              <Link href="/media">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">
                  Media
                </Button>
              </Link>
              <Link href="/clubs">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">
                  Clubs
                </Button>
              </Link>
              {isSignedIn ? (
                <>
                  <Link href="/ai-services">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">
                      AI Services
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">
                      Notifications
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 font-['Open Sans']">
                      Profile
                    </Button>
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
                    <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Open Sans'] font-medium shadow-lg rounded-xl px-6 py-2">
                      <Users className="mr-2 h-5 w-5" />
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent mb-4">
            Connect, Discuss, and Grow Together
          </h2>
          <p className="text-xl text-[#333333]/70 font-['Open Sans'] mb-8">
            Join clubs, participate in meaningful discussions, and attend exciting events
          </p>
          <div className="flex justify-center space-x-4">
            {isSignedIn ? (
              <Link href="/profile">
                <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Open Sans'] font-medium shadow-lg rounded-xl px-6 py-3">
                  <Users className="mr-2 h-5 w-5" />
                  Go to Profile
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Open Sans'] font-medium shadow-lg rounded-xl px-6 py-3">
                  <Users className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/clubs">
              <Button variant="outline" className="border-[#90CAF9]/30 hover:border-[#1E3A8A] text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] font-['Open Sans'] font-medium rounded-xl px-6 py-3">
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Clubs
              </Button>
            </Link>
          </div>
        </div>

        {/* Content based on authentication status */}
        {isSignedIn ? (
          // Authenticated user content - personalized infinite scroll feed
          <div className="space-y-8">
            {/* Stats Dashboard - Real data from backend */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardStats.map((stat, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-xl border border-[#90CAF9]/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-['Nunito'] font-bold text-[#333333]">{stat.value}</div>
                    <div className="text-[#333333]/70 font-['Open Sans']">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Error handling for dashboard data */}
            {dashboardError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-['Open Sans']">Failed to load dashboard data: {dashboardError}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refetch}
                    className="ml-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {/* Infinite Scroll Feed */}
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-[#90CAF9]/20 p-6">
              <InfiniteScrollFeed 
                defaultFeedType="personalized" 
                showTabs={true}
                className="bg-transparent"
              />
            </div>
          </div>
        ) : (
          // Non-authenticated user content - trending feed and features preview
          <div className="space-y-12">
            {/* Trending Feed for Anonymous Users */}
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl border border-[#90CAF9]/20 p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent mb-2">
                  Trending Discussions
                </h3>
                <p className="text-[#333333]/70 font-['Open Sans']">See what's popular in our community</p>
              </div>
              <InfiniteScrollFeed 
                defaultFeedType="trending" 
                showTabs={false}
                className="bg-transparent"
              />
            </div>

            {/* Features Preview */}
            <div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent mb-4">
                  What You Can Do
                </h3>
                <p className="text-[#333333]/70 font-['Open Sans']">Join our community to unlock all features</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Users,
                    title: "Join Clubs",
                    description: "Connect with like-minded people in your favorite topics",
                    color: "text-[#1E3A8A]",
                  },
                  {
                    icon: MessageSquare,
                    title: "Start Discussions",
                    description: "Share your thoughts and engage in meaningful conversations",
                    color: "text-[#1E3A8A]",
                  },
                  {
                    icon: Calendar,
                    title: "Attend Events",
                    description: "Participate in virtual and in-person community events",
                    color: "text-[#1E3A8A]",
                  },
                ].map((feature, index) => (
                  <Card key={index} className="text-center p-6 bg-white/90 backdrop-blur-xl border border-[#90CAF9]/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                    <feature.icon className={`h-12 w-12 ${feature.color} mx-auto mb-4`} />
                    <h4 className="text-lg font-['Nunito'] font-semibold text-[#333333] mb-2">{feature.title}</h4>
                    <p className="text-[#333333]/70 font-['Open Sans']">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Card className="p-8 bg-gradient-to-br from-[#F0F7FF] to-white border border-[#90CAF9]/30 rounded-2xl shadow-lg">
                <Lock className="h-12 w-12 text-[#1E3A8A] mx-auto mb-4" />
                <h3 className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent mb-4">
                  Ready to Get Started?
                </h3>
                <p className="text-[#333333]/70 font-['Open Sans'] mb-6">
                  Sign in to access personalized feeds, join clubs, and start participating in discussions.
                </p>
                <Link href="/sign-in">
                  <Button className="bg-[#1E3A8A] hover:bg-[#15306E] text-white font-['Open Sans'] font-medium shadow-lg rounded-xl px-6 py-3">
                    <Users className="mr-2 h-5 w-5" />
                    Sign In to Continue
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
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
