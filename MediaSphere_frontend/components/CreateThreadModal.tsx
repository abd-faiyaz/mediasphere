"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Send, Loader2, Eye, EyeOff, Upload, Trash2, Image as ImageIcon } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { authService } from "@/lib/auth-service"

interface CreateThreadModalProps {
  isOpen: boolean
  onClose: () => void
  clubId: string
  clubName: string
  onThreadCreated: () => void
}

interface ImagePreview {
  id: string
  file: File
  preview: string
}

export default function CreateThreadModal({ 
  isOpen, 
  onClose, 
  clubId, 
  clubName, 
  onThreadCreated 
}: CreateThreadModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<ImagePreview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlPreview, setImageUrlPreview] = useState<string | null>(null);
  const [imageUrlError, setImageUrlError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      rotate: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      rotate: 5,
      transition: { duration: 0.2 }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const preview: ImagePreview = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            preview: e.target?.result as string
          }
          setImages(prev => [...prev, preview])
        }
        reader.readAsDataURL(file)
      }
    })
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Handle image URL input and preview
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(e.target.value);
    setImageUrlError("");
    if (e.target.value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
      setImageUrlPreview(e.target.value);
    } else {
      setImageUrlPreview(null);
    }
  };

  const addImageByUrl = () => {
    if (!imageUrlPreview) {
      setImageUrlError("Please enter a valid image URL (jpg, png, gif, webp)");
      return;
    }
    // Prevent duplicate or multiple URL images
    if (images.some(img => (img as any).isUrl)) {
      setImageUrlError("Only one image by link can be added");
      return;
    }
    setImages(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        file: null as any, // Not a File
        preview: imageUrlPreview,
        isUrl: true
      } as any
    ]);
    setImageUrl("");
    setImageUrlPreview(null);
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id))
  }

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a thread title",
        variant: "destructive"
      })
      return
    }

    if (!content.trim() && images.length === 0) {
      toast({
        title: "Error", 
        description: "Please add some content or images to your thread",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = authService.getToken()
      
      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('title', title.trim())
      formData.append('content', content.trim())
      
      // Add images to form data
      images.forEach((image) => {
        if ((image as any).isUrl && image.preview) {
          formData.append('imageUrls', image.preview);
        } else if (image.file) {
          formData.append('images', image.file);
        }
      })

      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}/clubs/${clubId}/threads`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create thread: ${errorText}`)
      }

      const result = await response.json();

      toast({
        title: "🎉 Thread Created!",
        description: "Your thread has been posted successfully",
      })

      // Reset form
      setTitle("")
      setContent("")
      setImages([])
      
      onThreadCreated()
      onClose()

    } catch (error) {
      console.error('Error creating thread:', error)
      toast({
        title: "Error",
        description: "Failed to create thread. Please try again.",
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex justify-between items-center">
              <div>
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold"
                >
                  Create New Thread
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thread Title *
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your thread about?"
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </motion.div>

            {/* Content Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thread Content
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ideas, or start a discussion..."
                className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-blue-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
              />
            </motion.div>

            {/* Image Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Images (Optional)
              </label>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-all duration-300 bg-gradient-to-br from-blue-50 to-purple-50"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                </motion.div>
                <p className="text-gray-600 font-medium">Click to upload images</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
              </motion.div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </motion.div>

            {/* Image by Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
            >
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" /> Add Image by Link
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="Paste image URL (jpg, png, gif, webp)"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 transition-all duration-300 bg-white/50 backdrop-blur-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addImageByUrl}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-md disabled:opacity-50"
                  disabled={!imageUrlPreview || images.some(img => (img as any).isUrl)}
                >
                  Add
                </motion.button>
              </div>
              {imageUrlError && <div className="text-red-500 text-xs mt-1">{imageUrlError}</div>}
              {imageUrlPreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 flex items-center gap-2"
                >
                  <img src={imageUrlPreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border-2 border-purple-200 shadow" />
                  <span className="text-gray-600 text-xs">Preview</span>
                </motion.div>
              )}
            </motion.div>

            {/* Image Previews */}
            <AnimatePresence>
              {images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {images.map((image, index) => (
                    <motion.div
                      key={image.id}
                      variants={imageVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="relative group"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                        <img
                          src={image.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeImage(image.id)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Preview Toggle */}
            {(content.trim() || title.trim() || images.length > 0) && (
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
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                      {content && <p className="text-gray-700 mb-3 whitespace-pre-wrap">{content}</p>}
                      {images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {images.map((image) => (
                            <img
                              key={image.id}
                              src={image.preview}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
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
                {images.length > 0 ? `${images.length} image(s) selected` : "Share your thoughts with the community"}
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
                    disabled={isSubmitting || !title.trim() || (!content.trim() && images.length === 0)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Create Thread
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
