"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Menu,
  X,
  ShoppingCart,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useSearch } from "@/hooks/use-search";
import SearchDropdown from "./search-dropdown";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const router = useRouter();
  const { getCartItemsCount } = useCart();
  const { user: currentUser, logout: authLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Search functionality
  const {
    searchQuery,
    setSearchQuery,
    isSearchFocused,
    searchResults,
    suggestions,
    recentSearches,
    isLoading,
    handleSearchFocus,
    handleSearchBlur,
    handleSuggestionClick,
    handleSearch,
    clearRecentSearches,
  } = useSearch();

  const handleLogout = () => {
    authLogout();
    setShowUserMenu(false);
    router.push("/");
  };

  // ✅ Chuẩn hóa user info
  const userName =
    currentUser?.fullName ||
    currentUser?.FullName ||
    currentUser?.name ||
    currentUser?.Name ||
    currentUser?.email ||
    "Người dùng";
  const userInitial = userName?.charAt(0)?.toUpperCase() || "U";
  const userEmail = currentUser?.email || currentUser?.Email || "";

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 ml-2">
            <div className="w-14 h-14 rounded-lg flex items-center justify-center overflow-hidden relative">
              <Image
                src="/logo.png"
                alt="EduLearn Logo"
                width={56}
                height={56}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-extrabold text-black" style={{ fontFamily: 'sans-serif', lineHeight: '1.5' }}>EduLearn</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-lg" style={{ fontFamily: 'sans-serif', lineHeight: '1.6' }}>
            <Link
              href="/courses"
              className="text-gray-800 hover:text-[#6B5EDB] px-3 py-2 rounded-lg hover:bg-[#F6F4FF] transition-all duration-200 font-medium"
              style={{ lineHeight: '1.6' }}
            >
              Khóa học
            </Link>
            <Link
              href="/about"
              className="text-gray-800 hover:text-[#6B5EDB] px-3 py-2 rounded-lg hover:bg-[#F6F4FF] transition-all duration-200 font-medium"
              style={{ lineHeight: '1.6' }}
            >
              Giới thiệu
            </Link>
            <Link
              href="/blog"
              className="text-gray-800 hover:text-[#6B5EDB] px-3 py-2 rounded-lg hover:bg-[#F6F4FF] transition-all duration-200 font-medium"
              style={{ lineHeight: '1.6' }}
            >
              Blog
            </Link>
            <Link
              href="/contact"
              className="text-gray-800 hover:text-[#6B5EDB] px-3 py-2 rounded-lg hover:bg-[#F6F4FF] transition-all duration-200 font-medium"
              style={{ lineHeight: '1.6' }}
            >
              Liên hệ
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch(searchQuery);
                }}
                placeholder="Tìm kiếm khóa học/danh mục..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 text-gray-800 placeholder-gray-400 rounded-full focus:outline-none focus:ring-2 focus:ring-[#6B5EDB] focus:bg-white transition-colors text-sm"
              />

              <SearchDropdown
                isVisible={
                  isSearchFocused &&
                  (suggestions.length > 0 ||
                    searchResults.length > 0 ||
                    isLoading)
                }
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
          <div className="flex items-center gap-3 relative flex-shrink-0">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative text-gray-800 hover:text-[#6B5EDB] p-2 rounded-lg hover:bg-[#F6F4FF] transition-all duration-200 group"
            >
              <ShoppingCart className="h-7 w-7 group-hover:scale-110 transition-transform duration-200" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* User */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F6F4FF] transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-full bg-[#6B5EDB] flex items-center justify-center text-white font-medium group-hover:ring-2 group-hover:ring-[#6B5EDB] group-hover:ring-offset-2 transition-all duration-200">
                    {userInitial}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {userName}
                      </p>
                      <p className="text-sm text-gray-500">{userEmail}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/khoa-hoc-cua-toi");
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F6F4FF] transition"
                    >
                      <BookOpen className="w-4 h-4 mr-2 text-[#6B5EDB]" />
                      Học tập
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push("/khoa-hoc-cua-toi/cai-dat");
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F6F4FF] transition"
                    >
                      <Settings className="w-4 h-4 mr-2 text-[#6B5EDB]" />
                      Cài đặt
                    </button>

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
                <button
                  onClick={() => router.push("/register")}
                  className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  Đăng ký
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="bg-[#6B5EDB] text-white px-4 py-2 rounded-lg hover:bg-[#5a4ddb] transition-colors font-medium"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  Đăng nhập
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-800"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}
