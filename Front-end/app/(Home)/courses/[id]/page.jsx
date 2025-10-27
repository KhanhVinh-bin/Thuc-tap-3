"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { getCourseById, formatCourseData, getReviewsByCourse, createReview } from "@/lib/api"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart, isInCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false) 
  const [activeTab, setActiveTab] = useState("overview")
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [reviewContent, setReviewContent] = useState("")
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewStats, setReviewStats] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    // Kiểm tra validation
    if (rating === 0) {
      alert("Vui lòng chọn số sao đánh giá!")
      return
    }
    
    if (!reviewContent.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!")
      return
    }

    // Enhanced validation
    if (!rating || rating < 1 || rating > 5) {
      alert("Vui lòng chọn số sao từ 1 đến 5!")
      return
    }
    
    if (!reviewContent.trim() || reviewContent.trim().length < 10) {
      alert("Vui lòng nhập nội dung đánh giá ít nhất 10 ký tự!")
      return
    }

    try {
      setSubmittingReview(true)
      
      // Sử dụng user ID từ auth context
      const reviewData = {
        courseId: parseInt(course.id),
        userId: user?.id || 1, // Sử dụng user ID từ auth context, fallback về 1 nếu chưa đăng nhập
        rating: rating,
        comment: reviewContent.trim()
      }
      
      // Gửi đánh giá lên server
      const result = await createReview(reviewData)
      
      // Hiển thị thông báo thành công
      alert("Đánh giá của bạn đã được gửi thành công!")
      
      // Reset form after successful submission
      setRating(0)
      setReviewContent("")
      setHoveredStar(0)
      
      // Tải lại danh sách reviews để hiển thị review mới
      await loadReviews()
      
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!")
    } finally {
      setSubmittingReview(false)
    }
  }

  // Hàm tải reviews từ API
  const loadReviews = async () => {
    try {
      setReviewsLoading(true)
      const courseId = params.id
      
      // Gọi API để lấy reviews của khóa học
      const reviewsData = await getReviewsByCourse(courseId)
      
      if (reviewsData) {
        // Format reviews data để phù hợp với UI
        const formattedReviews = reviewsData.reviews.map(review => ({
          id: review.reviewId,
          user: {
            name: review.user.fullName || 'Người dùng',
            avatar: review.user.avatarUrl || '/placeholder-user.jpg'
          },
          rating: review.rating,
          content: review.comment,
          date: new Date(review.createdAt).toLocaleDateString('vi-VN')
        }))
        
        setReviews(formattedReviews)
        setReviewStats(reviewsData.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setReviewsLoading(false)
    }
  }

  // Fetch course data and reviews on component mount
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        setError(null)
        const courseId = params.id
        
        console.log('Fetching course with ID:', courseId)
        
        // Validate course ID
        if (!courseId) {
          throw new Error('Course ID is missing')
        }
        
        // Test API connectivity first
        try {
          const testResponse = await fetch('https://localhost:7025/api/Courses')
          console.log('API connectivity test:', testResponse.status)
        } catch (apiError) {
          console.error('API connectivity failed:', apiError)
          throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra xem backend có đang chạy không.')
        }
        
        // Fetch course details using the API service
        const courseData = await getCourseById(courseId)
        console.log('Course data received:', courseData)
        
        if (courseData) {
          // Format course data to match UI expectations
          const formattedCourse = formatCourseData(courseData)
          console.log('Formatted course:', formattedCourse)
          setCourse(formattedCourse)
        } else {
          // Try to get all courses to see if any exist
          try {
            const { getAllCourses } = await import('@/lib/api')
            const allCourses = await getAllCourses()
            console.log('Available courses:', allCourses?.length || 0)
            if (allCourses && allCourses.length > 0) {
              throw new Error(`Khóa học với ID ${courseId} không tồn tại. Có ${allCourses.length} khóa học khả dụng.`)
            } else {
              throw new Error('Không có khóa học nào trong hệ thống.')
            }
          } catch (listError) {
            console.error('Error checking course list:', listError)
            throw new Error('Khóa học không tồn tại hoặc đã bị xóa.')
          }
        }
        
        // Load reviews for this course
        await loadReviews()
        
      } catch (error) {
        console.error('Error fetching course:', error)
        setError(error.message || 'Không thể tải thông tin khóa học')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchCourseData()
    }
    
    // Fade in animation on load
    setTimeout(() => {
      const elements = document.querySelectorAll(".fade-in-element")
      elements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("visible")
        }, index * 100)
      })
    }, 100)
  }, [params.id])

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      const redirectUrl = `/thanhtoan?courseId=${course.id}`
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
    } else {
      router.push(`/thanhtoan?courseId=${course.id}`)
    }
  }


  const handleAddToCart = () => {
    if (course) {
      const cartItem = {
        id: course.id,
        title: course.title,
        instructor: course.instructor.name,
        price: parseFloat(course.price.replace(/[^\d]/g, '')), // Convert price string to number
        image: course.image
      }
      addToCart(cartItem)
      
      // Show success message or redirect to cart
      alert("Đã thêm khóa học vào giỏ hàng!")
    }
  }

  // Hiển thị error nếu có lỗi
  if (error) {
    return (
      <div className="min-h-screen bg-white-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải khóa học</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={async () => {
                  try {
                    const { getAllCourses } = await import('@/lib/api')
                    const courses = await getAllCourses()
                    alert(`Tìm thấy ${courses?.length || 0} khóa học trong hệ thống`)
                  } catch (e) {
                    alert('Lỗi kết nối API: ' + e.message)
                  }
                }}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test API
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Quay lại danh sách khóa học
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Hiển thị loading khi đang tải dữ liệu
  if (loading || !course) {
    return (
      <div className="min-h-screen bg-white-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin khóa học...</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-sm text-gray-500">
              <p>Course ID: {params.id}</p>
              <p>Loading: {loading.toString()}</p>
              <p>Course: {course ? 'Loaded' : 'Not loaded'}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#6A5BF6] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Content */}
            <div className="lg:col-span-2 fade-in-element">
              <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                {course.category}
              </span>

              <h1 className="text-4xl font-bold mb-4">{course.title}</h1>

              <p className="text-white-300 text-lg mb-6">
                {course.description}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-white-400">({course.reviews} lượt đánh giá)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span className="font-semibold">{course.students}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span className="font-semibold">{course.duration}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-4 bg-navy-light p-4 rounded-lg">
                <div className="w-16 h-16 bg-white-600 rounded-full overflow-hidden">
                  <img src={course.instructor.avatar} alt="Instructor" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Giảng viên: {course.instructor.name}</p>
                  <p className="text-white-400 text-sm">
                    {course.instructor.bio}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Card - Price */}
            <div className="lg:col-span-1 fade-in-element">
              <div className="bg-white text-white-900 rounded-xl shadow-2xl p-6 sticky top-24">
                <div
                  className="relative mb-6 rounded-lg overflow-hidden course-preview-image"
                  onMouseEnter={(e) => {
                    e.currentTarget.querySelector("img").style.transform = "scale(1.1)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.querySelector("img").style.transform = "scale(1)"
                  }}
                >
                  <img
                    src={course.image}
                    alt="Course preview"
                    className="w-full h-48 object-cover transition-transform duration-500"
                    onLoad={() => setImageLoaded(true)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <span className="text-3xl text-purple-600">▶</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-center">{course.title}</h3>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">{course.price}</div>
                  <div className="text-white-400 line-through text-lg">{course.oldPrice}</div>
                  <div className="text-red-500 font-semibold mt-1">Giảm {course.discount}%</div>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-bold text-lg mb-4 hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-lg hover:scale-105 active:scale-95 buy-now-btn"
                >
                  Mua khóa học
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={isInCart(course?.id)}
                  className={`w-full py-4 rounded-lg font-bold text-lg mb-4 transition-all hover:shadow-lg hover:scale-105 active:scale-95 ${
                    isInCart(course?.id)
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                  }`}
                >
                  {isInCart(course?.id) ? "Đã có trong giỏ hàng" : "Thêm vào giỏ hàng"}
                </button>

                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-300 mb-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-6 py-3 font-semibold ${
                  activeTab === "overview"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-purple-600 transition-colors"
                }`}
              >
                Tổng quan
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`px-6 py-3 font-semibold ${
                  activeTab === "content"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-purple-600 transition-colors"
                }`}
              >
                Nội dung
              </button>
              <button
                onClick={() => setActiveTab("instructor")}
                className={`px-6 py-3 font-semibold ${
                  activeTab === "instructor"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-purple-600 transition-colors"
                }`}
              >
                Giảng viên
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`px-6 py-3 font-semibold ${
                  activeTab === "reviews"
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-purple-600 transition-colors"
                }`}
              >
                Đánh giá
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* Course Description */}
                <div className="bg-white rounded-xl shadow-md p-8 fade-in-element">
                  <h2 className="text-2xl font-bold mb-6">Mô tả khóa học</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {course?.description || 'Khóa học này sẽ cung cấp cho bạn những kiến thức cơ bản và nâng cao cần thiết để thành công trong lĩnh vực này.'}
                    </p>
                  </div>
                </div>

                {/* What You'll Learn */}
                <div className="bg-white rounded-xl shadow-md p-8 fade-in-element">
                  <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Nắm vững kiến thức cơ bản</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Thực hành với dự án thực tế</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Phát triển kỹ năng chuyên môn</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl">✓</span>
                      <span className="text-gray-700">Chuẩn bị cho công việc thực tế</span>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-xl shadow-md p-8 fade-in-element">
                  <h2 className="text-2xl font-bold mb-6">Yêu cầu</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700">Kiến thức cơ bản về máy tính</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700">Đam mê học hỏi và khám phá</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-700">Máy tính có kết nối internet</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-8" style={{color: '#000'}}>
                {/* User Review Form */}
                <div className="bg-white rounded-xl shadow-md p-8" style={{color: '#000'}}>
                  {isAuthenticated ? (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 text-gray-900" style={{color: '#111827'}}>Đánh giá của bạn</h2>
                      <form onSubmit={handleSubmitReview} className="space-y-6">
                        {/* Rating Stars */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2" style={{color: '#374151'}}>
                            Đánh giá của bạn
                          </label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                className="text-2xl focus:outline-none text-yellow-400 hover:text-yellow-500"
                              >
                                {star <= (hoveredStar || rating) ? "★" : "☆"}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Review Content */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2" style={{color: '#374151'}}>
                            Nội dung đánh giá
                          </label>
                          <textarea
                            value={reviewContent}
                            onChange={(e) => setReviewContent(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                          />
                        </div>

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className={`px-6 py-3 rounded-lg transition-colors ${
                            submittingReview 
                              ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                              : "bg-purple-600 text-white hover:bg-purple-700"
                          }`}
                        >
                          {submittingReview ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Đang gửi...
                            </div>
                          ) : (
                            "Gửi đánh giá"
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <h2 className="text-xl font-semibold mb-4 text-gray-900" style={{color: '#111827'}}>Đăng nhập để đánh giá khóa học</h2>
                      <p className="text-gray-600 mb-6" style={{color: '#4b5563'}}>Bạn cần đăng nhập để có thể đánh giá khóa học này</p>
                      <button
                        onClick={() => router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Đăng nhập ngay
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className="bg-white rounded-xl shadow-md p-8 fade-in-element">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Đánh giá từ học viên ({reviewsLoading ? '...' : reviews.length})
                  </h2>
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                        <p className="text-gray-500 mt-2">Đang tải đánh giá...</p>
                      </div>
                    ) : reviews && reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div 
                          key={review.id} 
                          className={`border-b border-gray-200 pb-6 last:border-b-0 last:pb-0 ${
                            review.isNew ? 'bg-green-50 border-green-200 rounded-lg p-4 mb-4' : ''
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            {/* User Avatar */}
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                              <img 
                                src={review.user.avatar} 
                                alt={review.user.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = '<div class="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm font-bold">' + review.user.name.charAt(0) + '</div>';
                                }}
                              />
                            </div>
                            
                            {/* Review Content */}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-gray-900">{review.user.name}</h4>
                                  {review.isNew && (
                                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                      Mới
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                              
                              {/* Rating Stars */}
                              <div className="flex items-center gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={`text-lg ${
                                      star <= review.rating ? "text-yellow-400" : "text-gray-300"
                                    }`}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                              </div>
                              
                              {/* Review Text */}
                              <p className="text-gray-700 leading-relaxed">{review.content}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Chưa có đánh giá nào cho khóa học này.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div>
                {/* Course Description */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-8 fade-in-element">
                  <h2 className="text-2xl font-bold mb-6">Mô tả khóa học</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {course?.description || 'Khóa học này sẽ cung cấp cho bạn những kiến thức cơ bản và nâng cao trong lĩnh vực lập trình.'}
                    </p>
                  </div>
                </div>

                {/* What you'll learn */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-8 fade-in-element">
                  <h2 className="text-2xl font-bold mb-6">Bạn sẽ học được gì?</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-700">Nắm vững các khái niệm cơ bản và nâng cao</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-700">Thực hành với các dự án thực tế</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-700">Phát triển kỹ năng giải quyết vấn đề</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
                      <span className="text-gray-700">Chuẩn bị cho các dự án chuyên nghiệp</span>
                    </div>
                  </div>
                </div>

                {/* Course Info */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-8 fade-in-element">
                  <h2 className="text-2xl font-bold mb-6">Thông tin khóa học</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cấp độ</h3>
                      <p className="text-gray-700">{course?.level}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Ngôn ngữ</h3>
                      <p className="text-gray-700">{course?.language}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Thời lượng</h3>
                      <p className="text-gray-700">{course?.duration}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Danh mục</h3>
                      <p className="text-gray-700">{course?.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab */}
            {activeTab === "content" && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 fade-in-element">
                <h2 className="text-2xl font-bold mb-6">Nội dung khóa học</h2>
                <div className="space-y-4">
                  {/* Course Curriculum - Demo content */}
                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Chương 1: Giới thiệu</h3>
                      <p className="text-sm text-gray-600">3 bài học • 45 phút</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">▶</span>
                          <span className="text-gray-700">Bài 1: Tổng quan về khóa học</span>
                        </div>
                        <span className="text-sm text-gray-500">15 phút</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">▶</span>
                          <span className="text-gray-700">Bài 2: Cài đặt môi trường</span>
                        </div>
                        <span className="text-sm text-gray-500">20 phút</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">📄</span>
                          <span className="text-gray-700">Bài 3: Tài liệu tham khảo</span>
                        </div>
                        <span className="text-sm text-gray-500">10 phút</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Chương 2: Kiến thức cơ bản</h3>
                      <p className="text-sm text-gray-600">5 bài học • 1 giờ 30 phút</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">▶</span>
                          <span className="text-gray-700">Bài 1: Khái niệm cơ bản</span>
                        </div>
                        <span className="text-sm text-gray-500">25 phút</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">▶</span>
                          <span className="text-gray-700">Bài 2: Thực hành đầu tiên</span>
                        </div>
                        <span className="text-sm text-gray-500">30 phút</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">🎯</span>
                          <span className="text-gray-700">Bài 3: Bài tập thực hành</span>
                        </div>
                        <span className="text-sm text-gray-500">35 phút</span>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                      <h3 className="font-semibold text-gray-900">Chương 3: Nâng cao</h3>
                      <p className="text-sm text-gray-600">4 bài học • 2 giờ</p>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">▶</span>
                          <span className="text-gray-700">Bài 1: Kỹ thuật nâng cao</span>
                        </div>
                        <span className="text-sm text-gray-500">40 phút</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-purple-600">🎯</span>
                          <span className="text-gray-700">Bài 2: Dự án thực tế</span>
                        </div>
                        <span className="text-sm text-gray-500">1 giờ 20 phút</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Instructor Tab */}
            {activeTab === "instructor" && (
              <div className="bg-white rounded-xl shadow-md p-8 mb-8 fade-in-element">
                <h2 className="text-2xl font-bold mb-6">Thông tin giảng viên</h2>
                <div className="flex items-start gap-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
                    <img src={course?.instructor?.avatar || '/placeholder-user.jpg'} alt={course?.instructor?.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{course?.instructor?.name}</h3>
                    <p className="text-gray-600 mb-4">{course?.instructor?.bio}</p>
                    
                    {/* Instructor Stats */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Kinh nghiệm</h4>
                        <p className="text-gray-700">{course?.instructor?.experience || 5} năm</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Đánh giá</h4>
                        <p className="text-gray-700">⭐ {course?.instructor?.rating}/5</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Học viên</h4>
                        <p className="text-gray-700">{course?.instructor?.totalStudents || '1,000+'}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Khóa học</h4>
                        <p className="text-gray-700">{course?.instructor?.totalCourses || 10}</p>
                      </div>
                    </div>

                    {/* Instructor Bio */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Giới thiệu</h4>
                      <p className="text-gray-700 leading-relaxed">
                        {course?.instructor?.bio || 'Giảng viên có nhiều năm kinh nghiệm trong lĩnh vực giảng dạy và phát triển phần mềm. Với phong cách giảng dạy dễ hiểu và thực tế, giảng viên đã giúp hàng nghìn học viên nắm vững kiến thức và phát triển sự nghiệp trong ngành công nghệ thông tin.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            
          </div>
        </div>
      </section>

      <Footer />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
  
}


