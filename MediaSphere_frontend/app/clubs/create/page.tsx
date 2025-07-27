"use client"

// Force dynamic rendering to avoid SSG issues with Clerk
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Plus, X, Globe, Users, Film } from "lucide-react"
import Link from "next/link"
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

interface Media {
  id: string;
  title: string;
  description?: string;
  author?: string;
  releaseYear?: number;
  genre?: string;
}

interface CreateClubForm {
  name: string
  description: string
  mediaTypeId: string 
  selectedMediaId: string
}

export default function CreateClub() {
  const [formData, setFormData] = useState<CreateClubForm>({
    name: "",
    description: "",
    mediaTypeId: "",
    selectedMediaId: "",
  })
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([])
  const [availableMedia, setAvailableMedia] = useState<Media[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { user } = useAuth()
  const { isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    fetchMediaTypes()
  }, [])

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in')
    }
  }, [isSignedIn, router])

  // Fetch media when media type changes
  useEffect(() => {
    if (formData.mediaTypeId) {
      fetchMediaByType(formData.mediaTypeId)
    } else {
      setAvailableMedia([])
      setFormData(prev => ({ ...prev, selectedMediaId: "" }))
    }
  }, [formData.mediaTypeId])

  const fetchMediaTypes = async () => {
    try {
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

  const fetchMediaByType = async (mediaTypeId: string) => {
    try {
      setMediaLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/media/by-media-type/${mediaTypeId}`)

      if (!response.ok) {
        throw new Error('Failed to fetch media')
      }

      const data = await response.json()
      setAvailableMedia(data)
    } catch (error) {
      console.error('Error fetching media:', error)
      setAvailableMedia([])
      toast({
        title: "Error",
        description: "Failed to load media for this type. Please try again.",
        variant: "destructive"
      })
    } finally {
      setMediaLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateClubForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear selected media when media type changes
    if (field === 'mediaTypeId') {
      setFormData(prev => ({
        ...prev,
        selectedMediaId: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.mediaTypeId || !formData.selectedMediaId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    try {
      setSubmitting(true)
      const token = authService.getToken()

      const selectedMediaType = mediaTypes.find(mt => mt.id === formData.mediaTypeId)

    const clubData = {
      name: formData.name,
      description: formData.description,
      mediaTypeId: formData.mediaTypeId, // Send as UUID string
      linkedMediaId: formData.selectedMediaId, // Send as UUID string, renamed to linkedMediaId
    }
    console.log('Submitting club data:', clubData)
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
      <div className="min-h-screen bg-[#f7ecdf] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
          <p className="text-[#333333]/70 font-['Open Sans']">Loading media types...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7ecdf]">
      {/* Header */}
      <header className="bg-gradient-to-b from-white/95 to-white/80 backdrop-blur-xl border-b border-[#90CAF9]/30 sticky top-0 z-50 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/" 
                className="text-2xl font-['Nunito'] font-bold bg-gradient-to-r from-[#1E3A8A] to-[#90CAF9] bg-clip-text text-transparent"
              >
                Mediasphere
              </Link>

              {/* Back Button */}
              <Link href="/clubs">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex items-center gap-2 text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300 rounded-xl px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to Clubs</span>
                </Button>
              </Link>
            </div>
            <nav className="flex items-center space-x-4">
              <Link href="/media">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                  Media
                </Button>
              </Link>
              <Link href="/clubs">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                  Clubs
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost" className="text-[#333333] hover:text-[#1E3A8A] hover:bg-[#F0F7FF] transition-all duration-300">
                  Profile
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Container with CreateEventModal styling */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Create New Club</h2>
                <p className="text-blue-100 mt-1">Start a community around your favorite media</p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Globe className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Club Name Input */}
              <div>
                <Label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Club Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="What's your club about?"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>

              {/* Description Input */}
              <div>
                <Label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your club, what members can expect..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  rows={4}
                  required
                />
              </div>

              {/* Media Type Selection */}
              <div>
                <Label htmlFor="mediaType" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-500" /> Media Type *
                </Label>
                <Select
                  value={formData.mediaTypeId}
                  onValueChange={(value) => handleInputChange('mediaTypeId', value)}
                >
                  <SelectTrigger className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm">
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

              {/* Media Selection Dropdown */}
              <div>
                <Label htmlFor="selectedMediaId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Media <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={formData.selectedMediaId} 
                  onValueChange={(value) => handleInputChange('selectedMediaId', value)}
                  disabled={!formData.mediaTypeId || mediaLoading}
                >
                  <SelectTrigger className={`w-full p-4 border-2 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 backdrop-blur-sm ${
                    !formData.mediaTypeId || mediaLoading 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-white/50 border-gray-200 hover:border-green-400'
                  }`}>
                    <SelectValue placeholder={
                      mediaLoading 
                        ? "Loading media..." 
                        : !formData.mediaTypeId 
                          ? "Select a media type first" 
                          : "Select a media"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {availableMedia.map((media) => (
                      <SelectItem key={media.id} value={media.id.toString()}>
                        {media.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Club Value Input (Optional) */}
              {/* <div>
                <Label htmlFor="clubvalue" className="block text-sm font-semibold text-gray-700 mb-2">
                  Club Value (Optional)
                </Label>
                <Input
                  id="clubvalue"
                  type="text"
                  placeholder="Enter a numeric value for your club"
                  value={formData.clubvalue}
                  onChange={(e) => handleInputChange('clubvalue', e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
              </div> */}
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Create your community and bring people together
              </div>
              <div className="flex gap-3">
                <Link href="/clubs">
                  <Button variant="outline" disabled={submitting}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name.trim() || !formData.description.trim() || !formData.mediaTypeId || !formData.selectedMediaId}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Club
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
