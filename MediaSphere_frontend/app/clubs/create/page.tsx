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
  clubvalue: string
}

export default function CreateClub() {
  const [formData, setFormData] = useState<CreateClubForm>({
    name: "",
    description: "",
    mediaTypeId: "",
    clubvalue: "",
  })
  const [mediaTypes, setMediaTypes] = useState<MediaType[]>([])
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

  const handleInputChange = (field: keyof CreateClubForm, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    if (!formData.name.trim() || !formData.description.trim() || !formData.mediaTypeId) {
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
        name: formData.name.trim(),
        description: formData.description.trim(),
        mediaType: selectedMediaType,
        clubvalue: formData.clubvalue.trim()
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-4 text-lg">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              Mediasphere
            </Link>
            <nav className="flex items-center space-x-4">
              <Link href="/clubs">
                <Button variant="ghost">Clubs</Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/clubs">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Clubs
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a New Club</CardTitle>
            <CardDescription>Start a community around your favorite media.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Club Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter club name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-base">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your club"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mediaType" className="text-base">Media Type *</Label>
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
                        {mediaType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/clubs" className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={submitting}>
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
      </main>
    </div>
  )
}
