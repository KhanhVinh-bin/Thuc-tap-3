"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import TongQuan from "@/components/courseid/tongquan"
import NoiDung from "@/components/courseid/noidung"
import KhGiangVien from "@/components/courseid/khgiangvien"
import DanhGia from "@/components/courseid/danhgia"

import {
  getCourseById,
  formatCourseData,
  getReviewsByCourse,
  createReview,
  addToCartAPI,
  getOrdersByUser,
} from "@/lib/api"
import { getEnrollmentsByCourse, getEnrollmentsByUser } from "@/lib/enrollmentApi"

import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"


export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()

  // contexts
  const { addToCart: addToCartContext, isInCart } = useCart()
  const { isAuthenticated, user } = useAuth()

  // UI state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageZoom, setImageZoom] = useState(100)

  // course state
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // review state
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [reviewContent, setReviewContent] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState({
    average: 0,
    total: 0,
    stars: [0,0,0,0,0]
  })
  
  // students count state
  const [studentsCount, setStudentsCount] = useState(0)
  
  // enrollment state - kiểm tra user đã mua khóa học chưa
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)

  // Ensure tab resets when switching to a different course ID
  useEffect(() => {
    setActiveTab("overview")
  }, [params?.id])
  
  // Helper to check enrollment - kiểm tra user đã mua khóa học chưa (từ Enrollment hoặc Orders)
  const checkEnrollment = useCallback(async (courseId) => {
    if (!isAuthenticated || !user || !courseId) {
      setIsEnrolled(false)
      return
    }

    try {
      setCheckingEnrollment(true)
      const userId = user.userId || user.id || user.UserId || user.ID
      if (!userId) {
        setIsEnrolled(false)
        return
      }

      const parsedCourseId = typeof courseId === 'string' ? parseInt(courseId, 10) : courseId
      let enrolled = false
      
      // ✅ Method 1: Kiểm tra từ Enrollments
      try {
        const enrollments = await getEnrollmentsByUser(userId)
        console.log("📦 Enrollments data:", enrollments)
        
        enrolled = enrollments.some(
          (enrollment) => {
            const eCourseId = enrollment.courseId || enrollment.CourseId
            const eStatus = enrollment.status || enrollment.Status || ''
            const isMatch = eCourseId === parsedCourseId
            const isValidStatus = ['active', 'Active', 'Completed', 'completed', 'paid', 'Paid'].includes(eStatus)
            
            if (isMatch) {
              console.log("🔍 Found enrollment match:", { eCourseId, eStatus, isValidStatus })
            }
            
            return isMatch && isValidStatus
          }
        )
        
        if (enrolled) {
          console.log("✅ Found enrollment for course:", parsedCourseId)
          setIsEnrolled(true)
          setCheckingEnrollment(false)
          return
        }
      } catch (enrollmentError) {
        console.warn("⚠️ Error fetching enrollments, trying Orders:", enrollmentError)
      }
      
      // ✅ Method 2: Kiểm tra từ Orders (nếu enrollment không có thì check từ orders đã thanh toán)
      if (!enrolled) {
        try {
          const orders = await getOrdersByUser(userId)
          console.log("📦 Orders data:", orders)
          
          // Kiểm tra xem có order nào đã thanh toán (status = "paid") chứa courseId này không
          enrolled = orders.some((order) => {
            const orderStatus = order.status || order.Status || ''
            const isPaid = orderStatus.toLowerCase() === 'paid'
            
            if (!isPaid) return false
            
            // Kiểm tra orderDetails có chứa courseId này không
            const orderDetails = order.orderDetails || order.OrderDetails || []
            const hasCourse = orderDetails.some((detail) => {
              const detailCourseId = detail.courseId || detail.CourseId
              return detailCourseId === parsedCourseId
            })
            
            if (hasCourse) {
              console.log("✅ Found paid order for course:", parsedCourseId, "Order ID:", order.orderId || order.OrderId)
            }
            
            return hasCourse
          })
          
          if (enrolled) {
            console.log("✅ Found paid order for course:", parsedCourseId)
          }
        } catch (orderError) {
          console.error("❌ Error fetching orders:", orderError)
        }
      }
      
      setIsEnrolled(enrolled)
      console.log("✅ Final enrollment check result:", { enrolled, courseId: parsedCourseId, userId })
    } catch (error) {
      console.error("❌ Error checking enrollment:", error)
      setIsEnrolled(false)
    } finally {
      setCheckingEnrollment(false)
    }
  }, [isAuthenticated, user])
  
  // Check enrollment when user or course changes
  useEffect(() => {
    if (course?.id && isAuthenticated && user) {
      checkEnrollment(course.id)
    } else {
      setIsEnrolled(false)
    }
  }, [course?.id, isAuthenticated, user, checkEnrollment])

  // Helper to load reviews (separate, can be reused)
  const loadReviews = async (courseId) => {
    try {
      setReviewsLoading(true)
      const reviewsData = await getReviewsByCourse(courseId)
      if (reviewsData) {
        const formattedReviews = (reviewsData.reviews || []).map(r => ({
          id: r.reviewId ?? r.id,
          user: {
            name: (r.user && (r.user.fullName || r.user.name)) || "Người dùng",
            avatar: (r.user && (r.user.avatarUrl || r.user.avatar)) || "/placeholder-user.jpg"
          },
          rating: r.rating ?? r.Rating ?? 0,
          content: r.comment ?? r.Comment ?? "",
          date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : (r.createdAtString || "")
        }))
        setReviews(formattedReviews)
        
        // ✅ Tính toán rating từ reviews thực tế: tổng số sao / số lượng đánh giá
        const total = formattedReviews.length
        if (total > 0) {
          const totalStars = formattedReviews.reduce((sum, r) => sum + (r.rating || 0), 0)
          const average = (totalStars / total).toFixed(1)
          setReviewStats({ 
            average: parseFloat(average), 
            total, 
            stars: [0,0,0,0,0] 
          })
        } else {
          // Nếu có stats từ API thì dùng, không thì để 0
          if (reviewsData.stats) {
            setReviewStats(reviewsData.stats)
          } else {
            setReviewStats({ average: 0, total: 0, stars: [0,0,0,0,0] })
          }
        }
      } else {
        setReviews([])
        setReviewStats({ average: 0, total: 0, stars: [0,0,0,0,0] })
      }
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setReviews([])
      setReviewStats({ average: 0, total: 0, stars: [0,0,0,0,0] })
    } finally {
      setReviewsLoading(false)
    }
  }
  
  // Helper to load students count
  const loadStudentsCount = async (courseId) => {
    try {
      const enrollments = await getEnrollmentsByCourse(courseId)
      const count = Array.isArray(enrollments) ? enrollments.length : 0
      setStudentsCount(count)
    } catch (err) {
      console.error("Error fetching students count:", err)
      setStudentsCount(0)
    }
  }

  // Fetch course data (robust: isMounted + abort)
  useEffect(() => {
    let isMounted = true
    const abortController = new AbortController()

    const fetchCourseData = async () => {
      const courseId = params?.id
      if (!courseId) {
        if (isMounted) {
          setError("Course ID is missing")
          setLoading(false)
          setCourse(null)
        }
        return
      }

      // reset states for new course
      if (isMounted) {
        setLoading(true)
        setError(null)
        setCourse(null)
        setReviews([])
        setReviewStats({ average: 0, total: 0, stars: [0,0,0,0,0] })
      }

      try {
        // Optional: test API connectivity quickly
        try {
          // quick test, non-blocking if fails fallback to try getCourseById
          await fetch("https://localhost:7025/api/Courses", { signal: abortController.signal, method: "HEAD" }).catch(() => {})
        } catch (e) {
          // ignore: only for info
        }

        const courseData = await getCourseById(courseId, { signal: abortController.signal })
        if (!isMounted) return
        if (!courseData) {
          setError(`Khóa học với ID ${courseId} không tồn tại.`)
          setLoading(false)
          setCourse(null)
          return
        }

        const formattedCourse = formatCourseData ? formatCourseData(courseData) : courseData

        if (!isMounted) return
        if (!formattedCourse) {
          setError("Không thể xử lý dữ liệu khóa học. Dữ liệu không hợp lệ.")
          setLoading(false)
          setCourse(null)
          return
        }

        // set final state
        if (isMounted) {
          setCourse(formattedCourse)
          setLoading(false)
          const finalCourseId = formattedCourse.id ?? courseId
          // load reviews and students count but don't block UI
          loadReviews(finalCourseId).catch(err => console.error("Load reviews error:", err))
          loadStudentsCount(finalCourseId).catch(err => console.error("Load students count error:", err))
          // check enrollment status
          if (isAuthenticated && user) {
            checkEnrollment(finalCourseId).catch(err => console.error("Check enrollment error:", err))
          }
        }
      } catch (err) {
        console.error("Error fetching course:", err)
        if (isMounted) {
          setError(err.message || "Không thể tải thông tin khóa học")
          setLoading(false)
          setCourse(null)
        }
      }
    }

    fetchCourseData()

    return () => {
      isMounted = false
      abortController.abort()
    }
  }, [params?.id])


  // UI: fade-in animation (safe usage)
  useEffect(() => {
    if (typeof window === "undefined") return
    const t = setTimeout(() => {
      const elements = document.querySelectorAll(".fade-in-element")
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("visible")
        }, index * 100)
      })
    }, 100)
    return () => clearTimeout(t)
  }, [course?.id])


  // Handle Buy Now (checks auth, adds to cart via context & API)
  const handleBuyNow = async () => {
    if (!course?.id) {
      alert("Thông tin khóa học không hợp lệ!")
      return
    }

    if (!isAuthenticated) {
      const redirectUrl = `/thanhtoan?courseId=${course.id}`
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }

    try {
      const cartItem = {
        id: course.id,
        title: course.title || "Khóa học",
        instructor: (course.instructor && (course.instructor.name || course.instructor.fullName)) || "Giảng viên",
        price: parseFloat(String(course.price || course.priceValue || 0).replace(/[^\d]/g, "")) || 0,
        image: course.image || course.thumbnailUrl || "/placeholder-course.jpg"
      }

      // Try API add first if addToCartAPI exists
      if (typeof addToCartAPI === "function") {
        try {
          await addToCartAPI({ userId: user?.userId || user?.id, courseId: course.id, quantity: 1 })
        } catch (apiErr) {
          console.warn("addToCartAPI failed, falling back to context add:", apiErr)
        }
      }

      // Update context
      if (typeof addToCartContext === "function") {
        addToCartContext(cartItem)
      }

      // redirect to payment for immediate purchase
      router.push(`/thanhtoan?courseId=${course.id}&buyNow=true`)
    } catch (err) {
      console.error("Error in Buy Now:", err)
      alert("Có lỗi xảy ra khi xử lý mua ngay. Vui lòng thử lại.")
    }
  }

  // Handle Add to Cart (uses API helper then context)
  const handleAddToCart = async () => {
    if (!course?.id) {
      alert("Thông tin khóa học không hợp lệ!")
      return
    }
    if (!user || !isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng!")
      router.push("/login")
      return
    }

    try {
      const cartPayload = {
        userId: user.userId ?? user.id,
        courseId: course.id,
        quantity: 1,
      }

      let apiResult = null
      if (typeof addToCartAPI === "function") {
        apiResult = await addToCartAPI(cartPayload)
        console.log("addToCartAPI result:", apiResult)
      } else {
        // fallback - attempt direct POST
        try {
          const resp = await fetch("https://localhost:7025/api/cartItems", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              cartId: user.userId ?? user.id,
              courseId: course.id,
              quantity: 1,
              addedAt: new Date().toISOString()
            })
          })
          if (!resp.ok) {
            const txt = await resp.text()
            throw new Error(txt || `HTTP ${resp.status}`)
          }
          apiResult = await resp.json()
        } catch (e) {
          console.error("fallback addToCart POST failed:", e)
          throw e
        }
      }

      // update context regardless
      const cartItemForContext = {
        id: course.id,
        title: course.title,
        instructor: (course.instructor && (course.instructor.fullName || course.instructor.name)) || "Giảng viên",
        price: parseFloat(String(course.price || course.priceValue || 0).replace(/[^\d]/g, "")) || 0,
        image: course.image || course.thumbnailUrl || "/placeholder-course.jpg"
      }
      if (typeof addToCartContext === "function") addToCartContext(cartItemForContext)

      alert("Đã thêm vào giỏ hàng thành công!")
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err)
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại!")
    }
  }


  // Review submit - uses createReview if available, else POST fallback
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!reviewContent.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!")
      return
    }
    if (!rating || rating < 1 || rating > 5) {
      alert("Vui lòng chọn số sao từ 1 đến 5!")
      return
    }
    if (reviewContent.trim().length < 10) {
      alert("Nội dung đánh giá ít nhất 10 ký tự!")
      return
    }

    try {
      setSubmittingReview(true)

      const reviewData = {
        CourseId: parseInt(course.id ?? course.courseId),
        UserId: user?.userId ?? user?.id ?? 1,
        Rating: rating,
        Comment: reviewContent.trim()
      }

      console.log("Sending review:", reviewData)

      // prefer createReview helper
      if (typeof createReview === "function") {
        await createReview(reviewData)
      } else {
        // fallback POST
        const res = await fetch("https://localhost:7025/api/Reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reviewData)
        })
        const text = await res.text()
        console.log("Review response raw:", text)
        if (!res.ok) throw new Error(`Lỗi ${res.status}: ${text}`)
      }

      alert("✅ Đánh giá đã được gửi thành công!")
      setReviewContent("")
      setRating(0)
      // reload reviews để cập nhật rating và count
      const courseId = course.id ?? course.courseId
      await loadReviews(courseId)
      // Không cần reload students count vì mua khóa học sẽ tự động +1 enrollment
    } catch (err) {
      console.error("❌ Lỗi khi gửi đánh giá:", err)
      alert("Gửi đánh giá thất bại, vui lòng thử lại!")
    } finally {
      setSubmittingReview(false)
    }
  }


  // Render: error state - redirect to courses list instead of showing error
  useEffect(() => {
    if (error) {
      router.push('/courses')
    }
  }, [error, router])
  
  if (error) {
    return null
  }

  // Loading state
  if (loading || !course) {
    return (
      <div className="min-h-screen bg-white-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin khóa học...</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-sm text-gray-500">
              <p>Course ID: {params?.id}</p>
              <p>Loading: {loading?.toString()}</p>
              <p>Course: {course ? 'Loaded' : 'Not loaded'}</p>
            </div>
          )}
        </div>
      </div>
    )
  }


  // MAIN RENDER
  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#000044] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 fade-in-element">
              {course.category && (
                <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  {course.category}
                </span>
              )}

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

              <p className="text-white-300 text-lg mb-6">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">
                    {reviewStats.average > 0 ? parseFloat(reviewStats.average).toFixed(1) : "0.0"}
                  </span>
                  <span className="text-white-400">({reviewStats.total || 0} lượt đánh giá)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span className="font-semibold">{studentsCount}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span className="font-semibold">{course.duration ?? "—"}</span>
                </div>
              </div>

              {/* Instructor */}
              {course.instructor && (
                <div className="flex items-center gap-4 bg-navy-light p-4 rounded-lg">
                  <div className="w-16 h-16 bg-white-600 rounded-full overflow-hidden">
                    <img
                      src={course.instructor.avatar || "/placeholder-user.jpg"}
                      alt="Instructor"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Giảng viên: {course.instructor?.fullName || course.instructor?.name || "Giảng viên"}</p>
                    <p className="text-white-400 text-sm">
                      {course.instructor?.bio || "Chuyên gia trong lĩnh vực lập trình"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Card - Price */}
            <div className="lg:col-span-1 fade-in-element">
              <div className="bg-white text-white-900 rounded-xl p-6 sticky top-24">
                <div
                  className="relative mb-6 rounded-lg overflow-hidden course-preview-image cursor-pointer group"
                  onClick={() => {
                    setShowImageModal(true)
                    setImageZoom(100)
                  }}
                >
                  <img
                    src={course.image || course.thumbnailUrl || "/placeholder-course.jpg"}
                    alt="Course preview"
                    className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      if (!e.target.src.includes("/placeholder")) {
                        e.target.src = "/placeholder-course.jpg"
                      }
                    }}
                  />
                  {/* Overlay icon */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                      <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>

               

                <div className="text-center mb-2">
                  {/* 🔹 Thêm dòng title nằm trên giá */}
                  <div className="text-4xl font-sans-serif text-gray-800 mb-3 uppercase">
                    {course.title}
                  </div>

                  <div className="text-4xl font-bold text-green-600 mb-">
                    {course.price ?? course.priceFormatted ?? "0đ"}
                  </div>

                  {course.oldPrice && course.oldPrice !== course.price && (
                    <div className="text-gray-400 line-through text-lg">{/*course.oldPrice*/}</div>
                  )}
                </div>

                {isEnrolled ? (
                  // ✅ Nếu đã mua khóa học, chỉ hiển thị 1 nút "Bạn đã mua khóa học này"
                  <button
                    onClick={() => router.push(`/bai-hoc/${course.id}`)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold text-lg mb-4 hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-lg hover:scale-105 active:scale-95"
                  >
                     Bạn đã mua khóa học này vào xem
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleBuyNow}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-bold text-lg mb-4 hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-lg hover:scale-105 active:scale-95 buy-now-btn"
                    >
                      Mua khóa học
                    </button>

                    <button
                      onClick={handleAddToCart}
                      disabled={isInCart && isInCart(course?.id)}
                      className={`w-full py-4 rounded-lg font-bold text-lg mb-4 transition-all hover:shadow-lg hover:scale-105 active:scale-95 ${
                        (isInCart && isInCart(course?.id))
                          ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                      }`}
                    >
                      {(isInCart && isInCart(course?.id)) ? "Đã có trong giỏ hàng" : "Thêm vào giỏ hàng"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation & Content */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT CONTENT */}
            <div className="lg:col-span-2">
              <div className="flex bg-gray-100 rounded-xl overflow-hidden mb-6">
                {[
                  { id: "overview", label: "Tổng quan" },
                  { id: "content", label: "Nội dung" },
                  { id: "instructor", label: "Giảng viên" },
                  { id: "reviews", label: "Đánh giá" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 py-3 text-center font-semibold transition-all ${
                      activeTab === tab.id
                        ? "bg-purple-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                {activeTab === "overview" && <TongQuan course={course} />}
                {activeTab === "content" && <NoiDung courseId={course.id} />}
                {activeTab === "instructor" && <KhGiangVien course={course} />}
                {activeTab === "reviews" && (
                  <div>
                    {/* If you have a DAnhGia component that handles UI, use it */}
                    {typeof DanhGia === "function" ? (
                      <DanhGia key={course.id} courseId={course.id} />
                    ) : (
                      <>
                        <h3 className="text-xl font-semibold mb-4">Đánh giá</h3>
                        {reviewsLoading ? (
                          <p>Đang tải đánh giá...</p>
                        ) : (
                          <div className="space-y-4">
                            {reviews.length === 0 ? (
                              <p>Chưa có đánh giá cho khóa học này.</p>
                            ) : (
                              reviews.map(r => (
                                <div key={r.id} className="border p-4 rounded">
                                  <div className="flex items-center gap-3 mb-2">
                                    <img src={r.user.avatar} alt={r.user.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                      <div className="font-semibold">{r.user.name}</div>
                                      <div className="text-sm text-gray-500">{r.date}</div>
                                    </div>
                                  </div>
                                  <div className="text-yellow-500 mb-2">{'⭐'.repeat(r.rating)}</div>
                                  <div className="text-gray-700">{r.content}</div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Submit review form */}
                        <form onSubmit={handleSubmitReview} className="mt-6">
                          <h4 className="font-semibold mb-2">Gửi đánh giá của bạn</h4>

                          <div className="flex items-center gap-2 mb-3">
                            {[1,2,3,4,5].map(n => (
                              <button
                                type="button"
                                key={n}
                                onMouseEnter={() => setHoveredStar(n)}
                                onMouseLeave={() => setHoveredStar(0)}
                                onClick={() => setRating(n)}
                                className={`text-2xl ${ (hoveredStar >= n || rating >= n) ? "text-yellow-400" : "text-gray-300" }`}
                              >
                                ⭐
                              </button>
                            ))}
                            <div className="ml-3 text-sm text-gray-500">{rating ? `${rating} sao` : "Chọn số sao"}</div>
                          </div>

                          <textarea
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            rows={4}
                            className="w-full p-3 border rounded mb-3"
                            placeholder="Viết đánh giá của bạn (tối thiểu 10 ký tự)"
                          />

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={submittingReview}
                              className="px-6 py-3 bg-purple-600 text-white rounded disabled:opacity-60"
                            >
                              {submittingReview ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRating(0)
                                setReviewContent("")
                              }}
                              className="px-6 py-3 bg-gray-200 rounded"
                            >
                              Hủy
                            </button>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="lg:col-span-1">
              <div className="bg-white border rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Thông tin khóa học</h3>
                <div className="space-y-3 text-gray-600">
                  <p><strong className="text-gray-800">Cấp độ:</strong> {course.level || "Trung cấp"}</p>
                  <p><strong className="text-gray-800">Thời lượng:</strong> {course.duration || "—"}</p>
                  <p><strong className="text-gray-800">Ngôn ngữ:</strong> {course.language || "React"}</p>
                  
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Image Fullscreen Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Zoom controls */}
            <div className="absolute top-4 left-4 flex items-center gap-4 bg-black/50 rounded-lg p-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setImageZoom(prev => Math.max(50, prev - 25))
                }}
                className="text-white hover:text-gray-300 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-white text-sm font-medium min-w-[60px] text-center">{imageZoom}%</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setImageZoom(prev => Math.min(300, prev + 25))
                }}
                className="text-white hover:text-gray-300 transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setImageZoom(100)
                }}
                className="text-white hover:text-gray-300 transition-colors p-2 text-sm"
              >
                Reset
              </button>
            </div>

            {/* Image */}
            <img
              src={course.image || course.thumbnailUrl || "/placeholder-course.jpg"}
              alt="Course preview fullscreen"
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{ transform: `scale(${imageZoom / 100})` }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                if (!e.target.src.includes("/placeholder")) {
                  e.target.src = "/placeholder-course.jpg"
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
