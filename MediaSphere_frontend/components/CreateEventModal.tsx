"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X, Send, Loader2, Eye, EyeOff, Calendar, MapPin, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"

interface CreateEventModalProps {
    isOpen: boolean
    onClose: () => void
    clubId: string
    clubName: string
    onEventCreated: () => void
}

export default function CreateEventModal({
    isOpen,
    onClose,
    clubId,
    clubName,
    onEventCreated
}: CreateEventModalProps) {
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [eventDate, setEventDate] = useState("")
    const [eventTime, setEventTime] = useState("")
    const [location, setLocation] = useState("")
    const [maxParticipants, setMaxParticipants] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPreview, setShowPreview] = useState(false)

    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            rotateX: -15
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            rotateX: 0,
            transition: {
                type: "spring",
                damping: 25,
                stiffness: 300,
                duration: 0.6
            }
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 30,
            rotateX: 15,
            transition: {
                duration: 0.3,
                ease: "easeInOut"
            }
        }
    }

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast({
                title: "Error",
                description: "Please enter an event title",
                variant: "destructive"
            })
            return
        }

        if (!description.trim()) {
            toast({
                title: "Error",
                description: "Please enter an event description",
                variant: "destructive"
            })
            return
        }

        if (!eventDate) {
            toast({
                title: "Error",
                description: "Please select an event date",
                variant: "destructive"
            })
            return
        }

        if (!eventTime) {
            toast({
                title: "Error",
                description: "Please select an event time",
                variant: "destructive"
            })
            return
        }

        // Validate that the event is in the future
        const selectedDateTime = new Date(`${eventDate}T${eventTime}`)
        const now = new Date()

        if (selectedDateTime <= now) {
            toast({
                title: "Error",
                description: "Event date and time must be in the future",
                variant: "destructive"
            })
            return
        }

        setIsSubmitting(true)

        try {
            const token = authService.getToken()

            // Create event object
            const eventData = {
                title: title.trim(),
                description: description.trim(),
                eventDate: selectedDateTime.toISOString(),
                location: location.trim() || null,
                maxParticipants: maxParticipants ? parseInt(maxParticipants) : null
            }

            const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${clubId}/events`

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(eventData)
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`Failed to create event: ${errorText}`)
            }

            const result = await response.json()

            toast({
                title: "🎉 Event Created!",
                description: "Your event has been scheduled successfully",
            })

            // Reset form
            setTitle("")
            setDescription("")
            setEventDate("")
            setEventTime("")
            setLocation("")
            setMaxParticipants("")

            onEventCreated()
            onClose()

        } catch (error) {
            console.error('Error creating event:', error)
            toast({
                title: "Error",
                description: "Failed to create event. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <motion.h2
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-2xl font-bold"
                                >
                                    Create New Event
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-blue-100 mt-1"
                                >
                                    in {clubName}
                                </motion.p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </motion.button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Title Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                                Event Title *
                            </Label>
                            <motion.div whileFocus={{ scale: 1.02 }}>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="What's your event about?"
                                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Description Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Event Description *
                            </Label>
                            <motion.div whileFocus={{ scale: 1.02 }}>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe your event, what participants can expect..."
                                    className="w-full h-32 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                />
                            </motion.div>
                        </motion.div>

                        {/* Date and Time Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Event Date */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Label htmlFor="eventDate" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-green-500" /> Event Date *
                                </Label>
                                <motion.div whileFocus={{ scale: 1.02 }}>
                                    <Input
                                        id="eventDate"
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Event Time */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.75 }}
                            >
                                <Label htmlFor="eventTime" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Event Time *
                                </Label>
                                <motion.div whileFocus={{ scale: 1.02 }}>
                                    <Input
                                        id="eventTime"
                                        type="time"
                                        value={eventTime}
                                        onChange={(e) => setEventTime(e.target.value)}
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Location and Max Participants Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Location Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <Label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-green-500" /> Location (Optional)
                                </Label>
                                <motion.div whileFocus={{ scale: 1.02 }}>
                                    <Input
                                        id="location"
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Where will this event take place?"
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Max Participants Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.85 }}
                            >
                                <Label htmlFor="maxParticipants" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                    <Users className="h-4 w-4 text-green-500" /> Max Participants (Optional)
                                </Label>
                                <motion.div whileFocus={{ scale: 1.02 }}>
                                    <Input
                                        id="maxParticipants"
                                        type="number"
                                        value={maxParticipants}
                                        onChange={(e) => setMaxParticipants(e.target.value)}
                                        placeholder="Leave empty for unlimited"
                                        min="1"
                                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                                    />
                                </motion.div>
                            </motion.div>
                        </div>

                        {/* Preview Toggle */}
                        {(title.trim() || description.trim()) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="flex items-center gap-2"
                                >
                                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {showPreview ? "Hide Preview" : "Show Preview"}
                                </Button>

                                <AnimatePresence>
                                    {showPreview && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-4 p-4 bg-gray-50 rounded-xl border-2 border-gray-200"
                                        >
                                            <h4 className="font-semibold text-gray-800 mb-2">Preview:</h4>
                                            <div className="space-y-2">
                                                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                                                {description && <p className="text-gray-700 whitespace-pre-wrap">{description}</p>}
                                                {eventDate && eventTime && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(`${eventDate}T${eventTime}`).toLocaleString()}
                                                    </p>
                                                )}
                                                {location && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <MapPin className="h-4 w-4" />
                                                        {location}
                                                    </p>
                                                )}
                                                {maxParticipants && (
                                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                                        <Users className="h-4 w-4" />
                                                        Max {maxParticipants} participants
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 border-t">
                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                Schedule your event for the community
                            </div>
                            <div className="flex gap-3">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !title.trim() || !description.trim() || !eventDate || !eventTime}
                                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="h-4 w-4 mr-2" />
                                                Create Event
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
