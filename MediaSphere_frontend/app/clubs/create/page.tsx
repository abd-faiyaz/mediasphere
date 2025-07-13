"use client"

// Force dynamic rendering to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Plus, Sparkles, Users, Globe, Star, CheckCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"

interface MediaType {
  id: string
  name: string
  description: string
}

interface CreateClubForm {
  name: string
  description: string
  mediaTypeId: string
}

export default function CreateClub() {
  const [formData, setFormData] = useState<CreateClubForm>({
    name: "",
    description: "",
    mediaTypeId: ""
  })
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [showConfetti, setShowConfetti] = useState(false);
  const { user } = useAuth()
  const { isSignedIn } = useUser()
  const router = useRouter()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Fetch media types on component mount
  useEffect(() => {
    fetchMediaTypes()
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in')
    }
  }, [isSignedIn, router])

  const fetchMediaTypes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/media-types/`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch media types')
      }

      const data = await response.json()
      setMediaTypes(data)
    } catch (error) {
      console.error('Error fetching media types:', error)
      toast({
        title: "Error",
        description: "Failed to load media types. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateClubForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Update current step based on filled fields
    const newFormData = { ...formData, [field]: value }
    let step = 1
    if (newFormData.name.trim()) step = 2
    if (newFormData.description.trim()) step = 3
    if (newFormData.mediaTypeId) step = 4
    setCurrentStep(step)
  }

  const getStepTooltip = (index: number) => {
    const tooltips = [
      "Fill in basic club information including name and description",
      "Set up club visibility and membership settings",
      "Add club rules and guidelines",
      "Review and finalize club details"
    ];
    return tooltips[index];
  };

  // Confetti component using Framer Motion
  const Confetti = () => {
    const count = 50;
    return (
      <div className="fixed inset-0 pointer-events-none z-50">
        {Array.from({ length: count }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2"
            initial={{
              top: "50%",
              left: "50%",
              scale: 0,
              opacity: 1,
              backgroundColor: i % 2 === 0 ? "#1E3A8A" : "#90CAF9"
            }}
            animate={{
              top: ["50%", `${Math.random() * 20}%`],
              left: ["50%", `${Math.random() * 100}%`],
              scale: [0, 1],
              opacity: [1, 0],
            }}
            transition={{
              duration: 1 + Math.random() * 2,
              ease: "easeOut",
            }}
            style={{
              borderRadius: i % 2 === 0 ? "50%" : "0",
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    );
  };

  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Club name is required.",
      })
      return
    }

    if (!formData.description.trim()) {
      toast({
        title: "Error",
        description: "Club description is required.",
      })
      return
    }

    if (!formData.mediaTypeId) {
      toast({
        title: "Error",
        description: "Please select a media type.",
      })
      return
    }

    try {
      setSubmitting(true)
      const token = authService.getToken()
      
      const selectedMediaType = mediaTypes.find(mt => mt.id === formData.mediaTypeId)
      
      const clubData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        mediaType: selectedMediaType
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clubData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Response error:', errorText)
        throw new Error('Failed to create club')
      }

      const createdClub = await response.json()
      
      toast({
        title: "Success",
        description: "Club created successfully!",
      })

      // Trigger confetti on successful submission
      triggerConfetti()

      // Redirect to the new club's page
      router.push(`/clubs/${createdClub.id}`)
    } catch (error) {
      console.error('Error creating club:', error)
      toast({
        title: "Error",
        description: "Failed to create club. Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center bg-white/90 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-[#90CAF9]/20 relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative mb-6"
          >
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-[#333333]/70 text-lg font-['Open Sans']"
          >
            Loading media types...
          </motion.p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7ecdf] relative overflow-hidden">
      {showConfetti && <Confetti />}
      {/* Static decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient circles with fixed positions */}
        <div className="absolute top-[10%] left-[15%] w-[40rem] h-[40rem] bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full filter blur-3xl opacity-50" />
        <div className="absolute bottom-[15%] right-[10%] w-[35rem] h-[35rem] bg-gradient-to-r from-indigo-400/30 to-pink-400/30 rounded-full filter blur-3xl opacity-50" />
      </div>
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
        className="absolute top-1/3 right-20 w-32 h-32 bg-gradient-to-r from-blue-400/30 to-purple-500/30 rounded-full opacity-30 blur-xl"
      />
      <motion.div
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "4s" }}
        className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-gradient-to-r from-pink-400/30 to-purple-500/30 rounded-full opacity-40 blur-xl"
      />

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-slate-100 to-purple-400 bg-clip-text text-transparent">
                Mediasphere
              </Link>
            </motion.div>
            <nav className="flex items-center space-x-4">
              {[
                { href: "/clubs", label: "Clubs" },
                { href: "/ai-services", label: "AI Services" },
                { href: "/notifications", label: "Notifications" },
                { href: "/profile", label: "Profile" }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.6 }}
                >
                  <Link href={item.href}>
                    <Button variant="ghost" className="text-slate-300 hover:text-purple-400 hover:bg-slate-800/50 transition-all duration-300">
                      {item.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </nav>
          </div>
        </div>
      </motion.header>

      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        {/* Back Button */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <Link href="/clubs">
            <motion.div
              whileHover={{ x: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Button variant="ghost" className="flex items-center gap-2 text-slate-300 hover:text-purple-400 hover:bg-slate-800/50 transition-all duration-300">
                <ArrowLeft className="h-4 w-4" />
                Back to Clubs
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Progress Indicator */}
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <motion.div
                key={step}
                className={`flex items-center ${step < 4 ? 'flex-1' : ''}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: step * 0.1, duration: 0.6 }}
              >
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    currentStep >= step
                      ? 'bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] text-white shadow-lg'
                      : 'bg-white/50 text-[#333333]/50 border-2 border-[#90CAF9]/30'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={currentStep >= step ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {currentStep > step ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    step
                  )}
                </motion.div>
                {step < 4 && (
                  <motion.div
                    className={`flex-1 h-1 mx-2 rounded-full transition-all duration-500 relative overflow-hidden ${
                      currentStep > step ? 'bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] shadow-[0_0_10px_rgba(30,58,138,0.3)]' : 'bg-[#90CAF9]/20'
                    }`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: currentStep > step ? 1 : 0 }}
                    style={{ transformOrigin: 'left' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
          <motion.div
            className="text-center mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-[#333333]/70 font-['Open Sans']">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Club Name' :
                currentStep === 2 ? 'Description' :
                currentStep === 3 ? 'Media Type' :
                'Review & Create'
              }
            </p>
          </motion.div>
        </motion.div>

        {/* Page Header */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] rounded-full mb-4 shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
          >
            <Sparkles className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-5xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] via-[#4E6FBA] to-[#90CAF9] bg-clip-text text-transparent pb-2 relative">
            Create a New Club
            <div className="absolute bottom-0 left-0 w-1/4 h-1 bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] rounded-full"></div>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-[#333333] mt-4 font-['Open Sans'] text-lg tracking-wide"
          >
            Start a community around your favorite media
          </motion.p>
        </motion.div>

        {/* Create Club Form */}
        <motion.div
          variants={itemVariants}
          className="relative"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-2xl blur-xl"
            animate={{
              scale: [1, 1.02, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <Card className="max-w-2xl mx-auto relative bg-white/90 backdrop-blur-xl border border-[#90CAF9]/30 shadow-[0_8px_28px_-6px_rgba(30,58,138,0.12)] rounded-2xl overflow-hidden transform-gpu hover:scale-[1.01] transition-all duration-300 hover:shadow-[0_12px_32px_-8px_rgba(30,58,138,0.15)]">
            <motion.div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: (currentStep - 1) / 3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            <CardHeader className="text-center pb-6">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl text-slate-200">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg"
                >
                  <Plus className="h-6 w-6 text-white" />
                </motion.div>
                Club Information
              </CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Fill in the details below to create your new club and start building your community
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={itemVariants}
                    className="space-y-8"
                  >
                    {currentStep === 1 && (
                      <motion.div
                        className="space-y-4"
                        variants={itemVariants}
                        transition={{ staggerChildren: 0.1 }}
                      >
                        {/* Club Name */}
                        <motion.div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-lg font-medium text-[#333333] flex items-center gap-2 font-['Nunito']">
                              <Users className="h-5 w-5 text-[#1E3A8A]" />
                              Club Name *
                            </Label>
                            <motion.div
                              animate={focusedField === 'name' ? { scale: 1.02 } : { scale: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Input
                                id="name"
                                placeholder="Enter an awesome club name..."
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                onFocus={() => setFocusedField('name')}
                                onBlur={() => setFocusedField(null)}
                                className="text-lg p-4 border-[#90CAF9]/30 bg-gradient-to-r from-[#F0F7FF]/50 to-white text-[#333333] placeholder-[#90CAF9]/70 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] rounded-xl shadow-[inset_0_2px_6px_-2px_rgba(0,0,0,0.05)] hover:shadow-[inset_0_2px_8px_-2px_rgba(0,0,0,0.08)] transition-shadow"
                                required
                              />
                            </motion.div>
                          </div>
                          <AnimatePresence>
                            {formData.name && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-green-400"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Great choice!</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Club Description */}
                        <motion.div
                          className="space-y-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Label htmlFor="description" className="text-lg font-medium text-slate-300 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-purple-500" />
                            Description *
                          </Label>
                          <motion.div
                            animate={focusedField === 'description' ? { scale: 1.02 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Textarea
                              id="description"
                              placeholder="Describe what makes your club special and what members can expect..."
                              value={formData.description}
                              onChange={(e) => handleInputChange('description', e.target.value)}
                              onFocus={() => setFocusedField('description')}
                              onBlur={() => setFocusedField(null)}
                              rows={4}
                              className="text-lg p-4 border-2 border-slate-700/50 bg-slate-800/50 text-slate-200 placeholder-slate-400 focus:border-purple-500 transition-all duration-300 rounded-xl resize-none"
                              required
                            />
                          </motion.div>
                          <AnimatePresence>
                            {formData.description && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-green-400"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Perfect description!</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                    </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        className="space-y-4"
                        variants={itemVariants}
                        transition={{ staggerChildren: 0.1 }}
                      >
                        {/* Media Type */}
                        <motion.div
                          className="space-y-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4, duration: 0.6 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <Label htmlFor="mediaType" className="text-lg font-medium text-slate-300 flex items-center gap-2">
                            <Star className="h-5 w-5 text-pink-400" />
                            Media Type *
                          </Label>
                          <motion.div
                            animate={focusedField === 'mediaType' ? { scale: 1.02 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Select
                              value={formData.mediaTypeId}
                              onValueChange={(value) => handleInputChange('mediaTypeId', value)}
                            >
                              <SelectTrigger 
                                className="text-lg p-4 border-2 border-slate-700/50 bg-slate-800/50 text-slate-200 focus:border-pink-500 transition-all duration-300 rounded-xl"
                                onFocus={() => setFocusedField('mediaType')}
                                onBlur={() => setFocusedField(null)}
                              >
                                <SelectValue placeholder="Select the perfect media type for your club" className="text-slate-400" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-2 border-slate-700/50 bg-slate-800/90 backdrop-blur-xl">
                                {mediaTypes.map((mediaType, index) => (
                                  <motion.div
                                    key={mediaType.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                  >
                                    <SelectItem value={mediaType.id} className="p-4 rounded-lg text-slate-200 hover:bg-slate-700/50">
                                      <div className="flex flex-col">
                                        <span className="font-medium text-lg text-slate-200">{mediaType.name}</span>
                                        <span className="text-sm text-slate-400">{mediaType.description}</span>
                                      </div>
                                    </SelectItem>
                                  </motion.div>
                                ))}
                              </SelectContent>
                            </Select>
                          </motion.div>
                          <AnimatePresence>
                            {formData.mediaTypeId && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center gap-2 text-green-400"
                              >
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm">Excellent choice!</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                    </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        className="space-y-4"
                        variants={itemVariants}
                        transition={{ staggerChildren: 0.1 }}
                      >
                        {/* Optional Details - New Section */}
                        <Card className="w-full max-w-2xl">
                          <CardHeader>
                            <CardTitle>Optional Details</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Collapsible>
                              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">Advanced Settings</span>
                                <ChevronDown className="h-4 w-4" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="p-4">
                                <div className="space-y-4">
                                  <div className="grid w-full gap-1.5">
                                    <Label htmlFor="clubTags">Club Tags</Label>
                                    <Input
                                      id="clubTags"
                                      placeholder="Add tags separated by commas"
                                      className="w-full"
                                    />
                                  </div>
                                  <div className="grid w-full gap-1.5">
                                    <Label htmlFor="customRules">Custom Rules</Label>
                                    <Textarea
                                      id="customRules"
                                      placeholder="Add any custom rules for your club"
                                      className="w-full"
                                    />
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </CardContent>
                        </Card>
                    </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Submit Buttons */}
                <motion.div
                  className="flex gap-4 pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <Link href="/clubs" className="flex-1">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full"
                    >
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full h-14 text-lg font-medium border-2 border-slate-700/50 text-slate-300 hover:bg-slate-800/50 hover:text-slate-200 transition-all duration-300 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                  </Link>
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-14 text-lg font-['Nunito'] font-medium bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] hover:from-[#15306E] hover:to-[#7FB9F8] text-white transition-all duration-300 rounded-xl shadow-[0_4px_12px_-2px_rgba(30,58,138,0.2)]"
                      disabled={submitting}
                    >
                      <AnimatePresence mode="wait">
                        {submitting ? (
                          <motion.div
                            key="submitting"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-3"
                          >
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Loader2 className="h-5 w-5" />
                            </motion.div>
                            Creating Your Club...
                          </motion.div>
                        ) : (
                          <motion.div
                            key="create"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-3"
                          >
                            <Plus className="h-5 w-5" />
                            Create Club
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Confetti Component */}
        {showConfetti && <Confetti />}
      </motion.main>
    </div>
  )
}