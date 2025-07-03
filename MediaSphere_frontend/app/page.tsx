"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Users, MessageSquare, Calendar, TrendingUp, Star, ChevronDown, Play, Heart, Eye, ArrowDown, Globe, Zap, Target, Award, Rocket } from "lucide-react"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { PageLoader } from "@/components/ui/loading"

export default function HomePage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const [currentSection, setCurrentSection] = useState(0)
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll()
  
  // Transform values for parallax effects
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-50%'])

  // 20+ Beautiful background images for different sections
  const backgroundImages = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop', // Community gathering
    'https://images.unsplash.com/photo-1515378791036-0648a814c963?w=1920&h=1080&fit=crop', // Discussion/meeting
    'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1920&h=1080&fit=crop', // Events/conference
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920&h=1080&fit=crop', // Innovation/tech
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1920&h=1080&fit=crop', // Growth/success
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&h=1080&fit=crop', // Collaboration
    'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1920&h=1080&fit=crop', // Learning
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1920&h=1080&fit=crop', // Networking
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1920&h=1080&fit=crop', // Business success
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=1080&fit=crop', // Technology
    'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920&h=1080&fit=crop', // Future/innovation
    'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=1920&h=1080&fit=crop', // Creative thinking
    'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?w=1920&h=1080&fit=crop', // Ideas/brainstorm
    'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?w=1920&h=1080&fit=crop', // Vision/planning
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop', // Excellence
    'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?w=1920&h=1080&fit=crop', // Achievement
    'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1920&h=1080&fit=crop', // Journey/path
    'https://images.unsplash.com/photo-1552508744-1696d4464960?w=1920&h=1080&fit=crop', // Inspiration
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1920&h=1080&fit=crop', // Connection
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop', // Mountains/goals
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop', // Digital world
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop', // Global connection
    'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop', // Team spirit
  ]

  // Featured content sections
  const sections = [
    {
      title: "Welcome to Mediasphere",
      subtitle: "Connect, Discuss, and Grow Together",
      description: "Join the ultimate community platform where ideas flourish and connections thrive",
      cta: "Begin Your Journey",
      icon: Rocket
    },
    {
      title: "Build Communities",
      subtitle: "Create Lasting Connections",
      description: "Join clubs that match your interests and build meaningful relationships",
      cta: "Explore Clubs",
      icon: Users
    },
    {
      title: "Engage in Discussions",
      subtitle: "Share Your Voice",
      description: "Participate in thought-provoking conversations that matter to you",
      cta: "Start Discussing",
      icon: MessageSquare
    },
    {
      title: "Attend Amazing Events",
      subtitle: "Never Miss Out",
      description: "Join virtual and in-person events that inspire and educate",
      cta: "View Events",
      icon: Calendar
    },
    {
      title: "Innovate Together",
      subtitle: "Shape the Future",
      description: "Collaborate on projects that make a real difference in the world",
      cta: "Start Creating",
      icon: Zap
    },
    {
      title: "Learn & Grow",
      subtitle: "Expand Your Horizons",
      description: "Access resources, tutorials, and mentorship to accelerate your growth",
      cta: "Start Learning",
      icon: Target
    },
    {
      title: "Achieve Excellence",
      subtitle: "Reach New Heights",
      description: "Set goals, track progress, and celebrate achievements with your community",
      cta: "Set Goals",
      icon: Award
    },
    {
      title: "Global Impact",
      subtitle: "Make a Difference",
      description: "Connect with changemakers worldwide and create positive impact",
      cta: "Join Movement",
      icon: Globe
    }
  ]

  // Featured vlogs/videos
  const featuredVlogs = [
    {
      id: 1,
      title: "Building Strong Communities",
      thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
      duration: "5:42",
      views: "12.5K",
      likes: "892"
    },
    {
      id: 2,
      title: "The Power of Discussion",
      thumbnail: "https://images.unsplash.com/photo-1515378791036-0648a814c963?w=400&h=300&fit=crop",
      duration: "8:15",
      views: "8.3K",
      likes: "654"
    },
    {
      id: 3,
      title: "Innovation Through Collaboration",
      thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
      duration: "6:28",
      views: "15.7K",
      likes: "1.2K"
    },
    {
      id: 4,
      title: "Future of Digital Communities",
      thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=300&fit=crop",
      duration: "4:53",
      views: "9.8K",
      likes: "743"
    }
  ]

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault()
        window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Show loading state
  if (authLoading) {
    return <PageLoader text="Loading Mediasphere..." />
  }

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Fixed Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center space-x-4"
            >
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Mediasphere
              </h1>
            </motion.div>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex-1 max-w-lg mx-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
                <Input 
                  placeholder="Search clubs, threads, events..." 
                  className="pl-10 w-full bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70"
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
                <Button variant="ghost" className="text-white hover:bg-white/20">Clubs</Button>
              </Link>
              
              {!isAuthenticated && (
                <Link href="/sign-in">
                  <Button variant="ghost" className="text-white hover:bg-white/20">Sign In</Button>
                </Link>
              )}
              
              {/* Triple-dot menu */}
              <div className="relative group">
                <Button variant="ghost" className="text-white hover:bg-white/20 px-3">
                  <span className="text-xl">⋯</span>
                </Button>
                
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white/90 backdrop-blur-md rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-2">
                    <Link href="/about">
                      <div className="px-4 py-2 text-gray-700 hover:bg-white/50 cursor-pointer transition-colors">
                        Learn About Us
                      </div>
                    </Link>
                    <Link href="/theme">
                      <div className="px-4 py-2 text-gray-700 hover:bg-white/50 cursor-pointer transition-colors">
                        Theme of Frontend
                      </div>
                    </Link>
                    <Link href="/sign-up">
                      <div className="px-4 py-2 text-gray-700 hover:bg-white/50 cursor-pointer transition-colors">
                        Get Started
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.nav>
          </div>
        </div>
      </motion.header>

      {/* Main Scrollable Sections */}
      {sections.map((section, index) => {
        const imageIndex = index % backgroundImages.length
        return (
          <motion.section
            key={index}
            className="relative h-screen flex items-center justify-center overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${backgroundImages[imageIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          >
            <motion.div
              style={{ y: textY }}
              className="text-center text-white z-10 max-w-4xl mx-auto px-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <section.icon className="h-16 w-16 mx-auto mb-6 text-white/90" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent"
              >
                {section.title}
              </motion.h1>
              
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl font-semibold mb-6 text-white/90"
              >
                {section.subtitle}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-xl md:text-2xl mb-8 text-white/80 max-w-2xl mx-auto"
              >
                {section.description}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
                >
                  {section.cta}
                  <ArrowDown className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>

            {/* Scroll indicator for first section */}
            {index === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
                onClick={scrollToNext}
              >
                <ChevronDown className="h-8 w-8 text-white/70 hover:text-white transition-colors" />
              </motion.div>
            )}
          </motion.section>
        )
      })}

      {/* Featured Content Section */}
      <motion.section
        className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Featured Stories
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Discover inspiring stories from our community members
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredVlogs.map((vlog, index) => (
              <motion.div
                key={vlog.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-xl"
              >
                <div className="relative">
                  <img
                    src={vlog.thumbnail}
                    alt={vlog.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                  <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                    {vlog.duration}
                  </Badge>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {vlog.title}
                  </h3>
                  <div className="flex items-center justify-between text-white/70 text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{vlog.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{vlog.likes}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA Section */}
      <motion.section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${backgroundImages[backgroundImages.length - 1]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center text-white z-10 max-w-4xl mx-auto px-4"
        >
          <h2 className="text-6xl md:text-8xl font-bold mb-8 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Ready to Begin?
          </h2>
          <p className="text-2xl md:text-3xl mb-12 text-white/90">
            Join thousands of innovators, creators, and changemakers
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xl px-12 py-6 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                Start Your Journey
                <Rocket className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/clubs">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-xl px-12 py-6 rounded-full"
              >
                Explore Communities
                <Users className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  )
}
