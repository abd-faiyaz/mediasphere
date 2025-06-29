"use client"

// Force dynamic rendering to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
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

export default function CreateClubPage() {
  const [formData, setFormData] = useState<CreateClubForm>({
    name: "",
    description: "",
    mediaTypeId: ""
  })
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  // Fetch media types on component mount
  useEffect(() => {
    fetchMediaTypes()
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/sign-in')
    }
  }, [isAuthenticated, router])

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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Link href="/clubs">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Clubs
            </Button>
          </Link>
        </motion.div>

        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Create a New Club</h1>
          <p className="text-gray-600 mt-2">Start a community around your favorite media</p>
        </motion.div>

        {/* Create Club Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Club Information
              </CardTitle>
              <CardDescription>
                Fill in the details below to create your new club
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Club Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Club Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter club name..."
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Club Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your club is about..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Media Type */}
                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type *</Label>
                  <Select
                    value={formData.mediaTypeId}
                    onValueChange={(value) => handleInputChange('mediaTypeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a media type" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaTypes.map((mediaType) => (
                        <SelectItem key={mediaType.id} value={mediaType.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{mediaType.name}</span>
                            <span className="text-sm text-gray-500">{mediaType.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Link href="/clubs" className="flex-1">
                    <Button type="button" variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Club
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 