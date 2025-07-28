"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Calendar, Play } from "lucide-react"
import Link from "next/link"

interface SearchDropdownProps {
  isOpen: boolean
  isLoading: boolean
  results: {
    clubs: any[]
    threads: any[]
    events: any[]
    media: any[]
  }
  searchHistory: any[]
  query: string
  onResultClick: (result: any) => void
  onHistoryClick: (query: string) => void
  onHistoryRemove: (id: string) => void
  onClearHistory: () => void
  onClose: () => void
}

// Hardcoded sample data from database
const sampleData = {
  clubs: [
    {
      id: "1153d21a-30da-4240-878c-9bbf2bc268e0",
      name: "Sci-Fi Book Club",
      description: "Discussion club for science fiction books",
      memberCount: 15,
      mediaType: { name: "Books" }
    },
    {
      id: "57e7af79-b324-4e3c-91af-5f5f92317e0e", 
      name: "Sci-Fi Movie Club",
      description: "Discussion club for science fiction movies",
      memberCount: 8,
      mediaType: { name: "Movies" }
    },
    {
      id: "df50b126-de42-412e-9ee0-4d5f2b2412ee",
      name: "Studio Ghibli Appreciation Society", 
      description: "Dedicated to discussing and analyzing Studio Ghibli films",
      memberCount: 12,
      mediaType: { name: "Anime" }
    }
  ],
  threads: [
    {
      id: "e226e86d-759c-4dd5-9a6e-093865d9a8c2",
      title: "Discussion about latest sci-fi novels",
      content: "What are your thoughts on the recent sci-fi releases?",
      viewCount: 45,
      commentCount: 8,
      createdBy: { name: "John Doe" },
      club: { name: "Sci-Fi Book Club" }
    },
    {
      id: "37839c26-ae93-409e-8dc0-c63910b9eb04", 
      title: "Best anime movies of 2024",
      content: "Let's discuss the top anime releases this year",
      viewCount: 32,
      commentCount: 5,
      createdBy: { name: "Jane Smith" },
      club: { name: "Studio Ghibli Appreciation Society" }
    }
  ],
  events: [
    {
      id: "sample-event-1",
      title: "Monthly Book Discussion",
      description: "Join us for our monthly book club meeting",
      eventDate: "2025-08-15T19:00:00",
      location: "Community Center",
      maxParticipants: 20,
      currentParticipants: 12
    },
    {
      id: "sample-event-2", 
      title: "Anime Movie Night",
      description: "Screening of classic Studio Ghibli films",
      eventDate: "2025-08-20T18:30:00",
      location: "Local Theater",
      maxParticipants: 50,
      currentParticipants: 25
    }
  ],
  media: [
    {
      id: "4f3b51c1-5db7-4d8d-9597-6f9804e13227",
      title: "The Shawshank Redemption",
      author: "Frank Darabont",
      releaseYear: 1994,
      genre: "Drama",
      mediaType: { name: "Movie" }
    },
    {
      id: "2528be09-e8c8-456d-ae61-5292986ec782",
      title: "Spirited Away", 
      author: "Hayao Miyazaki",
      releaseYear: 2001,
      genre: "Fantasy/Family",
      mediaType: { name: "Anime" }
    },
    {
      id: "e3eaf289-714d-4441-b032-243f1f269530",
      title: "To Kill a Mockingbird",
      author: "Harper Lee", 
      releaseYear: 1960,
      genre: "Fiction/Drama",
      mediaType: { name: "Book" }
    }
  ]
}

export function SearchDropdown({
  isOpen,
  isLoading,
  results,
  searchHistory,
  query,
  onResultClick,
  onHistoryClick,
  onHistoryRemove,
  onClearHistory,
  onClose
}: SearchDropdownProps) {
  if (!isOpen) return null

  // Filter sample data based on query
  const filteredData = query ? {
    clubs: sampleData.clubs.filter(club => 
      club.name.toLowerCase().includes(query.toLowerCase()) ||
      club.description.toLowerCase().includes(query.toLowerCase())
    ),
    threads: sampleData.threads.filter(thread => 
      thread.title.toLowerCase().includes(query.toLowerCase()) ||
      thread.content.toLowerCase().includes(query.toLowerCase())
    ),
    events: sampleData.events.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase())
    ),
    media: sampleData.media.filter(media => 
      media.title.toLowerCase().includes(query.toLowerCase()) ||
      media.author.toLowerCase().includes(query.toLowerCase())
    )
  } : sampleData

  return (
    <div className="absolute top-12 left-0 right-0 z-50">
      <Card className="bg-white/95 backdrop-blur-xl border border-[#90CAF9]/30 rounded-xl shadow-xl max-h-96 overflow-y-auto">
        <div className="p-4">
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-[#333333]/70">Searching...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Clubs Section */}
              {filteredData.clubs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-[#1E3A8A]" />
                    <h3 className="font-semibold text-[#1E3A8A]">Clubs</h3>
                  </div>
                  {filteredData.clubs.slice(0, 3).map((club) => (
                    <Link key={club.id} href={`/clubs/${club.id}`}>
                      <div className="p-3 hover:bg-[#F0F7FF] rounded-lg cursor-pointer transition-colors">
                        <div className="font-medium text-[#333333]">{club.name}</div>
                        <div className="text-sm text-[#333333]/70 truncate">{club.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {club.memberCount} members
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {club.mediaType.name}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Threads Section */}
              {filteredData.threads.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-[#1E3A8A]" />
                    <h3 className="font-semibold text-[#1E3A8A]">Discussions</h3>
                  </div>
                  {filteredData.threads.slice(0, 3).map((thread) => (
                    <Link key={thread.id} href={`/threads/${thread.id}`}>
                      <div className="p-3 hover:bg-[#F0F7FF] rounded-lg cursor-pointer transition-colors">
                        <div className="font-medium text-[#333333]">{thread.title}</div>
                        <div className="text-sm text-[#333333]/70 truncate">{thread.content}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {thread.viewCount} views
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {thread.commentCount} comments
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Events Section */}
              {filteredData.events.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-[#1E3A8A]" />
                    <h3 className="font-semibold text-[#1E3A8A]">Events</h3>
                  </div>
                  {filteredData.events.slice(0, 3).map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <div className="p-3 hover:bg-[#F0F7FF] rounded-lg cursor-pointer transition-colors">
                        <div className="font-medium text-[#333333]">{event.title}</div>
                        <div className="text-sm text-[#333333]/70 truncate">{event.description}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {event.currentParticipants}/{event.maxParticipants} attending
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {new Date(event.eventDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Media Section */}
              {filteredData.media.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Play className="h-4 w-4 text-[#1E3A8A]" />
                    <h3 className="font-semibold text-[#1E3A8A]">Media</h3>
                  </div>
                  {filteredData.media.slice(0, 3).map((media) => (
                    <Link key={media.id} href={`/media/${media.id}`}>
                      <div className="p-3 hover:bg-[#F0F7FF] rounded-lg cursor-pointer transition-colors">
                        <div className="font-medium text-[#333333]">{media.title}</div>
                        <div className="text-sm text-[#333333]/70">by {media.author}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {media.releaseYear}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {media.genre}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {query && filteredData.clubs.length === 0 && filteredData.threads.length === 0 && 
               filteredData.events.length === 0 && filteredData.media.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-[#333333]/70">No results found for "{query}"</p>
                </div>
              )}

              {/* Default message when no query */}
              {!query && (
                <div className="text-center py-4">
                  <p className="text-[#333333]/70">Start typing to search across clubs, threads, events, and media...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
