"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth-modal"
import { getCourseById, formatCourseData, getReviewsByCourse, createReview } from "@/lib/api"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import TongQuan from "@/components/courseid/tongquan"
import NoiDung from "@/components/courseid/noidung"
import KhGiangVien from "@/components/courseid/khgiangvien"
import DanhGia from "@/components/courseid/danhgia"
import { addToCartAPI } from "@/lib/api"


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
const [reviewStats, setReviewStats] = useState({
  average: 0,
  total: 0,
  stars: [0, 0, 0, 0, 0],
})

  const [error, setError] = useState(null)

  const handleSubmitReview = async (e) => {
  e.preventDefault();

  if (!reviewContent.trim()) {
    alert("Vui lòng nhập nội dung đánh giá!");
    return;
  }

  if (!rating || rating < 1 || rating > 5) {
    alert("Vui lòng chọn số sao từ 1 đến 5!");
    return;
  }

  if (reviewContent.trim().length < 10) {
    alert("Nội dung đánh giá ít nhất 10 ký tự!");
    return;
  }

  try {
    setSubmittingReview(true);

    // ✅ body gửi lên (PascalCase cho .NET)
    const reviewData = {
      CourseId: parseInt(course.id),
      UserId: user?.userId || 1,
      Rating: rating,
      Comment: reviewContent.trim(),
    };

    console.log("Body gửi lên:", reviewData);

    const res = await fetch("https://localhost:7025/api/Reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reviewData),
    });

    const text = await res.text(); // debug
    console.log("Response raw:", text);

    if (!res.ok) {
      throw new Error(`Lỗi ${res.status}: ${text}`);
    }

    alert("✅ Đánh giá đã được gửi thành công!");
    setReviewContent("");
    setRating(0);
  } catch (err) {
    console.error("❌ Lỗi khi gửi đánh giá:", err);
    alert("Gửi đánh giá thất bại, vui lòng thử lại!");
  } finally {
    setSubmittingReview(false);
  }
};


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
    let isMounted = true
    
    const fetchCourseData = async () => {
      if (!params.id) {
        if (isMounted) {
          setError('Course ID is missing')
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        setError(null)
        const courseId = params.id
        
        console.log('Fetching course with ID:', courseId)
        
        // Fetch course details using the API service
        const courseData = await getCourseById(courseId)
        
        console.log('Course data received:', courseData)
        
        if (!isMounted) return
        
        if (!courseData) {
          setError(`Khóa học với ID ${courseId} không tồn tại.`)
          setLoading(false)
          return
        }

        // Format course data to match UI expectations
        const formattedCourse = formatCourseData(courseData)
        console.log('Formatted course:', formattedCourse)
        
        if (!formattedCourse) {
          setError('Không thể xử lý dữ liệu khóa học. Dữ liệu không hợp lệ.')
          setLoading(false)
          return
        }
        
        setCourse(formattedCourse)
        setLoading(false) // Set loading false ngay khi có data để hiển thị ngay
        
        // Load reviews for this course (không block UI)
        loadReviews().catch(err => console.error('Error loading reviews:', err))
        
      } catch (error) {
        console.error('Error fetching course:', error)
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        })
        if (isMounted) {
          setError(error.message || 'Không thể tải thông tin khóa học')
          setLoading(false)
        }
      }
    }

    fetchCourseData()
    
    return () => {
      isMounted = false
    }
  }, [params.id])

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
      // Add course to cart via API before redirecting to payment
      const cartItem = {
        id: course.id,
        title: course.title || "Khóa học",
        instructor: course.instructor?.name || "Giảng viên",
        price: parseFloat(String(course.price || course.priceValue || 0).replace(/[^\d]/g, '')),
        image: course.image || course.thumbnailUrl || "/placeholder-course.jpg"
      }
      
      // Add to cart using the cart context which will call the API
      await addToCart(cartItem)
      
      // Redirect to payment page with course ID for immediate purchase
      router.push(`/thanhtoan?courseId=${course.id}&buyNow=true`)
    } catch (error) {
      console.error("Error adding course to cart:", error)
      alert("Có lỗi xảy ra khi thêm khóa học vào giỏ hàng. Vui lòng thử lại!")
    }
  }


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
      // Sử dụng addToCartAPI helper - tự động tạo cart nếu chưa có
      const cartData = {
        userId: user.userId || user.id,
        courseId: course.id,
        quantity: 1
      }
      
      const result = await addToCartAPI(cartData)
      console.log("✅ Đã thêm vào giỏ hàng:", result)
      
      // Cập nhật cart context
      const cartItem = {
        id: course.id,
        title: course.title || "Khóa học",
        instructor: course.instructor?.name || "Giảng viên",
        price: parseFloat(String(course.price || course.priceValue || 0).replace(/[^\d]/g, '')),
        image: course.image || course.thumbnailUrl || "/placeholder-course.jpg"
      }
      addToCart(cartItem)
      
      alert("Đã thêm vào giỏ hàng thành công!")
    } catch (error) {
      console.error("❌ Lỗi khi thêm vào giỏ hàng:", error)
      alert("Không thể thêm vào giỏ hàng. Vui lòng thử lại!")
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
  if (loading) {
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

  // Nếu không loading nhưng không có course, hiển thị error
  if (!loading && !course && !error) {
    return (
      <div className="min-h-screen bg-white-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h1>
            <p className="text-gray-600 mb-6">Khóa học với ID {params.id} không tồn tại hoặc không thể tải được.</p>
            <button
              onClick={() => router.push('/courses')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Quay lại danh sách khóa học
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Đảm bảo course tồn tại trước khi render
  if (!course) {
    return null
  }

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#000044] text-white py-16 relative z-0">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 relative">
            {/* Left Content */}
            <div className="lg:col-span-2 fade-in-element">
              {course.category && (
                <span className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                  {course.category}
                </span>
              )}

              <h1 className="text-4xl font-bold mb-4">{course.title || "Khóa học"}</h1>

              {course.description && (
                <p className="text-white-300 text-lg mb-6">
                  {course.description}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-semibold">{course.rating || "4.5"}</span>
                  <span className="text-white-400">({course.reviews || 0} lượt đánh giá)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span>
                  <span className="font-semibold">{course.students || "0k"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⏱️</span>
                  <span className="font-semibold">{course.duration || "20 giờ"}</span>
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
                      onError={(e) => {
                        e.target.src = "/placeholder-user.jpg"
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Giảng viên: {course.instructor.name || "Chưa có giảng viên"}</p>
                    {course.instructor.bio && (
                      <p className="text-white-400 text-sm">
                        {course.instructor.bio}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Card - Price */}
            <div className="lg:col-span-1 fade-in-element relative z-20">
              <div className="bg-white text-gray-900 rounded-xl shadow-2xl p-6 sticky top-24 z-20 overflow-visible">
                <div
                  className="relative mb-6 rounded-lg overflow-hidden course-preview-image"
                  onMouseEnter={(e) => {
                    const img = e.currentTarget.querySelector("img")
                    if (img) img.style.transform = "scale(1.1)"
                  }}
                  onMouseLeave={(e) => {
                    const img = e.currentTarget.querySelector("img")
                    if (img) img.style.transform = "scale(1)"
                  }}
                >
                  <img
                    src={course.image || course.thumbnailUrl || "/placeholder-course.jpg"}
                    alt="Course preview"
                    className="w-full h-48 object-cover transition-transform duration-500"
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      e.target.src = "/placeholder.jpg"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <span className="text-3xl text-purple-600">▶</span>
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4 text-center">{course.title || "Khóa học"}</h3>

                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">{course.price || "0đ"}</div>
                  {course.oldPrice && (
                    <div className="text-gray-400 line-through text-lg">{course.oldPrice}</div>
                  )}
                  {course.discount && course.discount !== "0" && (
                    <div className="text-red-500 font-semibold mt-1">Giảm {course.discount}%</div>
                  )}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-lg hover:scale-105 active:scale-95 buy-now-btn"
                  >
                    Mua khóa học
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={isInCart(course.id)}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all hover:shadow-lg hover:scale-105 active:scale-95 ${
                      isInCart(course.id)
                        ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800"
                    }`}
                  >
                    {isInCart(course.id) ? "Đã có trong giỏ hàng" : "Thêm vào giỏ hàng"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
{/* Tab Navigation */}

      {/* Course Content */}
      
      <section className="py-12 bg-gray-50">
  <div className="container mx-auto px-4">
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT CONTENT */}
      <div className="lg:col-span-5">
        {/* Tabs */}
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

        {/* Tab content */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          {activeTab === "overview" && course && <TongQuan course={course} />}
          {activeTab === "content" && course.id && <NoiDung courseId={course.id} />}
          {activeTab === "instructor" && course && <KhGiangVien course={course} />}
          {activeTab === "reviews" && course.id && (
            <DanhGia key={course.id} courseId={course.id} />
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      

    </div>
  </div>
</section>

      <Footer />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  )
  
}
