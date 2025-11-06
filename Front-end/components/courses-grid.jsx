"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import CourseCard from "./course-card"

export default function CoursesGrid({ courses = [], currentPage = 1, totalPages = 1, onPageChange, categories = [], onFilterChange }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(["all"]) // ✅ Mặc định chọn "Tất cả"
  const [selectedLevels, setSelectedLevels] = useState(["Tất cả"])
  const [maxPrice, setMaxPrice] = useState(20000000)

  // ✅ Lấy danh mục từ props và sắp xếp theo CategoryId, không phân cấp
  const categoriesToDisplay = categories.length > 0 
    ? [...categories]
        .sort((a, b) => {
          const idA = a.categoryId || a.CategoryId || 0
          const idB = b.categoryId || b.CategoryId || 0
          return idA - idB
        })
        .map(cat => ({
          categoryId: cat.categoryId || cat.CategoryId,
          categoryName: cat.categoryName || cat.CategoryName
        }))
        .filter(cat => cat.categoryId && cat.categoryName)
    : []

  // Handle category selection with checkboxes - sử dụng categoryId
  const handleCategoryToggle = (categoryId) => {
    setSelectedCategoryIds(prev => {
      if (categoryId === "all") {
        // If "Tất cả" is selected, unselect all others
        // Nếu đã chọn "all" thì bỏ chọn, nếu chưa chọn thì chỉ chọn "all"
        return prev.includes("all") ? [] : ["all"]
      } else {
        // If any other category is selected, remove "all" and toggle this categoryId
        const categoryIdNum = Number(categoryId)
        
        // ✅ Loại bỏ "all" nếu có
        let newSelection = prev.filter(id => id !== "all")
        
        // ✅ Toggle categoryId này
        if (newSelection.includes(categoryIdNum)) {
          // Nếu đã chọn thì bỏ chọn
          newSelection = newSelection.filter(id => id !== categoryIdNum)
        } else {
          // Nếu chưa chọn thì thêm vào
          newSelection = [...newSelection, categoryIdNum]
        }
        
        // ✅ Nếu không còn category nào được chọn, tự động chọn "all"
        if (newSelection.length === 0) {
          return ["all"]
        }
        
        return newSelection
      }
    })
  }

  // Handle level selection with checkboxes
  const handleLevelToggle = (level) => {
    setSelectedLevels(prev => {
      if (level === "Tất cả") {
        return prev.includes("Tất cả") ? [] : ["Tất cả"]
      } else {
        const newSelection = prev.includes("Tất cả")
          ? prev.filter(lvl => lvl !== "Tất cả")
          : [...prev]
        
        if (newSelection.includes(level)) {
          return newSelection.filter(lvl => lvl !== level)
        } else {
          return [...newSelection, level]
        }
      }
    })
  }

  const levels = ["Tất cả", "Cơ bản", "Trung cấp", "Nâng cao"]

  // Lọc dữ liệu
  const filteredCourses = courses.filter((course) => {
    if (!course || !course.id) return false // Skip invalid courses
    
    const matchSearch =
      !searchTerm ||
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    // ✅ Match category: filter theo categoryId thay vì categoryName
    // ✅ Lấy categoryId từ nhiều nguồn để đảm bảo không bỏ sót
    const courseCategoryId = course.categoryId || course.CategoryId || null
    const courseCategoryIdNum = courseCategoryId !== null && courseCategoryId !== undefined 
      ? Number(courseCategoryId) 
      : null
    
    // ✅ Match category logic:
    // - Nếu không chọn category nào (length === 0) → hiển thị tất cả
    // - Nếu có "all" trong selectedCategoryIds → hiển thị tất cả
    // - Nếu courseCategoryIdNum khác null và có trong selectedCategoryIds → match
    let matchCategory = false
    if (selectedCategoryIds.length === 0) {
      matchCategory = true // Không có filter nào được chọn → hiển thị tất cả
    } else if (selectedCategoryIds.includes("all")) {
      matchCategory = true // "Tất cả" được chọn → hiển thị tất cả
    } else if (courseCategoryIdNum !== null && courseCategoryIdNum !== undefined) {
      // ✅ So sánh với cả number và string để đảm bảo match
      matchCategory = selectedCategoryIds.some(id => 
        Number(id) === courseCategoryIdNum || id === courseCategoryIdNum
      )
    } else {
      // Nếu course không có categoryId → không hiển thị khi filter theo category
      matchCategory = false
    }
    
    // ✅ Log chi tiết để debug (chỉ log khi không match và có categoryId)
    if (typeof window !== 'undefined' && !matchCategory && courseCategoryIdNum !== null) {
      console.log(`🔍 Course "${course.title || course.name}" categoryId: ${courseCategoryIdNum} (type: ${typeof courseCategoryIdNum}), selectedCategoryIds:`, selectedCategoryIds, `match: ${matchCategory}`)
    }

    // Match level: check if selectedLevels includes "Tất cả" or matches course level
    const matchLevel = selectedLevels.length === 0 ||
      selectedLevels.includes("Tất cả") ||
      selectedLevels.some(lvl => 
        course.level?.toLowerCase() === lvl.toLowerCase()
      )

    // Match price: course price should be <= maxPrice
    // Handle both number and string price formats
    const coursePrice = typeof course.price === 'number' 
      ? course.price 
      : typeof course.price === 'string' 
        ? parseFloat(course.price.replace(/[^\d.]/g, '')) || 0 
        : 0
    const matchPrice = coursePrice <= maxPrice

    return matchSearch && matchCategory && matchLevel && matchPrice
  })
  
  // ✅ Gọi callback để thông báo cho parent component về filter changes
  useEffect(() => {
    if (onFilterChange && typeof onFilterChange === 'function') {
      // Tạo filter function để parent có thể apply trên allCourses
      const filterFn = (allCourses) => {
        return allCourses.filter((course) => {
          if (!course || !course.id) return false
          
          const matchSearch =
            !searchTerm ||
            course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            course.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())

          const courseCategoryId = course.categoryId || course.CategoryId || null
          const courseCategoryIdNum = courseCategoryId !== null && courseCategoryId !== undefined 
            ? Number(courseCategoryId) 
            : null
          
          let matchCategory = false
          if (selectedCategoryIds.length === 0) {
            matchCategory = true
          } else if (selectedCategoryIds.includes("all")) {
            matchCategory = true
          } else if (courseCategoryIdNum !== null && courseCategoryIdNum !== undefined) {
            matchCategory = selectedCategoryIds.some(id => 
              Number(id) === courseCategoryIdNum || id === courseCategoryIdNum
            )
          } else {
            matchCategory = false
          }

          const matchLevel = selectedLevels.length === 0 ||
            selectedLevels.includes("Tất cả") ||
            selectedLevels.some(lvl => 
              course.level?.toLowerCase() === lvl.toLowerCase()
            )

          const coursePrice = typeof course.price === 'number' 
            ? course.price 
            : typeof course.price === 'string' 
              ? parseFloat(course.price.replace(/[^\d.]/g, '')) || 0 
              : 0
          const matchPrice = coursePrice <= maxPrice

          return matchSearch && matchCategory && matchLevel && matchPrice
        })
      }
      
      onFilterChange(filterFn)
    }
  }, [searchTerm, selectedCategoryIds, selectedLevels, maxPrice, onFilterChange])

  // Debug log
  if (typeof window !== 'undefined') {
    console.log(`🔍 Filtered courses: ${filteredCourses.length} from ${courses.length} total`)
    console.log(`🔍 Search term: "${searchTerm}", Selected Category IDs: [${selectedCategoryIds.join(', ')}], Levels: [${selectedLevels.join(', ')}], Max price: ${maxPrice}`)
    console.log(`🔍 Available categories:`, categoriesToDisplay)
    console.log(`🔍 Sample course categoryIds:`, courses.slice(0, 5).map(c => ({
      title: c.title || c.name,
      categoryId: c.categoryId || c.CategoryId,
      category: c.category
    })))
  }

  // Hàm xử lý đổi giá (single slider for max price)
  const handlePriceChange = (e) => {
    setMaxPrice(Number(e.target.value))
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Content */}
      <div className="w-full px-4 sm:px-4 lg:px-6 py-6">
        {/* Title and Search Bar - Outside filter box */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tất cả khóa học</h1>
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm tên khóa học, giảng viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6B5EDB] focus:border-[#6B5EDB] text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filter Box */}
          <aside className="lg:w-1/4 w-full bg-white rounded-xl p-6 border border-black h-fit sticky top-24">
            {/* Filter Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bộ lọc</h2>

            {/* Danh mục */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">Danh mục</h3>
              <div className="space-y-2">
                {/* Option "Tất cả" */}
                <label
                  key="all"
                  className="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes("all")}
                    onChange={() => handleCategoryToggle("all")}
                    className="w-4 h-4 mr-2 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2 focus:ring-offset-0"
                    style={{ accentColor: "black" }}
                  />
                  <span>Tất cả</span>
                </label>
                {/* Các danh mục từ API */}
                {categoriesToDisplay.map((cat) => (
                  <label
                    key={cat.categoryId}
                    className="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.includes(Number(cat.categoryId))}
                      onChange={() => handleCategoryToggle(cat.categoryId)}
                      className="w-4 h-4 mr-2 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2 focus:ring-offset-0"
                      style={{ accentColor: "black" }}
                    />
                    <span>{cat.categoryName}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Cấp độ */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">Cấp độ</h3>
              <div className="space-y-2">
                {levels.map((lvl) => (
                  <label
                    key={lvl}
                    className="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(lvl)}
                      onChange={() => handleLevelToggle(lvl)}
                      className="w-4 h-4 mr-2 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2 focus:ring-offset-0"
                      style={{ accentColor: "black" }}
                    />
                    <span>{lvl}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Lọc giá */}
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-gray-700">Giá</h3>
              <div className="flex flex-col gap-3">
                {/* Price display when dragging */}
                <div className="relative">
                  <div className="text-center mb-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat("vi-VN").format(maxPrice || 0)} đ
                    </span>
                  </div>
                </div>
                {/* Single slider */}
                <input
                  type="range"
                  min="0"
                  max="20000000"
                  step="100000"
                  value={maxPrice}
                  onChange={handlePriceChange}
                  className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer price-slider"
                  style={{
                    background: `linear-gradient(to right, black 0%, black ${(maxPrice / 20000000) * 100}%, #d1d5db ${(maxPrice / 20000000) * 100}%, #d1d5db 100%)`
                  }}
                />
                {/* Price labels */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>0đ</span>
                  <span>20.000.000₫</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Courses List */}
          <section className="lg:w-3/4 w-full">
          {filteredCourses.length === 0 ? (
            <p className="text-gray-500 text-center">Không có khóa học nào phù hợp.</p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id}>
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-2">
              <button 
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === 1
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Trang trước
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange && onPageChange(page)}
                  className={`px-3 py-1 rounded-md border ${
                    page === currentPage
                      ? "bg-[#06b6d4] text-white border-[#06b6d4]"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button 
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md border ${
                  currentPage === totalPages
                    ? "border-gray-300 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Trang sau
              </button>
            </div>
          )}
          </section>
        </div>
      </div>
    </div>
  )
}
