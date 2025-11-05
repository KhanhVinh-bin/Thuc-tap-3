"use client"
import { useState, useEffect } from "react"
import { getAllFeedbacks, createFeedback, getFeedbacksByUser, getReviewsByCourse, createReview } from "@/lib/api"
import { getEnrollmentsByUser } from "@/lib/enrollmentApi"
import { useAuth } from "@/lib/auth-context"
import { useParams, useRouter } from "next/navigation"

export default function CourseReviews() {
  const { isAuthenticated, user } = useAuth()
  const params = useParams()
  const router = useRouter()

  const [reviews, setReviews] = useState([]) // Đánh giá chính (parent comments)
  const [feedbacks, setFeedbacks] = useState([]) // Replies (phản hồi)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [checkingEnrollment, setCheckingEnrollment] = useState(false)
  // State để quản lý reply
  const [replyingTo, setReplyingTo] = useState(null) // reviewId hoặc feedbackId của comment cha
  const [replyContent, setReplyContent] = useState("")
  const [isInstructor, setIsInstructor] = useState(false)

  useEffect(() => {
    loadReviewsAndFeedbacks()
    if (isAuthenticated && user) {
      checkEnrollment()
      // Kiểm tra xem user có phải instructor không
      const userRole = user.role || user.Role || user.userRole || ""
      setIsInstructor(userRole.toLowerCase() === "instructor")
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

  // ✅ Load cả Reviews (đánh giá chính) và Feedbacks (replies)
  const loadReviewsAndFeedbacks = async () => {
    try {
      setLoading(true)
      
      const courseId = parseInt(params.id)
      
      // 1. Load Reviews từ Reviews API (đánh giá chính của học viên)
      let reviewsData = []
      try {
        const reviewsResponse = await getReviewsByCourse(courseId)
        console.log('📦 Reviews API Response:', reviewsResponse)
        
        // Xử lý các cấu trúc response khác nhau
        if (reviewsResponse && reviewsResponse.reviews && Array.isArray(reviewsResponse.reviews)) {
          reviewsData = reviewsResponse.reviews
        } else if (reviewsResponse && reviewsResponse.Reviews && Array.isArray(reviewsResponse.Reviews)) {
          reviewsData = reviewsResponse.Reviews
        } else if (Array.isArray(reviewsResponse)) {
          reviewsData = reviewsResponse
        }
        
        console.log('✅ Processed reviewsData:', reviewsData)
      } catch (err) {
        console.error('❌ Error loading reviews:', err)
      }
      
      // 2. Load Feedbacks từ Feedbacks API (replies)
      let feedbacksData = []
      try {
        const feedbacksResponse = await getAllFeedbacks()
        if (Array.isArray(feedbacksResponse)) {
          feedbacksData = feedbacksResponse
        }
      } catch (err) {
        console.error('Error loading feedbacks:', err)
      }
      
      // Format reviews data
      const formattedReviews = reviewsData.map(review => {
        // Xử lý User object một cách an toàn
        const userObj = review.User || review.user
        const userData = userObj ? {
          userId: userObj.UserId || userObj.userId || null,
          fullName: userObj.FullName || userObj.fullName || 'Người dùng',
          email: userObj.Email || userObj.email || "",
          avatar: userObj.AvatarUrl || userObj.avatarUrl || '/placeholder-user.jpg'
        } : {
          userId: review.UserId || review.userId || null,
          fullName: 'Người dùng',
          email: "",
          avatar: '/placeholder-user.jpg'
        }
        
        return {
          reviewId: review.ReviewId || review.reviewId,
          courseId: review.CourseId || review.courseId,
          userId: review.UserId || review.userId,
          rating: review.Rating || review.rating,
          comment: review.Comment || review.comment || "",
          createdAt: review.CreatedAt || review.createdAt,
          user: userData,
          replies: [] // Sẽ được populate sau
        }
      })
      
      // Format feedbacks data và map vào replies của reviews
      const formattedFeedbacks = feedbacksData.map(feedback => {
        const content = feedback.Content || feedback.content || ""
        // Kiểm tra xem feedback này có phải là reply không (có format [ReplyTo:reviewId])
        const replyMatch = content.match(/\[ReplyTo:(\d+)\]/)
        const parentReviewId = replyMatch ? parseInt(replyMatch[1]) : null
        
        // Xử lý User object một cách an toàn
        const userObj = feedback.User || feedback.user
        const userData = userObj ? {
          userId: userObj.UserId || userObj.userId || null,
          fullName: userObj.FullName || userObj.fullName || 'Người dùng',
          email: userObj.Email || userObj.email || "",
          avatar: userObj.AvatarUrl || userObj.avatarUrl || '/placeholder-user.jpg'
        } : {
          userId: feedback.UserId || feedback.userId || null,
          fullName: 'Người dùng',
          email: "",
          avatar: '/placeholder-user.jpg'
        }
        
        return {
          feedbackId: feedback.FeedbackId || feedback.feedbackId,
          userId: feedback.UserId || feedback.userId,
          content: content.replace(/\[ReplyTo:\d+\]\s*/, ''), // Remove prefix
          rating: feedback.Rating || feedback.rating || null,
          createdAt: feedback.CreatedAt || feedback.createdAt,
          parentReviewId: parentReviewId, // Link đến review cha
          user: userData
        }
      })
      
      // Map replies vào reviews (nested structure)
      formattedReviews.forEach(review => {
        review.replies = formattedFeedbacks.filter(fb => fb.parentReviewId === review.reviewId)
      })
      
      setReviews(formattedReviews)
      setFeedbacks(formattedFeedbacks)
    } catch (err) {
      console.error('Error loading reviews and feedbacks:', err)
      setReviews([])
      setFeedbacks([])
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

    // Kiểm tra enrollment trước khi submit (chỉ cho học viên)
    if (!isInstructor && !isEnrolled) {
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

      // ✅ Sử dụng Reviews API để tạo đánh giá chính
      const reviewData = {
        CourseId: parseInt(params.id),
        UserId: userId,
        Rating: parseInt(rating),
        Comment: content.trim()
      };

      const createdReview = await createReview(reviewData);

      if (createdReview) {
        alert("✅ Đánh giá đã được gửi thành công!");
        setRating(0);
        setContent("");
        // Reload reviews và feedbacks
        await loadReviewsAndFeedbacks();
      }
    } catch (error) {
      console.error("❌ Lỗi khi gửi đánh giá:", error);
      alert("Gửi đánh giá thất bại: " + (error.message || "Vui lòng thử lại sau."));
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Handler để reply (học viên và giảng viên đều có thể reply)
  const handleReply = async (parentReviewId) => {
    if (!replyContent.trim()) {
      alert("Vui lòng nhập nội dung phản hồi!");
      return;
    }

    if (!isAuthenticated || !user) {
      alert("Vui lòng đăng nhập để phản hồi!");
      router.push(`/login?redirect=/courses/${params.id}`);
      return;
    }

    // Nếu là học viên và reply vào review của học viên khác, cần enrollment
    const parentReview = reviews.find(r => r.reviewId === parentReviewId)
    if (!isInstructor && parentReview && !isEnrolled) {
      alert("Bạn cần ghi danh vào khóa học này trước khi có thể phản hồi.");
      return;
    }

    try {
      setSubmitting(true);

      // Extract userId
      const userId = user.UserId || user.userId || user.id || user.ID;
      if (!userId) {
        alert("Không tìm thấy ID người dùng!");
        return;
      }

      // ✅ Tạo feedback mới như một reply với format [ReplyTo:reviewId]
      const replyData = {
        userId: parseInt(userId),
        content: `[ReplyTo:${parentReviewId}] ${replyContent.trim()}`,
        rating: null // Reply không có rating
      };

      await createFeedback(replyData);
      
      alert("✅ Phản hồi đã được gửi thành công!");
      setReplyContent("");
      setReplyingTo(null);
      await loadReviewsAndFeedbacks();
    } catch (error) {
      console.error("❌ Lỗi khi gửi phản hồi:", error);
      alert("Gửi phản hồi thất bại: " + (error.message || "Vui lòng thử lại sau."));
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
                placeholder={isInstructor ? "Chia sẻ phản hồi của bạn về khóa học này..." : "Chia sẻ về trải nghiệm của bạn về khóa học này..."}
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
                disabled={submitting || !rating || !content.trim() || checkingEnrollment || (!isEnrolled && !isInstructor)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  submitting || !rating || !content.trim() || checkingEnrollment || (!isEnrolled && !isInstructor)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                {checkingEnrollment 
                  ? "Đang kiểm tra..." 
                  : submitting 
                  ? "Đang gửi..." 
                  : (!isEnrolled && !isInstructor)
                  ? "Cần ghi danh để đánh giá"
                  : "Gửi đánh giá"}
              </button>
            </div>
            {!checkingEnrollment && !isEnrolled && !isInstructor && isAuthenticated && (
              <p className="text-sm text-red-600 mt-2">
                Bạn cần ghi danh vào khóa học này trước khi có thể đánh giá.
              </p>
            )}
            {isInstructor && (
              <p className="text-sm text-blue-600 mt-2">
                Bạn đang đăng nhập với tư cách giảng viên. Bạn có thể đánh giá và phản hồi các đánh giá của học viên.
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

      {/* Danh sách đánh giá và phản hồi (kiểu Facebook comment) */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Đánh giá và phản hồi</h2>
        
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Chưa có đánh giá nào.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div 
                key={review.reviewId} 
                className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
              >
                {/* Đánh giá chính (parent comment) */}
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {review.user?.avatar && review.user.avatar !== '/placeholder-user.jpg' ? (
                        <img 
                          src={review.user.avatar} 
                          alt={review.user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 font-semibold text-lg">
                          {review.user?.fullName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">{review.user?.fullName || 'Người dùng'}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    
                    {/* ✅ Nút Reply (cho tất cả mọi người đã đăng nhập) */}
                    {isAuthenticated && (
                      <div className="mt-3">
                        {replyingTo === review.reviewId ? (
                          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                              rows="3"
                              placeholder="Nhập phản hồi của bạn..."
                              maxLength={500}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setReplyingTo(null)
                                  setReplyContent("")
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                              >
                                Hủy
                              </button>
                              <button
                                onClick={() => handleReply(review.reviewId)}
                                disabled={!replyContent.trim() || submitting}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                  !replyContent.trim() || submitting
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                              >
                                {submitting ? "Đang gửi..." : "Gửi phản hồi"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(review.reviewId)}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Phản hồi
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ✅ Replies (nested comments) */}
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-4 ml-16 pl-4 border-l-2 border-gray-200 space-y-4">
                    {review.replies.map((reply) => {
                      // Kiểm tra xem reply này có phải của giảng viên không
                      const replyUserId = reply.user?.userId || reply.userId
                      const currentUserId = user?.userId || user?.id || user?.UserId || user?.ID
                      const isInstructorReply = isInstructor && replyUserId && currentUserId && replyUserId === currentUserId
                      
                      return (
                        <div key={reply.feedbackId} className="flex items-start gap-3">
                          {/* Avatar nhỏ hơn cho reply */}
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              {reply.user?.avatar && reply.user.avatar !== '/placeholder-user.jpg' ? (
                                <img 
                                  src={reply.user.avatar} 
                                  alt={reply.user.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 font-semibold text-sm">
                                  {reply.user?.fullName?.[0]?.toUpperCase() || 'U'}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Reply Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold text-sm ${
                                isInstructorReply ? 'text-blue-700' : 'text-gray-900'
                              }`}>
                                {reply.user?.fullName || 'Người dùng'}
                              </span>
                              {isInstructorReply && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Giảng viên</span>
                              )}
                            </div>
                            <p className={`text-sm leading-relaxed ${
                              isInstructorReply ? 'text-blue-900' : 'text-gray-700'
                            }`}>
                              {reply.content}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(reply.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            
                            {/* ✅ Nút Reply cho reply (nested reply) */}
                            {isAuthenticated && (
                              <div className="mt-2">
                                {replyingTo === `reply-${reply.feedbackId}` ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                                      rows="2"
                                      placeholder="Nhập phản hồi..."
                                      maxLength={500}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <button
                                        onClick={() => {
                                          setReplyingTo(null)
                                          setReplyContent("")
                                        }}
                                        className="px-3 py-1 text-xs text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                                      >
                                        Hủy
                                      </button>
                                      <button
                                        onClick={() => handleReply(review.reviewId)}
                                        disabled={!replyContent.trim() || submitting}
                                        className={`px-3 py-1 text-xs rounded font-medium ${
                                          !replyContent.trim() || submitting
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                            : "bg-indigo-600 text-white hover:bg-indigo-700"
                                        }`}
                                      >
                                        {submitting ? "Đang gửi..." : "Gửi"}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setReplyingTo(`reply-${reply.feedbackId}`)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                  >
                                    Phản hồi
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
