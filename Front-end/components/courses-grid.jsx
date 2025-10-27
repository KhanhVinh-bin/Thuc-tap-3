"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import CourseCard from "./course-card"

export default function CoursesGrid({ courses = [] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [selectedLevel, setSelectedLevel] = useState("Tất cả")
  const [priceRange, setPriceRange] = useState([0, 20000000])

  const categories = [
    "Tất cả",
    "Lập trình Web",
    "Lập trình Mobile",
    "AI & Data",
    "Cloud & DevOps",
    "Database",
    "Bảo mật an ninh",
    "Kiểm thử",
    "Blockchain & Web3",
    "UI/UX Design",
  ]

  const levels = ["Tất cả", "Cơ bản", "Trung cấp", "Nâng cao"]

  // Lọc dữ liệu
  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchCategory =
      selectedCategory === "Tất cả" ||
      course.category?.toLowerCase() === selectedCategory.toLowerCase()

    const matchLevel =
      selectedLevel === "Tất cả" ||
      course.level?.toLowerCase() === selectedLevel.toLowerCase()

    const coursePrice = course.price || 0
    const matchPrice = coursePrice >= priceRange[0] && coursePrice <= priceRange[1]

    return matchSearch && matchCategory && matchLevel && matchPrice
  })

  // Hàm xử lý đổi giá
  const handlePriceChange = (e) => {
    const value = Number(e.target.value)
    const name = e.target.name
    if (name === "min") {
      setPriceRange([value, priceRange[1]])
    } else {
      setPriceRange([priceRange[0], value])
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Tất cả khóa học</h1>

        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm max-w-md">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Tìm kiếm khóa học, giảng viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="lg:w-1/4 w-full bg-white rounded-xl p-6 border border-gray-200 h-fit sticky top-24">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bộ lọc</h2>

          {/* Danh mục */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-700">Danh mục</h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat} className="flex items-center text-sm text-gray-600">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="mr-2 accent-[#06b6d4]"
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Cấp độ */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-700">Cấp độ</h3>
            <div className="space-y-2">
              {levels.map((lvl) => (
                <label key={lvl} className="flex items-center text-sm text-gray-600">
                  <input
                    type="radio"
                    name="level"
                    value={lvl}
                    checked={selectedLevel === lvl}
                    onChange={() => setSelectedLevel(lvl)}
                    className="mr-2 accent-[#06b6d4]"
                  />
                  {lvl}
                </label>
              ))}
            </div>
          </div>

          {/* Lọc giá */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-700">Giá</h3>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{priceRange[0].toLocaleString()}đ</span>
                <span>{priceRange[1].toLocaleString()}đ</span>
              </div>

              {/* Thanh chọn giá */}
              <input
                type="range"
                name="min"
                min="0"
                max="20000000"
                step="500000"
                value={priceRange[0]}
                onChange={handlePriceChange}
                className="w-full accent-[#06b6d4]"
              />
              <input
                type="range"
                name="max"
                min="0"
                max="20000000"
                step="500000"
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="w-full accent-[#06b6d4]"
              />
            </div>
          </div>

          {/* Reset */}
          <button
            onClick={() => {
              setSearchTerm("")
              setSelectedCategory("Tất cả")
              setSelectedLevel("Tất cả")
              setPriceRange([0, 20000000])
            }}
            className="mt-4 w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm hover:bg-gray-200"
          >
            Xóa bộ lọc
          </button>
        </aside>

        {/* Courses List */}
        <section className="lg:w-3/4 w-full">
          {filteredCourses.length === 0 ? (
            <p className="text-gray-500 text-center">Không có khóa học nào phù hợp.</p>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <div key={course.id} className="fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
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
  )
}
