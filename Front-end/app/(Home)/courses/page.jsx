"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CoursesGrid from "@/components/courses-grid"
import { getReviewsByCourse } from "@/lib/api"
import { getEnrollmentsByCourse } from "@/lib/enrollmentApi"

export default function CoursesPage() {
  const [allCourses, setAllCourses] = useState([]) // Lưu tất cả courses để phân trang
  const [courses, setCourses] = useState([]) // Courses hiển thị trên trang hiện tại
  const [categories, setCategories] = useState([]) // ✅ Lưu danh mục từ API
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const coursesPerPage = 6

  // API Configuration
  const API_BASE_URL = "https://localhost:7025/api"

  // ✅ Fetch categories từ API (nếu có endpoint Categories)
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Categories`, {
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        const categoriesData = await response.json()
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          setCategories(categoriesData)
          console.log("✅ Categories loaded from API:", categoriesData)
        }
      } else {
        console.log("⚠️ Categories API not available, will extract from courses")
      }
    } catch (err) {
      console.log("⚠️ Could not fetch categories, will extract from courses:", err.message)
    }
  }

  // ✅ Fetch courses từ API và lấy thêm reviews, enrollments
  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/Courses`, {
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      console.log("📦 API Response (raw data):", data)
      
      // ✅ Filter chỉ lấy các khóa học đã published và có dữ liệu hợp lệ
      const validCourses = Array.isArray(data) ? data.filter(c => {
        if (!c) return false
        const courseId = c.CourseId || c.courseId
        const title = c.Title || c.title
        const status = (c.Status || c.status || "").toLowerCase().trim()
        return courseId && title && status === "published"
      }) : []
      
      console.log(`📊 Valid courses after filter: ${validCourses.length}`)
      
      // ✅ Format courses và lấy thêm reviews, enrollments
      const formattedCourses = await Promise.all(
        validCourses.map(async (course) => {
          const courseId = course.CourseId || course.courseId
          
          // Lấy reviews và enrollments song song
          const [reviewsData, enrollmentsData] = await Promise.all([
            getReviewsByCourse(courseId).catch(() => ({ reviews: [], stats: null })),
            getEnrollmentsByCourse(courseId).catch(() => [])
          ])
          
          // Tính rating từ reviews
          const reviews = reviewsData?.reviews || []
          const totalReviews = reviews.length
          const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, r) => sum + (r.rating || r.Rating || 0), 0) / totalReviews).toFixed(1)
            : "0.0"
          
          // Tính students từ enrollments
          const totalStudents = Array.isArray(enrollmentsData) ? enrollmentsData.length : 0
          
          return formatCourseData(course, {
            rating: parseFloat(averageRating),
            reviews: totalReviews,
            totalStudents: totalStudents,
            students: totalStudents > 0 ? (totalStudents >= 1000 ? `${(totalStudents / 1000).toFixed(1)}k` : `${totalStudents}`) : "0"
          })
        })
      )
      
      console.log(`📊 Total courses loaded: ${formattedCourses.length}`)
      setAllCourses(formattedCourses)
      
      // ✅ Extract unique categories từ courses nếu API Categories không có
      if (categories.length === 0 && formattedCourses.length > 0) {
        const uniqueCategories = [...new Set(formattedCourses.map(c => c.category).filter(Boolean))]
        setCategories(uniqueCategories.map(name => ({ CategoryName: name })))
      }
      
      // Set courses cho trang đầu tiên
      updateDisplayedCourses(formattedCourses, currentPage)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Cập nhật courses hiển thị theo trang
  const updateDisplayedCourses = (allCoursesData, page) => {
    const startIndex = (page - 1) * coursesPerPage
    const endIndex = startIndex + coursesPerPage
    setCourses(allCoursesData.slice(startIndex, endIndex))
  }

  // ✅ Xử lý chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      updateDisplayedCourses(allCourses, newPage)
      // Scroll to top khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Format course data for display
  const formatCourseData = (course, extraData = {}) => {
    const formatVND = (value) => (value ? `${value.toLocaleString("vi-VN")}đ` : "Miễn phí")

    // Xử lý thumbnailUrl
    const thumbnailUrl = course.ThumbnailUrl || course.thumbnailUrl || null
    let imageUrl = "/placeholder-course.jpg"
    
    if (thumbnailUrl && thumbnailUrl.trim() !== "") {
      if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
        imageUrl = thumbnailUrl
      } else if (thumbnailUrl.includes('/uploads/')) {
        imageUrl = `https://localhost:3001${thumbnailUrl.startsWith('/') ? '' : '/'}${thumbnailUrl}`
      } else {
        imageUrl = thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`
      }
    }

    // Xử lý previewVideoUrl
    const previewVideoUrl = course.PreviewVideoUrl || course.previewVideoUrl || null
    let videoUrl = ""
    
    if (previewVideoUrl) {
      if (previewVideoUrl.includes('youtube.com') || previewVideoUrl.includes('youtu.be')) {
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
        videoUrl = previewVideoUrl.startsWith('/') ? previewVideoUrl : `/${previewVideoUrl}`
      }
    }

    const courseId = course.CourseId || course.courseId
    const title = course.Title || course.title || "Khóa học"
    const description = course.Description || course.description || "Mô tả khóa học"
    const priceRaw = course.Price || course.price || 0
    const price = typeof priceRaw === 'number' 
      ? priceRaw
      : parseFloat((priceRaw.toString().replace(/[^\d.]/g, ''))) || 0

    // ✅ Map level từ API: beginner->Cơ bản, intermediate->Trung cấp, advanced->Nâng cao
    const levelRaw = (course.Level || course.level || "").toLowerCase().trim()
    let levelDisplay = "Cơ bản"
    if (levelRaw === "beginner") levelDisplay = "Cơ bản"
    else if (levelRaw === "intermediate") levelDisplay = "Trung cấp"
    else if (levelRaw === "advanced") levelDisplay = "Nâng cao"
    else if (levelRaw) levelDisplay = levelRaw.charAt(0).toUpperCase() + levelRaw.slice(1)

    return {
      id: courseId,
      courseId: courseId,
      name: title,
      title: title,
      description: description,
      price: price,
      priceFormatted: formatVND(priceRaw),
      oldPrice: priceRaw ? formatVND(priceRaw * 1.5) : "",
      discount: priceRaw ? "33" : "0",
      image: imageUrl,
      thumbnailUrl: imageUrl,
      previewVideoUrl: videoUrl,
      category: course.Category?.CategoryName || course.Category?.categoryName || course.category?.CategoryName || course.category?.categoryName || "Lập trình",
      categoryId: course.CategoryId || course.categoryId || course.Category?.CategoryId || course.Category?.categoryId || course.category?.CategoryId || course.category?.categoryId || null,
      level: levelDisplay, // ✅ Dùng level đã map
      language: course.Language || course.language || "Tiếng Việt",
      duration: course.Duration || course.duration || "20 giờ",
      // ✅ Lấy từ API thật (từ extraData)
      rating: extraData.rating || 0,
      reviews: extraData.reviews || 0,
      totalStudents: extraData.totalStudents || 0,
      students: extraData.students || "0",
      // ✅ Thêm prerequisites và learningOutcomes từ API
      prerequisites: course.Prerequisites || course.prerequisites || null,
      learningOutcomes: course.LearningOutcomes || course.learningOutcomes || null,
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
        .trim() || `course-${courseId}`,
    }
  }

  useEffect(() => {
    fetchCategories() // ✅ Load categories trước
    fetchCourses()
  }, [])

  // Tính tổng số trang (phải tính sau khi allCourses đã có dữ liệu)
  const totalPages = Math.ceil(allCourses.length / coursesPerPage) || 1

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
      <CoursesGrid 
        courses={courses} 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        categories={categories}
      />
      <Footer />
    </div>
  )
}
