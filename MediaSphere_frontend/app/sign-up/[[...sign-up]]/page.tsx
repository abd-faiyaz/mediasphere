"use client"

import { SignUp } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { Users } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
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
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-gray-900">
            <motion.div
              variants={logoVariants}
              initial="hidden"
              animate="visible"
              className="bg-blue-600 p-2 rounded-lg"
            >
              <Users className="h-6 w-6 text-white" />
            </motion.div>
            Mediasphere
          </Link>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-600 mt-2"
          >
            Join our amazing community
          </motion.p>
        </motion.div>

        {/* Clerk Sign Up Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center"
        >
          <SignUp
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg border-0",
                headerTitle: "text-2xl font-bold text-gray-900",
                headerSubtitle: "text-gray-600",
                socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionLink: "text-blue-600 hover:text-blue-700",
                identityPreviewText: "text-gray-700",
                identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
              },
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "blockButton",
              },
            }}
            redirectUrl="/dashboard"
            signInUrl="/sign-in"
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-6 text-sm text-gray-600"
        >
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
