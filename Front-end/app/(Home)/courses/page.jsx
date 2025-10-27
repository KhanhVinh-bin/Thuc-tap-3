"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CoursesGrid from "@/components/courses-grid"

export default function CoursesPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // API Configuration
  const API_BASE_URL = "https://localhost:7025/api"

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/courses`, {
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      const formattedCourses = formatCourseData(data)
      setCourses(formattedCourses)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Format course data for display
  const formatCourseData = (coursesData) => {
    if (!Array.isArray(coursesData)) return []

    return coursesData.map((course) => {
      const formatVND = (value) => (value ? `${value.toLocaleString("vi-VN")}đ` : "Miễn phí")

      return {
        id: course.courseId,
        name: course.title || "Khóa học",
        title: course.title || "Khóa học",
        description: course.description || "Mô tả khóa học",
        price: course.price || 0,
        priceFormatted: formatVND(course.price),
        oldPrice: course.price ? formatVND(course.price * 1.5) : "",
        discount: course.price ? "33" : "0",
        image: course.thumbnailUrl || "/placeholder.jpg",
        category: course.category?.categoryName || "Lập trình",
        level: course.level || "Cơ bản",
        language: course.language || "Tiếng Việt",
        duration: course.duration || "20 giờ",
        rating: course.instructor?.ratingAverage || (Math.random() * 5).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 100,
        students: course.instructor?.totalStudents
          ? `${course.instructor.totalStudents}k`
          : `${Math.floor(Math.random() * 200) + 50}k`,
        instructorName: course.instructor?.expertise || "Giảng viên",
        instructor: {
          name: course.instructor?.expertise || "Giảng viên",
          expertise: course.instructor?.expertise,
          bio: course.instructor?.biography || "Chuyên gia trong lĩnh vực lập trình",
          avatar: "/placeholder-user.jpg",
        },
        slug: course.title
          ?.toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim() || `course-${course.courseId}`,
      }
    })
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Đang tải khóa học...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 font-medium">Lỗi khi tải khóa học</p>
                <p className="text-red-500 text-sm mt-2">{error}</p>
                <button 
                  onClick={fetchCourses}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <CoursesGrid courses={courses} />
      <Footer />
    </div>
  )
}
