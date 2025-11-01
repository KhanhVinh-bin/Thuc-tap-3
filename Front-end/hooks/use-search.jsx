"use client"

import { useState, useEffect, useMemo } from 'react'
import { apiService } from '@/lib/api'

// Key cho localStorage
const RECENT_SEARCHES_KEY = 'edulearn_recent_searches'
const MAX_RECENT_SEARCHES = 8

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [recentSearches, setRecentSearches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [courseData, setCourseData] = useState([])
  const [apiError, setApiError] = useState(null)

  // Load recent searches từ localStorage
  const loadRecentSearches = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
        return saved ? JSON.parse(saved) : []
      } catch (error) {
        console.error('Error loading recent searches:', error)
        return []
      }
    }
    return []
  }

  // Save recent searches vào localStorage
  const saveRecentSearches = (searches) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches))
      } catch (error) {
        console.error('Error saving recent searches:', error)
      }
    }
  }

  // Thêm search query vào recent searches
  const addToRecentSearches = (query) => {
    if (!query || query.length < 2) return
    
    const trimmedQuery = query.trim()
    const currentRecent = loadRecentSearches()
    
    // Remove existing query if it exists
    const filtered = currentRecent.filter(item => 
      item.toLowerCase() !== trimmedQuery.toLowerCase()
    )
    
    // Add to beginning
    const newRecent = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES)
    
    setRecentSearches(newRecent)
    saveRecentSearches(newRecent)
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(RECENT_SEARCHES_KEY)
    }
  }

  // Load courses from API
  const loadCourses = async () => {
    try {
      setIsLoading(true)
      setApiError(null)
      const courses = await apiService.getAllCourses()
      setCourseData(courses)
    } catch (error) {
      console.error('Error loading courses:', error)
      setApiError('Không thể tải danh sách khóa học. Vui lòng thử lại sau.')
      setCourseData([])
    } finally {
      setIsLoading(false)
    }
  }

  // Tạo từ khóa tìm kiếm từ dữ liệu khóa học
  const searchKeywords = useMemo(() => {
    const keywords = new Set()
    
    courseData.forEach(course => {
      // Thêm title
      if (course.title) {
        keywords.add(course.title.toLowerCase())
        
        // Thêm từng từ trong title
        course.title.toLowerCase().split(' ').forEach(word => {
          if (word.length > 2) keywords.add(word)
        })
      }
      
      // Thêm category và level
      if (course.category?.categoryName) {
        keywords.add(course.category.categoryName.toLowerCase())
      }
      if (course.level) {
        keywords.add(course.level.toLowerCase())
      }
      if (course.instructor?.expertise) {
        keywords.add(course.instructor.expertise.toLowerCase())
      }
      if (course.language) {
        keywords.add(course.language.toLowerCase())
      }
    })
    
    return Array.from(keywords)
  }, [courseData])

  // Tìm kiếm autocomplete
  // Tạo gợi ý autocomplete từ API
  const getAutocompleteSuggestions = async (query) => {
    if (!query || query.length < 2) return []
    
    try {
      const suggestions = await apiService.getAutocompleteSuggestions(query)
      return suggestions || []
    } catch (error) {
      console.error('Error getting autocomplete suggestions:', error)
      // Fallback to local search if API fails
      const filtered = searchKeywords.filter(keyword => 
        keyword.includes(query.toLowerCase())
      )
      return filtered.slice(0, 5)
    }
  }

  // Tìm kiếm khóa học từ API
  const searchCourses = async (query) => {
    if (!query) return courseData
    
    try {
      const results = await apiService.searchCourses(query)
      return results || []
    } catch (error) {
      console.error('Error searching courses:', error)
      // Fallback to local search if API fails
      return courseData.filter(course =>
        (course.title && course.title.toLowerCase().includes(query.toLowerCase())) ||
        (course.category?.categoryName && course.category.categoryName.toLowerCase().includes(query.toLowerCase())) ||
        (course.instructor?.expertise && course.instructor.expertise.toLowerCase().includes(query.toLowerCase())) ||
        (course.description && course.description.toLowerCase().includes(query.toLowerCase()))
      )
    }
  }

  // Load recent searches khi component mount
  useEffect(() => {
    const recent = loadRecentSearches()
    setRecentSearches(recent)
  }, [])

  // Load courses when component mounts
  useEffect(() => {
    loadCourses()
  }, [])

  // Effect để cập nhật suggestions và results
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true)
        
        try {
          const [suggestionsData, searchResultsData] = await Promise.all([
            getAutocompleteSuggestions(searchQuery),
            searchCourses(searchQuery)
          ])
          
          setSuggestions(suggestionsData)
          setSearchResults(searchResultsData)
        } catch (error) {
          console.error('Error in search effect:', error)
          setSuggestions([])
          setSearchResults([])
        } finally {
          setIsLoading(false)
        }
      } else {
        setSuggestions([])
        setSearchResults([])
        setIsLoading(false)
      }
    }, 200) // Debounce 200ms

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Hiển thị recent searches khi focus và chưa có query
  useEffect(() => {
    if (isSearchFocused && !searchQuery) {
      setSuggestions(recentSearches.slice(0, 6))
    }
  }, [isSearchFocused, searchQuery, recentSearches])

  const handleSearchFocus = () => {
    setIsSearchFocused(true)
  }

  const handleSearchBlur = () => {
    // Delay để cho phép click vào suggestions
    setTimeout(() => {
      setIsSearchFocused(false)
    }, 200)
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion)
    addToRecentSearches(suggestion)
    setIsSearchFocused(false)
  }

  const handleSearch = (query) => {
    if (query && query.length >= 2) {
      addToRecentSearches(query)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setSuggestions([])
  }

  return {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    searchResults,
    suggestions,
    recentSearches,
    isLoading,
    apiError,
    handleSearchFocus,
    handleSearchBlur,
    handleSuggestionClick,
    handleSearch,
    clearSearch,
    clearRecentSearches,
    courseData,
    loadCourses // Export để refresh data khi cần
  }
}