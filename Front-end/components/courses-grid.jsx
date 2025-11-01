"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import CourseCard from "./course-card"

export default function CoursesGrid({ courses = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState(["Tất cả"])
  const [selectedLevels, setSelectedLevels] = useState(["Tất cả"])
  const [maxPrice, setMaxPrice] = useState(20000000)

  // Handle category selection with checkboxes
  const handleCategoryToggle = (categoryName) => {
    setSelectedCategories(prev => {
      if (categoryName === "Tất cả") {
        // If "Tất cả" is selected, unselect all others and select only "Tất cả"
        return prev.includes("Tất cả") ? [] : ["Tất cả"]
      } else {
        // If any other category is selected, remove "Tất cả" and toggle this category
        const newSelection = prev.includes("Tất cả") 
          ? prev.filter(cat => cat !== "Tất cả")
          : [...prev]
        
        if (newSelection.includes(categoryName)) {
          return newSelection.filter(cat => cat !== categoryName)
        } else {
          return [...newSelection, categoryName]
        }
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
  
  // Default categories from image
  const defaultCategories = [
    "Tất cả",
    "Lập trình wed",
    "Lập trình Mobile",
    "AI & Data",
    "Cloud & DevOps",
    "Database",
    "Bảo mật an ninh",
    "Kiểm thử",
    "Lập trình game",
    "Backend",
    "UI/UX Design",
    "Blockchain & Web3"
  ]

  // Lọc dữ liệu
  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())

    // Match category: check if selectedCategories includes "Tất cả" or matches course category
    const matchCategory = selectedCategories.length === 0 ||
      selectedCategories.includes("Tất cả") ||
      selectedCategories.some(cat => 
        course.category?.toLowerCase().includes(cat.toLowerCase()) ||
        course.categoryName?.toLowerCase().includes(cat.toLowerCase())
      )

    // Match level: check if selectedLevels includes "Tất cả" or matches course level
    const matchLevel = selectedLevels.length === 0 ||
      selectedLevels.includes("Tất cả") ||
      selectedLevels.some(lvl => 
        course.level?.toLowerCase() === lvl.toLowerCase()
      )

    // Match price: course price should be <= maxPrice
    const coursePrice = course.price || 0
    const matchPrice = coursePrice <= maxPrice

    return matchSearch && matchCategory && matchLevel && matchPrice
  })

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
                {defaultCategories.map((category) => (
                  <label
                    key={category}
                    className="flex items-center text-sm text-gray-700 cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className="w-4 h-4 mr-2 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2 focus:ring-offset-0"
                      style={{ accentColor: "black" }}
                    />
                    <span>{category}</span>
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

          {/* Pagination demo */}
          <div className="flex justify-center items-center mt-10 gap-2">
            <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">
              &lt;
            </button>
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                className={`px-3 py-1 rounded-md border ${
                  p === 1
                    ? "bg-[#06b6d4] text-white border-[#06b6d4]"
                    : "border-gray-300 text-gray-600 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button className="px-3 py-1 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">
              &gt;
            </button>
          </div>
          </section>
        </div>
      </div>
    </div>
  )
}
