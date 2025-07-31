"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, Loader2 } from "lucide-react"
import { useSearch } from "@/hooks/use-search"
import { SearchDropdown } from "@/components/search/search-dropdown-simple"
import { SearchResult } from "@/lib/search-types"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  placeholder?: string
  className?: string
  autoFocus?: boolean
  onSearchSubmit?: (query: string) => void
  showDropdown?: boolean
}

export function SearchBar({
  placeholder = "Search clubs, threads, events, media...",
  className,
  autoFocus = false,
  onSearchSubmit,
  showDropdown = true
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    query,
    setQuery,
    isLoading,
    error,
    isDropdownOpen,
    setIsDropdownOpen,
    dropdownResults,
    searchHistory,
    clearHistory,
    removeFromHistory,
    handleSearchSubmit,
    clearSearch
  } = useSearch({
    debounceMs: 300,
    minQueryLength: 2,
    maxDropdownResults: 3
  })

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsDropdownOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false)
        setIsFocused(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [setIsDropdownOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    if (showDropdown && value.trim().length >= 2) {
      setIsDropdownOpen(true)
    } else if (value.trim().length === 0) {
      setIsDropdownOpen(false)
    }
  }

  const handleInputFocus = () => {
    setIsFocused(true)
    if (showDropdown && (query.trim().length >= 2 || searchHistory.length > 0)) {
      setIsDropdownOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const trimmedQuery = query.trim()
      if (trimmedQuery) {
        setIsDropdownOpen(false)
        setIsFocused(false)
        if (onSearchSubmit) {
          onSearchSubmit(trimmedQuery)
        } else {
          handleSearchSubmit(trimmedQuery)
        }
      }
    }
  }

  const handleSearchButtonClick = () => {
    const trimmedQuery = query.trim()
    if (trimmedQuery) {
      setIsDropdownOpen(false)
      setIsFocused(false)
      if (onSearchSubmit) {
        onSearchSubmit(trimmedQuery)
      } else {
        handleSearchSubmit(trimmedQuery)
      }
    }
  }

  const handleClearSearch = () => {
    clearSearch()
    inputRef.current?.focus()
    if (showDropdown && searchHistory.length > 0) {
      setIsDropdownOpen(true)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setIsDropdownOpen(false)
    setIsFocused(false)
    // Navigation is handled by the Link in SearchDropdown
  }

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery)
    setIsDropdownOpen(false)
    setIsFocused(false)
    if (onSearchSubmit) {
      onSearchSubmit(historyQuery)
    } else {
      handleSearchSubmit(historyQuery)
    }
  }

  return (
    <div ref={searchContainerRef} className={cn("relative", className)}>
      <motion.div
        animate={{
          scale: isFocused ? 1.02 : 1,
          boxShadow: isFocused 
            ? "0 10px 25px -5px rgba(30, 58, 138, 0.1), 0 10px 10px -5px rgba(30, 58, 138, 0.04)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        {/* Search Icon */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#333333]/50 h-4 w-4 z-10" />
        
        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          className={cn(
            "pl-10 pr-20 w-full bg-white/90 border-[#90CAF9]/30 focus:border-[#1E3A8A] text-[#333333] placeholder:text-[#333333]/50 font-['Open Sans'] transition-all duration-300",
            isFocused && "ring-2 ring-[#1E3A8A]/20 border-[#1E3A8A]",
            error && "border-red-300 focus:border-red-500"
          )}
        />

        {/* Right Side Controls */}
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Loading Spinner */}
          {isLoading && (
            <Loader2 className="h-4 w-4 text-[#1E3A8A] animate-spin" />
          )}

          {/* Clear Button */}
          {query && !isLoading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="h-6 w-6 p-0 hover:bg-[#F0F7FF] text-[#333333]/50 hover:text-[#1E3A8A]"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          {/* Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSearchButtonClick}
            disabled={!query.trim() || isLoading}
            className="h-8 px-2 bg-gradient-to-r from-[#1E3A8A] to-[#4E6FBA] hover:from-[#15306E] hover:to-[#3D5AA3] text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-12 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 z-40"
        >
          <p className="text-sm text-red-600 font-['Open Sans']">
            {error}
          </p>
        </motion.div>
      )}

      {/* Search Dropdown */}
      {showDropdown && (
        <SearchDropdown
          isOpen={isDropdownOpen}
          isLoading={isLoading}
          results={dropdownResults}
          searchHistory={searchHistory}
          query={query}
          onResultClick={handleResultClick}
          onHistoryClick={handleHistoryClick}
          onHistoryRemove={removeFromHistory}
          onClearHistory={clearHistory}
          onClose={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}
