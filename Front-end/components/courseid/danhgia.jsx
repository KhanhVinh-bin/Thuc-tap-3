"use client"
import { useState, useEffect } from "react"
import { getReviewsByCourse, createReview } from "@/lib/api"
import { getEnrollmentsByUser } from "@/lib/enrollmentApi"
import { useAuth } from "@/lib/auth-context"
import { useParams, useRouter } from "next/navigation"

export default function CourseReviews() {
  const { isAuthenticated, user } = useAuth()
  const params = useParams()
  const router = useRouter()

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)

  useEffect(() => {
    loadReviews()
    if (isAuthenticated && user) {
      checkEnrollment()
    }
  }, [params.id, isAuthenticated, user])

  const checkEnrollment = async () => {
    if (!user || !params.id) return

    try {
      setCheckingEnrollment(true)
      const userId = user.userId || user.id || user.UserId || user.ID
      if (!userId) {
        setIsEnrolled(false)
        return
      }

      const enrollments = await getEnrollmentsByUser(userId)
      const courseId = parseInt(params.id)
      
      // Kiểm tra xem user có enrolled vào khóa học này không
      const enrolled = enrollments.some(
        (enrollment) => 
          enrollment.courseId === courseId || 
          enrollment.CourseId === courseId
      )
      
      setIsEnrolled(enrolled)
    } catch (error) {
      console.error("Error checking enrollment:", error)
      setIsEnrolled(false)
    } finally {
      setCheckingEnrollment(false)
    }
  }

  const loadReviews = async () => {
    try {
      setLoading(true)
      
      // Gọi API trực tiếp để lấy reviews
      const response = await fetch(`https://localhost:7025/api/Reviews/ByCourse/${params.id}`)
      
      if (!response.ok) {
        throw new Error('Không thể tải đánh giá')
      }
      
      const data = await response.json()
      
      if (data && data.reviews) {
        // Format reviews data để phù hợp với UI
        const formattedReviews = data.reviews.map(review => ({
          reviewId: review.reviewId,
          user: {
            fullName: review.user.fullName || 'Người dùng',
            avatar: review.user.avatarUrl || '/placeholder-user.jpg'
          },
          rating: review.rating,
          comment: review.comment,
          createdAt: new Date(review.createdAt).toLocaleDateString('vi-VN')
        }))
        setReviews(formattedReviews)
        
        // Lưu thông tin thống kê đánh giá
        
      } else {
        setReviews([])
      }
    } catch (err) {
      console.error('Error loading reviews:', err)
      setReviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("User hiện tại:", user);

    if (!isAuthenticated || !user) {
      alert("Vui lòng đăng nhập để đánh giá!");
      router.push(`/login?redirect=/courses/${params.id}`);
      return;
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      alert("Vui lòng chọn số sao từ 1 đến 5!");
      return;
    }

    if (!content.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    if (content.trim().length < 10) {
      alert("Nội dung đánh giá phải có ít nhất 10 ký tự!");
      return;
    }

    // Kiểm tra enrollment trước khi submit
    if (!isEnrolled) {
      alert("Bạn cần ghi danh vào khóa học này trước khi có thể đánh giá. Vui lòng mua khóa học để tiếp tục.");
      return;
    }

    // Extract userId from different possible user object structures
    let userId = null;
    
    // Try different possible field names for userId
    if (user.UserId) {
      userId = parseInt(user.UserId);
    } else if (user.userId) {
      userId = parseInt(user.userId);
    } else if (user.id) {
      userId = parseInt(user.id);
    } else if (user.ID) {
      userId = parseInt(user.ID);
    }
    
    if (!userId || isNaN(userId)) {
      alert("Không tìm thấy ID người dùng, vui lòng đăng nhập lại!");
      return;
    }

    try {
      setSubmitting(true);

      const reviewData = {
        CourseId: parseInt(params.id),
        UserId: userId,
        Rating: parseInt(rating),
        Comment: content.trim()
      };

      const response = await fetch("https://localhost:7025/api/Reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });

      const resText = await response.text();

      if (response.ok) {
        alert("✅ Đánh giá đã được gửi thành công!");
        setRating(0);
        setContent("");
        // Reload reviews to show the new one
        await loadReviews();
      } else {
        // Parse error message từ JSON response
        let errorMessage = "Không thể gửi đánh giá";
        try {
          const errorData = JSON.parse(resText);
          errorMessage = errorData.message || errorData.Message || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, dùng text nguyên
          errorMessage = resText || `HTTP ${response.status}`;
        }

        // Hiển thị thông báo lỗi cụ thể
        if (errorMessage.includes("not enrolled") || errorMessage.includes("chưa ghi danh")) {
          alert("Bạn cần ghi danh vào khóa học này trước khi có thể đánh giá. Vui lòng mua khóa học để tiếp tục.");
        } else {
          alert("Gửi đánh giá thất bại: " + errorMessage);
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi đánh giá:", error);
      alert("Gửi đánh giá thất bại. Vui lòng thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

   



  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Form đánh giá */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Viết đánh giá của bạn</h2>

        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đánh giá</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating 
                        ? "text-yellow-400 fill-current" 
                        : "text-gray-300 stroke-2 stroke-gray-300 fill-none"
                    } transition-colors`}
                  >
                    <svg 
                      className="w-full h-full" 
                      viewBox="0 0 24 24"
                      fill={star <= rating ? "currentColor" : "none"}
                      stroke={star <= rating ? "none" : "currentColor"}
                      strokeWidth="2"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nội dung đánh giá
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows="6"
                placeholder="Chia sẻ về trải nghiệm của bạn về khóa học này..."
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">
                  {content.length}/500 ký tự
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !rating || !content.trim() || checkingEnrollment || !isEnrolled}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  submitting || !rating || !content.trim() || checkingEnrollment || !isEnrolled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {checkingEnrollment 
                  ? "Đang kiểm tra..." 
                  : submitting 
                  ? "Đang gửi..." 
                  : !isEnrolled 
                  ? "Cần ghi danh để đánh giá"
                  : "Gửi đánh giá"}
              </button>
            </div>
            {!checkingEnrollment && !isEnrolled && isAuthenticated && (
              <p className="text-sm text-red-600 mt-2">
                Bạn cần ghi danh vào khóa học này trước khi có thể đánh giá.
              </p>
            )}
          </form>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-700 mb-4">Bạn cần đăng nhập để đánh giá khóa học này</p>
            <button
              onClick={() => router.push(`/login?redirect=/courses/${params.id}`)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Đăng nhập ngay
            </button>
          </div>
        )}
      </div>

      {/* Danh sách đánh giá */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Đánh giá từ học viên</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chưa có đánh giá nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((r) => (
              <div 
                key={r.reviewId} 
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {r.user.avatar && r.user.avatar !== '/placeholder-user.jpg' ? (
                        <img 
                          src={r.user.avatar} 
                          alt={r.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 font-semibold text-lg">
                          {r.user.fullName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{r.user.fullName}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= r.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">{r.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
