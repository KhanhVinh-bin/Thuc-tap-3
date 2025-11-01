"use client"

import Link from 'next/link'
import { Search, Clock, TrendingUp, BookOpen } from 'lucide-react'
import SearchHighlight from './search-highlight'

export default function SearchDropdown({ 
  isVisible, 
  suggestions, 
  searchResults, 
  isLoading, 
  searchQuery,
  recentSearches,
  onSuggestionClick,
  onClearRecentSearches
}) {
  if (!isVisible) return null

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
      {isLoading ? (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6B5EDB] mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Đang tìm kiếm...</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          {/* Suggestions Section */}
          {suggestions.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {searchQuery ? (
                    <Search className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {searchQuery ? 'Gợi ý tìm kiếm' : 'Tìm kiếm gần đây'}
                  </span>
                </div>
                {!searchQuery && suggestions.length > 0 && (
                  <button
                    onClick={() => onClearRecentSearches?.()}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Xóa lịch sử tìm kiếm
                  </button>
                )}

              </div>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors flex items-center gap-2"
                  >
                    {searchQuery ? (
                      <Search className="w-3 h-3 text-gray-400" />
                    ) : (
                      <Clock className="w-3 h-3 text-gray-400" />
                    )}
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Empty Recent Searches */}
          {!searchQuery && suggestions.length === 0 && !isLoading && (
            <div className="p-6 text-center">
              <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Chưa có tìm kiếm gần đây
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Lịch sử tìm kiếm sẽ hiển thị ở đây
              </p>
            </div>
          )}

          {/* Search Results Section */}
          {searchResults.length > 0 && (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Khóa học ({searchResults.length})
                </span>
              </div>
              <div className="space-y-2">
                {searchResults.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="block p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={course.thumbnailUrl || "/placeholder.svg"}
                        alt={course.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          <SearchHighlight text={course.title || 'Khóa học'} searchQuery={searchQuery} />
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {course.instructor?.expertise || 'Giảng viên'} • {course.category?.categoryName || 'Danh mục'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {course.level}
                          </span>
                          <span className="text-sm font-semibold text-[#6B5EDB]">
                            {course.price || 'Miễn phí'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {searchQuery && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <Link
                    href={`/courses?search=${encodeURIComponent(searchQuery)}`}
                    className="block w-full text-center py-2 text-sm text-[#6B5EDB] hover:text-[#5A4FCF] font-medium transition-colors"
                  >
                    Xem tất cả kết quả cho "{searchQuery}"
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {searchQuery && searchResults.length === 0 && suggestions.length === 0 && !isLoading && (
            <div className="p-6 text-center">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Không tìm thấy kết quả cho "{searchQuery}"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}