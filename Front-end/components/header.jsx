"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Menu, X, ShoppingCart, BookOpen, Settings, LogOut } from "lucide-react"
import { getCurrentUser, logout } from "../app/(Home)/services/API"
import { useRouter } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { useSearch } from "@/hooks/use-search"
import SearchDropdown from "./search-dropdown"

export default function Header() {
  const router = useRouter()
  const { getCartItemsCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  // Search functionality
  const {
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
    clearRecentSearches
  } = useSearch()

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
  }, [])

  const handleLogout = () => {
    logout()
    setCurrentUser(null)
    setShowUserMenu(false)
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
             <Link href="/" className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center text-[#6B5EDB]">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-2xl font-extrabold text-black">EduLearn</span>
            </Link>


          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-[25px]">
            <Link href="/courses" className="text-gray-800 hover:text-[#6B5EDB] transition">
              Khóa học
            </Link>
            <Link href="/about" className="text-gray-800 hover:text-[#6B5EDB] transition">
              Giới thiệu
            </Link>
            <Link href="/blog" className="text-gray-800 hover:text-[#6B5EDB] transition">
              Blog
            </Link>
            <Link href="/contact" className="text-gray-800 hover:text-[#6B5EDB] transition">
              Liên hệ
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(searchQuery)
                  }
                }}
                placeholder="Tìm kiếm khóa học/danh mục..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-800 placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6B5EDB] focus:bg-white transition-colors"
              />
              
              {/* Search Dropdown */}
              <SearchDropdown
                isVisible={isSearchFocused && (suggestions.length > 0 || searchResults.length > 0 || isLoading)}
                suggestions={suggestions}
                searchResults={searchResults}
                isLoading={isLoading}
                searchQuery={searchQuery}
                recentSearches={recentSearches}
                onSuggestionClick={handleSuggestionClick}
                onClearRecentSearches={clearRecentSearches}
              />
            </div>
          </div>

          {/* User + Cart */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-gray-800 hover:text-[#6B5EDB] transition">
              <ShoppingCart className="h-6 w-6" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {currentUser ? (
              <div className="relative">
                <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#6B5EDB] flex items-center justify-center text-white font-medium">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border animate-fade-in">
                    {/* Thông tin user */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>

                    {/* Trang học tập */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push("/khoa-hoc-cua-toi")
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F6F4FF] transition"
                    >
                      <BookOpen className="w-4 h-4 mr-2 text-[#6B5EDB]" />
                      Học Tập
                    </button>

                    {/* Cài đặt */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push("/khoa-hoc-cua-toi/cai-dat")
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F6F4FF] transition"
                    >
                      <Settings className="w-4 h-4 mr-2 text-[#6B5EDB]" />
                      Cài đặt
                    </button>

                    {/* Đăng xuất */}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 border-t border-gray-100 hover:bg-[#F6F4FF] transition"
                    >
                      <LogOut className="w-4 h-4 mr-2 text-red-500" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-gray-800 font-medium hover:text-[#6B5EDB] transition">
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-black text-white rounded-full hover:bg-gray-900 transition"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu */}
          <button
            className="md:hidden p-2 text-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  )
}
