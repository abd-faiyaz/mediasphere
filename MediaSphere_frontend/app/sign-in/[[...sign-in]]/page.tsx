"use client"

import { SignIn } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Users, Sparkles, Globe, Heart, Camera, Music, Video, Palette } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function SignInPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [iconPositions, setIconPositions] = useState<Array<{x: number, y: number}>>([])

  // Handle client-side mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true)
    // Generate random positions only on client side
    setIconPositions([
      { x: Math.random() * 100, y: Math.random() * 100 },
      { x: Math.random() * 100, y: Math.random() * 100 },
      { x: Math.random() * 100, y: Math.random() * 100 },
      { x: Math.random() * 100, y: Math.random() * 100 },
    ])
  }, [])
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
        duration: 0.8,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  }

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: 0.3,
      },
    },
  }

  const floatingIcons = [
    { icon: Camera, delay: 0.5, x: -20, y: -30 },
    { icon: Music, delay: 0.7, x: 30, y: -20 },
    { icon: Video, delay: 0.9, x: -30, y: 20 },
    { icon: Palette, delay: 1.1, x: 20, y: 30 },
  ]

  const backgroundVariants = {
    hidden: { scale: 1.1, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut",
      },
    },
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        variants={backgroundVariants}
        initial="hidden"
        animate="visible"
        className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800"
      >
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        />
        
        {/* Animated Gradients */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 80%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 60%, rgba(119, 255, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0"
        />
      </motion.div>

      {/* Floating Icons Background
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {isMounted && floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              scale: [0, 1.2, 0],
              x: [0, item.x, item.x * 2],
              y: [0, item.y, item.y * 2],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 6,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute"
            style={{
              left: iconPositions[index] ? `${iconPositions[index].x}%` : '50%',
              top: iconPositions[index] ? `${iconPositions[index].y}%` : '50%',
            }}
          >
            <item.icon className="w-8 h-8 text-white/20" />
          </motion.div>
        ))}
      </div> */}

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="w-full max-w-md"
        >
          {/* Logo Section */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-3 text-3xl font-bold text-white">
              <motion.div
                variants={logoVariants}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 10,
                  boxShadow: "0 0 30px rgba(255, 255, 255, 0.5)"
                }}
                className="bg-gradient-to-br from-blue-400 to-purple-600 p-3 rounded-2xl shadow-2xl"
              >
                <Users className="h-8 w-8 text-white" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
              >
                Mediasphere
              </motion.span>
            </Link>
            
            <motion.div
              variants={itemVariants}
              className="mt-4"
            >
              <h1 className="text-2xl font-bold text-white mb-2">Welcome Back!</h1>
              <p className="text-blue-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4" />
                Continue your creative journey
                <Heart className="w-4 h-4 text-pink-300" />
              </p>
            </motion.div>
          </motion.div>

          {/* Sign In Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.3)"
            }}
            className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl"
          >
            <SignIn
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "bg-transparent shadow-none border-0",
                  headerTitle: "text-2xl font-bold text-white",
                  headerSubtitle: "text-blue-200",
                  socialButtonsBlockButton: "border border-white/30 hover:bg-white/10 text-white backdrop-blur-sm transition-all duration-300",
                  formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300",
                  footerActionLink: "text-blue-300 hover:text-blue-100 transition-colors duration-300",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-blue-300 hover:text-blue-100",
                  formFieldInput: "bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm",
                  formFieldLabel: "text-white",
                  dividerLine: "bg-white/30",
                  dividerText: "text-white/70",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  socialButtonsVariant: "blockButton",
                },
              }}
              redirectUrl="/"
              signUpUrl="/sign-up"
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-8"
          >
            <motion.p 
              className="text-sm text-blue-200/80 backdrop-blur-sm bg-white/5 rounded-full px-6 py-3 border border-white/10"
              whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
              transition={{ duration: 0.3 }}
            >
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-blue-300 hover:text-white transition-colors duration-300 underline decoration-dotted">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-blue-300 hover:text-white transition-colors duration-300 underline decoration-dotted">
                Privacy Policy
              </Link>
            </motion.p>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.7, duration: 1 }}
            className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-full opacity-20 blur-xl"
          />
        </motion.div>
      </div>
    </div>
  )
}
