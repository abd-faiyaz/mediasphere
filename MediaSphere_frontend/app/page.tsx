"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, MessageSquare, Calendar, TrendingUp, Star, Lock } from "lucide-react"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { useAuth } from "@/lib/auth-context"
import { PageLoader } from "@/components/ui/loading"
import { useUser } from "@clerk/nextjs"

export default function HomePage() {
  const { isAuthenticated, isReady } = useAuth()
  const { isSignedIn } = useUser()
  // Show loading state while authentication is being determined
  if (!isReady) {
    return <PageLoader text="Loading Mediasphere..." />
  }

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#333333]/50 h-4 w-4" />
                <Input 
                  placeholder="Search clubs, threads, events..." 
                  className="pl-10 w-full bg-white/90 border-[#90CAF9]/30 focus:border-[#1E3A8A] text-[#333333] placeholder:text-[#333333]/50 font-['Open Sans']"
                  type="text"
                />
              </div>
            </div>

            <nav className="flex items-center space-x-4">
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
          // Authenticated user content - will be populated with real data
          <div className="space-y-12">
            {/* Stats - Will be fetched from backend */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              {[
                { icon: Users, value: "Loading...", label: "Active Clubs", color: "text-[#1E3A8A]" },
                { icon: MessageSquare, value: "Loading...", label: "Discussions", color: "text-[#1E3A8A]" },
                { icon: Calendar, value: "Loading...", label: "Events", color: "text-[#1E3A8A]" },
                { icon: Star, value: "Loading...", label: "Members", color: "text-[#1E3A8A]" },
              ].map((stat, index) => (
                <Card key={index} className="bg-white/90 backdrop-blur-xl border border-[#90CAF9]/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
                    <div className="text-2xl font-['Nunito'] font-bold text-[#333333]">{stat.value}</div>
                    <div className="text-[#333333]/70 font-['Open Sans']">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Placeholder for real data sections */}
            <div className="text-center py-12 bg-gradient-to-br from-[#F0F7FF] to-white rounded-2xl border border-[#90CAF9]/20">
              <MessageSquare className="h-12 w-12 text-[#1E3A8A]/30 mx-auto mb-4" />
              <h3 className="text-xl font-['Nunito'] font-semibold text-[#1E3A8A] mb-2">Loading Your Content</h3>
              <p className="text-[#333333]/70 font-['Open Sans']">We're fetching your personalized clubs, discussions, and events...</p>
            </div>
          </div>
        ) : (
          // Non-authenticated user content - simple landing page
          <div className="space-y-12">
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
                  Sign in to access all features, join clubs, and start participating in discussions.
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
