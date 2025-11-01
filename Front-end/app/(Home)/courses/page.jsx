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

      // Xử lý thumbnailUrl - hỗ trợ cả PascalCase và camelCase
      const thumbnailUrl = course.ThumbnailUrl || course.thumbnailUrl || null
      let imageUrl = "/placeholder-course.jpg"
      
      if (thumbnailUrl) {
        // Nếu là URL tuyệt đối (http/https), dùng trực tiếp
        if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
          imageUrl = thumbnailUrl
        } 
        // Nếu là đường dẫn file tương đối, đảm bảo bắt đầu bằng /
        else {
          imageUrl = thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`
        }
      }

      // Xử lý previewVideoUrl - hỗ trợ cả PascalCase và camelCase
      const previewVideoUrl = course.PreviewVideoUrl || course.previewVideoUrl || null
      let videoUrl = ""
      
      if (previewVideoUrl) {
        // Nếu là URL YouTube embed hoặc absolute URL, dùng trực tiếp
        if (previewVideoUrl.includes('youtube.com') || previewVideoUrl.includes('youtu.be')) {
          // Convert YouTube URL to embed format if needed
          let videoId = previewVideoUrl
          if (previewVideoUrl.includes('/watch?v=')) {
            videoId = previewVideoUrl.split('/watch?v=')[1].split('&')[0]
          } else if (previewVideoUrl.includes('youtu.be/')) {
            videoId = previewVideoUrl.split('youtu.be/')[1].split('?')[0]
          }
          videoUrl = `https://www.youtube.com/embed/${videoId}`
        } else if (previewVideoUrl.startsWith('http://') || previewVideoUrl.startsWith('https://')) {
          videoUrl = previewVideoUrl
        } else {
          // Nếu là đường dẫn file, thêm prefix nếu cần
          videoUrl = previewVideoUrl.startsWith('/') ? previewVideoUrl : `/${previewVideoUrl}`
        }
      }

      return {
        id: course.CourseId || course.courseId,
        courseId: course.CourseId || course.courseId, // Thêm để filter theo categoryId
        name: course.Title || course.title || "Khóa học",
        title: course.Title || course.title || "Khóa học",
        description: course.Description || course.description || "Mô tả khóa học",
        price: course.Price || course.price || 0,
        priceFormatted: formatVND(course.Price || course.price),
        oldPrice: (course.Price || course.price) ? formatVND((course.Price || course.price) * 1.5) : "",
        discount: (course.Price || course.price) ? "33" : "0",
        image: imageUrl,
        thumbnailUrl: imageUrl, // Thêm để component khác có thể dùng
        previewVideoUrl: videoUrl, // Thêm video URL
        category: course.Category?.CategoryName || course.Category?.categoryName || course.category?.CategoryName || course.category?.categoryName || "Lập trình",
        categoryId: course.CategoryId || course.categoryId || course.Category?.CategoryId || course.Category?.categoryId || course.category?.CategoryId || course.category?.categoryId || null,
        level: course.Level || course.level || "Cơ bản",
        language: course.Language || course.language || "Tiếng Việt",
        duration: course.Duration || course.duration || "20 giờ",
        rating: course.Instructor?.RatingAverage || course.Instructor?.ratingAverage || course.instructor?.RatingAverage || course.instructor?.ratingAverage || (Math.random() * 5).toFixed(1),
        reviews: Math.floor(Math.random() * 500) + 100,
        totalStudents: course.Instructor?.TotalStudents || course.Instructor?.totalStudents || course.instructor?.TotalStudents || course.instructor?.totalStudents || 0,
        students: (course.Instructor?.TotalStudents || course.Instructor?.totalStudents || course.instructor?.TotalStudents || course.instructor?.totalStudents)
          ? `${Math.floor((course.Instructor?.TotalStudents || course.Instructor?.totalStudents || course.instructor?.TotalStudents || course.instructor?.totalStudents) / 1000)}k`
          : `${Math.floor(Math.random() * 200) + 50}k`,
        instructorName: course.Instructor?.Expertise || course.Instructor?.expertise || course.instructor?.Expertise || course.instructor?.expertise || "Giảng viên",
        instructor: {
          name: course.Instructor?.Expertise || course.Instructor?.expertise || course.instructor?.Expertise || course.instructor?.expertise || "Giảng viên",
          expertise: course.Instructor?.Expertise || course.Instructor?.expertise || course.instructor?.Expertise || course.instructor?.expertise,
          bio: course.Instructor?.Biography || course.Instructor?.biography || course.instructor?.Biography || course.instructor?.biography || "Chuyên gia trong lĩnh vực lập trình",
          avatar: "/placeholder-user.jpg",
        },
        slug: (course.Title || course.title || "")
          ?.toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim() || `course-${course.CourseId || course.courseId}`,
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
