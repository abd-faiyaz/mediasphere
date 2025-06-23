import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Edit, MessageSquare, Calendar, Users, Trophy, Settings } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const user = {
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "/placeholder.svg?height=80&width=80",
    bio: "Technology enthusiast and lifelong learner. Passionate about AI, web development, and building communities.",
    joinDate: "January 2023",
    location: "San Francisco, CA",
    website: "alexjohnson.dev",
    stats: {
      threadsCreated: 24,
      commentsPosted: 156,
      eventsAttended: 12,
      clubsJoined: 5,
    },
  }

  const recentThreads = [
    {
      id: 1,
      title: "Best Practices for Remote Development Teams",
      club: "Tech Innovators",
      replies: 28,
      likes: 15,
      time: "2 days ago",
    },
    {
      id: 2,
      title: "Introduction to Machine Learning",
      club: "AI Enthusiasts",
      replies: 45,
      likes: 32,
      time: "1 week ago",
    },
    {
      id: 3,
      title: "React vs Vue: A Developer's Perspective",
      club: "Web Developers",
      replies: 67,
      likes: 41,
      time: "2 weeks ago",
    },
  ]

  const recentComments = [
    {
      id: 1,
      thread: "The Future of AI in Education",
      club: "Tech Innovators",
      content: "Great insights! I think AI will definitely transform how we approach personalized learning...",
      time: "3 hours ago",
    },
    {
      id: 2,
      thread: "Quantum Computing Breakthrough",
      club: "Science Hub",
      content: "This is fascinating. The implications for cryptography are huge...",
      time: "1 day ago",
    },
    {
      id: 3,
      thread: "Sustainable Tech Practices",
      club: "Green Tech",
      content: "We've implemented similar practices at our company with great results...",
      time: "3 days ago",
    },
  ]

  const clubs = [
    { id: 1, name: "Tech Innovators", role: "Member", joined: "Jan 2023" },
    { id: 2, name: "AI Enthusiasts", role: "Moderator", joined: "Feb 2023" },
    { id: 3, name: "Web Developers", role: "Member", joined: "Mar 2023" },
    { id: 4, name: "Science Hub", role: "Member", joined: "Apr 2023" },
    { id: 5, name: "Green Tech", role: "Member", joined: "May 2023" },
  ]

  const achievements = [
    { id: 1, title: "First Thread", description: "Created your first discussion thread", earned: "Jan 2023" },
    { id: 2, title: "Community Builder", description: "Joined 5 different clubs", earned: "May 2023" },
    { id: 3, title: "Active Participant", description: "Posted 100+ comments", earned: "Aug 2023" },
    { id: 4, title: "Event Enthusiast", description: "Attended 10+ events", earned: "Nov 2023" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-20 w-20 mb-4">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Photo
                </Button>
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                    <p className="text-gray-600 mb-4">{user.bio}</p>
                  </div>
                  <Button>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.stats.threadsCreated}</div>
                    <div className="text-sm text-gray-600">Threads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.stats.commentsPosted}</div>
                    <div className="text-sm text-gray-600">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.stats.eventsAttended}</div>
                    <div className="text-sm text-gray-600">Events</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{user.stats.clubsJoined}</div>
                    <div className="text-sm text-gray-600">Clubs</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>📍 {user.location}</div>
                  <div>🌐 {user.website}</div>
                  <div>📅 Joined {user.joinDate}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="threads">Threads</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="activity" className="mt-6">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <MessageSquare className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              Commented on{" "}
                              <Link href="/threads/1" className="font-medium text-blue-600 hover:underline">
                                "The Future of AI in Education"
                              </Link>
                            </p>
                            <p className="text-xs text-gray-500">3 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              Joined{" "}
                              <Link href="/clubs/5" className="font-medium text-blue-600 hover:underline">
                                Green Tech
                              </Link>{" "}
                              club
                            </p>
                            <p className="text-xs text-gray-500">2 days ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              Attended{" "}
                              <Link href="/events/2" className="font-medium text-blue-600 hover:underline">
                                "Tech Talk: Future of Web Development"
                              </Link>
                            </p>
                            <p className="text-xs text-gray-500">1 week ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="threads" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Threads</CardTitle>
                    <CardDescription>Discussion threads you've created</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentThreads.map((thread) => (
                        <div key={thread.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                          <h3 className="font-medium text-gray-900 mb-2">
                            <Link href={`/threads/${thread.id}`} className="hover:text-blue-600">
                              {thread.title}
                            </Link>
                          </h3>
                          <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>in {thread.club}</span>
                            <div className="flex items-center gap-4">
                              <span>{thread.replies} replies</span>
                              <span>{thread.likes} likes</span>
                              <span>{thread.time}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Your Comments</CardTitle>
                    <CardDescription>Recent comments you've posted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentComments.map((comment) => (
                        <div key={comment.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                          <div className="mb-2">
                            <Link href={`/threads/${comment.id}`} className="font-medium text-blue-600 hover:underline">
                              {comment.thread}
                            </Link>
                            <span className="text-sm text-gray-600 ml-2">in {comment.club}</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                          <span className="text-xs text-gray-500">{comment.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Profile Settings</CardTitle>
                    <CardDescription>Update your profile information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input id="firstName" defaultValue="Alex" />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input id="lastName" defaultValue="Johnson" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user.email} />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea id="bio" defaultValue={user.bio} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" defaultValue={user.location} />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input id="website" defaultValue={user.website} />
                        </div>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Clubs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Clubs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clubs.map((club) => (
                    <div key={club.id} className="flex justify-between items-center">
                      <div>
                        <Link href={`/clubs/${club.id}`} className="font-medium text-sm hover:text-blue-600">
                          {club.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {club.role}
                          </Badge>
                          <span className="text-xs text-gray-500">{club.joined}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3">
                      <div className="bg-yellow-100 p-1 rounded">
                        <Trophy className="h-3 w-3 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs text-gray-600">{achievement.description}</div>
                        <div className="text-xs text-gray-500">{achievement.earned}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
