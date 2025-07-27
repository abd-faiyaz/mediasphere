"use client"

import { SignUp } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Users, Sparkles, Star, Rocket, Camera, Music, Video, Palette } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
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
    { icon: Camera, delay: 0.5, x: -25, y: -35 },
    { icon: Music, delay: 0.7, x: 35, y: -25 },
    { icon: Video, delay: 0.9, x: -35, y: 25 },
    { icon: Palette, delay: 1.1, x: 25, y: 35 },
    { icon: Star, delay: 1.3, x: 0, y: -40 },
    { icon: Rocket, delay: 1.5, x: 40, y: 0 },
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
        className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-800"
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.15"%3E%3Cpath d="M40 40c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20c11.046 0 20-8.954 20-20zm20 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20c11.046 0 20-8.954 20-20z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        />
        
        {/* Animated Gradients */}
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.4) 0%, transparent 60%)",
              "radial-gradient(circle at 70% 70%, rgba(59, 130, 246, 0.4) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 20%, rgba(147, 51, 234, 0.4) 0%, transparent 60%)",
              "radial-gradient(circle at 30% 30%, rgba(168, 85, 247, 0.4) 0%, transparent 60%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0"
        />
      </motion.div>

      {/* Floating Icons Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
            animate={{
              opacity: [0, 0.7, 0],
              scale: [0, 1.3, 0],
              x: [0, item.x, item.x * 2.5],
              y: [0, item.y, item.y * 2.5],
              rotate: [0, 270, 540],
            }}
            transition={{
              duration: 8,
              delay: item.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          >
            <item.icon className="w-10 h-10 text-white/25" />
          </motion.div>
        ))}
      </div>

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
                  rotate: 15,
                  boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)"
                }}
                className="bg-gradient-to-br from-purple-400 to-blue-600 p-3 rounded-2xl shadow-2xl"
              >
                <Users className="h-8 w-8 text-white" />
              </motion.div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              >
                Mediasphere
              </motion.span>
            </Link>
            
            <motion.div
              variants={itemVariants}
              className="mt-4"
            >
              <h1 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Rocket className="w-6 h-6 text-yellow-400" />
                Join the Revolution!
              </h1>
              <p className="text-purple-200 flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-300" />
                Create, share, and connect with creators
                <Star className="w-4 h-4 text-yellow-300" />
              </p>
            </motion.div>
          </motion.div>

          {/* Sign Up Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 30px 60px rgba(168, 85, 247, 0.3)"
            }}
            className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl"
          >
            <SignUp
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "bg-transparent shadow-none border-0",
                  headerTitle: "text-2xl font-bold text-white",
                  headerSubtitle: "text-purple-200",
                  socialButtonsBlockButton: "border border-white/30 hover:bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:border-purple-400",
                  formButtonPrimary: "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300",
                  footerActionLink: "text-purple-300 hover:text-purple-100 transition-colors duration-300",
                  identityPreviewText: "text-white",
                  identityPreviewEditButton: "text-purple-300 hover:text-purple-100",
                  formFieldInput: "bg-white/10 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm focus:border-purple-400",
                  formFieldLabel: "text-white",
                  dividerLine: "bg-white/30",
                  dividerText: "text-white/70",
                  formFieldSuccessText: "text-green-300",
                  formFieldErrorText: "text-red-300",
                },
                layout: {
                  socialButtonsPlacement: "bottom",
                  socialButtonsVariant: "blockButton",
                },
              }}
              redirectUrl="/"
              signInUrl="/sign-in"
            />
          </motion.div>

          {/* Footer */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-8"
          >
            <motion.p 
              className="text-sm text-purple-200/80 backdrop-blur-sm bg-white/5 rounded-full px-6 py-3 border border-white/10"
              whileHover={{ 
                scale: 1.05, 
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(168, 85, 247, 0.3)"
              }}
              transition={{ duration: 0.3 }}
            >
              By joining, you agree to our{" "}
              <Link href="/terms" className="text-purple-300 hover:text-white transition-colors duration-300 underline decoration-dotted">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-purple-300 hover:text-white transition-colors duration-300 underline decoration-dotted">
                Privacy Policy
              </Link>
            </motion.p>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.7, duration: 1 }}
            className="absolute -bottom-12 -left-12 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.9, duration: 1 }}
            className="absolute top-1/2 -right-8 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-full opacity-15 blur-xl"
          />
        </motion.div>
      </div>
    </div>
  )
}
