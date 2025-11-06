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

  // ✅ Fetch categories từ API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Categories`, {
        headers: { "Content-Type": "application/json" },
      })
      if (response.ok) {
        const categoriesData = await response.json()
        console.log("📦 Raw categories data from API:", categoriesData)
        
        if (Array.isArray(categoriesData) && categoriesData.length > 0) {
          // ✅ Normalize dữ liệu để đảm bảo format nhất quán
          const normalizedCategories = categoriesData.map(cat => ({
            categoryId: cat.categoryId || cat.CategoryId || cat.categoryID || cat.CategoryID,
            categoryName: cat.categoryName || cat.CategoryName,
            parentId: cat.parentId === undefined || cat.parentId === null 
              ? (cat.ParentId === undefined || cat.ParentId === null 
                ? (cat.parentID === undefined || cat.parentID === null ? cat.ParentID : cat.parentID)
                : cat.ParentId)
              : cat.parentId
          }))
          
          // ✅ Loại bỏ duplicate và filter các category hợp lệ
          const uniqueCategories = normalizedCategories
            .filter(cat => cat.categoryId && cat.categoryName)
            .filter((cat, index, self) => 
              index === self.findIndex(c => c.categoryId === cat.categoryId)
            )
          
          console.log("✅ Normalized categories:", uniqueCategories)
          setCategories(uniqueCategories)
        } else {
          console.warn("⚠️ Categories API returned empty array or invalid data")
          // ✅ Fallback: sử dụng danh mục mặc định
          setCategories([
            { categoryId: 1, categoryName: "Lập trình", parentId: null },
            { categoryId: 2, categoryName: "Data Science", parentId: null },
            { categoryId: 3, categoryName: "Thiết kế", parentId: null },
            { categoryId: 4, categoryName: "Kinh doanh", parentId: null },
            { categoryId: 5, categoryName: "Công nghệ thông tin", parentId: null },
            { categoryId: 6, categoryName: "Kinh doanh", parentId: null },
            { categoryId: 8, categoryName: "Marketing", parentId: null },
            { categoryId: 9, categoryName: "Ngôn ngữ", parentId: null },
            { categoryId: 10, categoryName: "Lập trình Web", parentId: 1 },
            { categoryId: 11, categoryName: "Lập trình Mobile", parentId: 1 },
            { categoryId: 14, categoryName: "Kế toán", parentId: 2 },
            { categoryId: 15, categoryName: "Photoshop", parentId: 3 },
            { categoryId: 16, categoryName: "UI/UX Design", parentId: 3 },
            { categoryId: 17, categoryName: "Digital Marketing", parentId: 4 },
            { categoryId: 18, categoryName: "SEO", parentId: 4 },
            { categoryId: 19, categoryName: "Tiếng Anh", parentId: 5 },
          ])
        }
      } else {
        console.warn(`⚠️ Categories API not available, status: ${response.status}`)
        // ✅ Fallback: sử dụng danh mục mặc định
        setCategories([
          { categoryId: 1, categoryName: "Lập trình", parentId: null },
          { categoryId: 2, categoryName: "Data Science", parentId: null },
          { categoryId: 3, categoryName: "Thiết kế", parentId: null },
          { categoryId: 4, categoryName: "Kinh doanh", parentId: null },
          { categoryId: 5, categoryName: "Công nghệ thông tin", parentId: null },
          { categoryId: 6, categoryName: "Kinh doanh", parentId: null },
          { categoryId: 8, categoryName: "Marketing", parentId: null },
          { categoryId: 9, categoryName: "Ngôn ngữ", parentId: null },
          { categoryId: 10, categoryName: "Lập trình Web", parentId: 1 },
          { categoryId: 11, categoryName: "Lập trình Mobile", parentId: 1 },
          { categoryId: 14, categoryName: "Kế toán", parentId: 2 },
          { categoryId: 15, categoryName: "Photoshop", parentId: 3 },
          { categoryId: 16, categoryName: "UI/UX Design", parentId: 3 },
          { categoryId: 17, categoryName: "Digital Marketing", parentId: 4 },
          { categoryId: 18, categoryName: "SEO", parentId: 4 },
          { categoryId: 19, categoryName: "Tiếng Anh", parentId: 5 },
        ])
      }
    } catch (err) {
      console.error("⚠️ Could not fetch categories:", err.message)
      // ✅ Fallback: sử dụng danh mục mặc định
      setCategories([
        { categoryId: 1, categoryName: "Lập trình", parentId: null },
        { categoryId: 2, categoryName: "Data Science", parentId: null },
        { categoryId: 3, categoryName: "Thiết kế", parentId: null },
        { categoryId: 4, categoryName: "Kinh doanh", parentId: null },
        { categoryId: 5, categoryName: "Công nghệ thông tin", parentId: null },
        { categoryId: 6, categoryName: "Kinh doanh", parentId: null },
        { categoryId: 8, categoryName: "Marketing", parentId: null },
        { categoryId: 9, categoryName: "Ngôn ngữ", parentId: null },
        { categoryId: 10, categoryName: "Lập trình Web", parentId: 1 },
        { categoryId: 11, categoryName: "Lập trình Mobile", parentId: 1 },
        { categoryId: 14, categoryName: "Kế toán", parentId: 2 },
        { categoryId: 15, categoryName: "Photoshop", parentId: 3 },
        { categoryId: 16, categoryName: "UI/UX Design", parentId: 3 },
        { categoryId: 17, categoryName: "Digital Marketing", parentId: 4 },
        { categoryId: 18, categoryName: "SEO", parentId: 4 },
        { categoryId: 19, categoryName: "Tiếng Anh", parentId: 5 },
      ])
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
      
      // ✅ Extract unique categories từ courses nếu API Categories không có hoặc rỗng
      // ✅ Chỉ extract nếu categories vẫn còn rỗng sau khi fetch từ API
      // ✅ Sử dụng callback để đảm bảo lấy giá trị mới nhất của categories state
      setCategories(prevCategories => {
        if (prevCategories.length === 0 && formattedCourses.length > 0) {
          const uniqueCategoryIds = new Set()
          const extractedCategories = []
          
          formattedCourses.forEach(course => {
            const catId = course.categoryId
            const catName = course.category
            if (catId && catName && !uniqueCategoryIds.has(catId)) {
              uniqueCategoryIds.add(catId)
              extractedCategories.push({
                categoryId: catId,
                categoryName: catName,
                parentId: null
              })
            }
          })
          
          if (extractedCategories.length > 0) {
            console.log("✅ Extracted categories from courses:", extractedCategories)
            return extractedCategories
          }
        }
        return prevCategories // ✅ Giữ nguyên categories hiện tại nếu đã có
      })
      
      // Set courses cho trang đầu tiên
      setFilteredAllCourses(formattedCourses) // ✅ Set filtered courses ban đầu = tất cả courses
      updateDisplayedCourses(formattedCourses, currentPage)
    } catch (err) {
      console.error("Error fetching courses:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ✅ State để lưu filtered courses (sau khi filter theo category, level, price, search)
  const [filteredAllCourses, setFilteredAllCourses] = useState([])

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
      updateDisplayedCourses(filteredAllCourses.length > 0 ? filteredAllCourses : allCourses, newPage)
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

    // ✅ QUAN TRỌNG: Lấy categoryId từ nhiều nguồn để đảm bảo không bỏ sót
    // Backend trả về CategoryId trực tiếp trong CourseDTO
    const categoryId = course.CategoryId || course.categoryId || 
                       course.Category?.CategoryId || course.Category?.categoryId || 
                       course.category?.CategoryId || course.category?.categoryId || 
                       null
    
    // ✅ Lấy categoryName từ Category object hoặc fallback
    const categoryName = course.Category?.CategoryName || course.Category?.categoryName || 
                        course.category?.CategoryName || course.category?.categoryName || 
                        "Lập trình"
    
    // ✅ Log để debug
    console.log(`📝 Formatting course "${title}":`, {
      courseId,
      categoryId,
      categoryName,
      rawCategoryId: course.CategoryId || course.categoryId,
      rawCategory: course.Category || course.category
    })
    
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
      category: categoryName,
      categoryId: categoryId, // ✅ Đảm bảo categoryId được lưu đúng
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
    // ✅ Fetch categories và courses song song
    Promise.all([
      fetchCategories(),
      fetchCourses()
    ]).catch(err => {
      console.error("Error in useEffect:", err)
    })
  }, [])

  // ✅ Debug: Log categories khi thay đổi
  useEffect(() => {
    console.log("📋 Categories state updated:", {
      count: categories.length,
      categories: categories
    })
  }, [categories])

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

  // ✅ Handle filter change từ CoursesGrid
  const handleFilterChange = (filterFn) => {
    if (filterFn && typeof filterFn === 'function') {
      const filtered = filterFn(allCourses)
      setFilteredAllCourses(filtered)
      setCurrentPage(1) // Reset về trang đầu khi filter
      updateDisplayedCourses(filtered, 1)
    }
  }

  // ✅ Tính totalPages dựa trên filteredAllCourses
  const totalPages = Math.ceil((filteredAllCourses.length > 0 ? filteredAllCourses : allCourses).length / coursesPerPage) || 1

  return (
    <div className="min-h-screen">
      <Header />
      <CoursesGrid 
        courses={courses} 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        categories={categories}
        onFilterChange={handleFilterChange}
      />
      <Footer />
    </div>
  )
}
