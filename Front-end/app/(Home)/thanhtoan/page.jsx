"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Building2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getCourseById, formatCourseData, createOrder } from "@/lib/api"
import { processPayment, createPayment, updatePaymentStatus } from "@/lib/paymentApi"

export default function CheckoutPage() {
  const { cart, getCartTotal, clearCart } = useCart()
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const courseId = searchParams.get("courseId")
  const isBuyNow = searchParams.get("buyNow") === "true"

  const [singleCourse, setSingleCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("ewallet")
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
  })
  const [errors, setErrors] = useState({})
  const [paymentStatus, setPaymentStatus] = useState(null)
  const [transactionId, setTransactionId] = useState(null)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`)
    }
  }, [isAuthenticated, router])

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price || 0) + " đ"

  const getImageSrc = (imageUrl) => {
    if (!imageUrl || imageUrl.trim() === "") return "/react-course.png"
    
    // If it's already an absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // If it's a relative path from backend uploads, add base URL
    if (imageUrl.includes('/uploads/')) {
      // Backend API upload file trên port 3001 (instructor API)
      const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
      return `https://localhost:3001${cleanPath}`
    }
    
    // If it's a relative path, ensure it starts with /
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
    
    // Nếu là file trong public folder, giữ nguyên
    if (cleanPath.startsWith('/public/') || cleanPath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return cleanPath
    }
    
    return cleanPath
  }

  // 🔥 Mua ngay: lấy khóa học từ API
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return
      try {
        setLoading(true)
        const courseData = await getCourseById(courseId)
        if (courseData) {
          const formatted = formatCourseData(courseData)
          setSingleCourse({
            id: formatted.id,
            title: formatted.title,
            price: parseFloat(formatted.price.replace(/[^\d]/g, "")) || 0,
            image: formatted.image,
            quantity: 1,
          })
        }
      } catch (error) {
        console.error("Error fetching course:", error)
        alert("Không thể tải thông tin khóa học")
      } finally {
        setLoading(false)
      }
    }
    fetchCourseData()
  }, [courseId])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.email) newErrors.email = "Email không được bỏ trống"
    if (!formData.fullName) newErrors.fullName = "Họ và tên không được bỏ trống"
    if (!formData.phone) {
      newErrors.phone = "Số điện thoại không được bỏ trống"
    } else {
      // Kiểm tra số điện thoại phải đủ 10 số
      const phoneDigits = formData.phone.replace(/\D/g, "") // Loại bỏ tất cả ký tự không phải số
      if (phoneDigits.length !== 10) {
        newErrors.phone = "Số điện thoại phải đủ 10 số"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setLoading(true)
      if (!isAuthenticated || !user) {
        alert("Vui lòng đăng nhập để hoàn tất thanh toán!")
        router.push("/login")
        return
      }

      const orderItems = singleCourse ? [singleCourse] : cart
      
      // Format đúng theo OrderCreateDTO backend yêu cầu
      // Backend sẽ tự động thay orderId = 0 bằng orderId thực tế sau khi tạo order
      const orderData = {
        userId: user.userId || user.id,
        notes: `Khách hàng: ${formData.fullName}, Email: ${formData.email}, Phone: ${formData.phone}`,
        orderDetails: orderItems.map((item) => ({
          orderId: 0, // Required field, backend sẽ tự động set khi tạo order
          courseId: parseInt(item.id || item.courseId),
          price: parseFloat(item.price || 0),
          quantity: parseInt(item.quantity || 1),
        })),
      }

      let createdOrder = null
      
      try {
        // Step 1: Create order first
        setPaymentStatus("Đang tạo đơn hàng...")
        createdOrder = await createOrder(orderData)
        console.log("Order created:", createdOrder)
        
        // Step 2: Process payment using Payment API
        setPaymentStatus("Đang xử lý thanh toán...")
        const orderId = createdOrder.orderId || createdOrder.id || createdOrder.OrderId
        
        if (!orderId) {
          throw new Error("Không thể lấy Order ID sau khi tạo đơn hàng")
        }
        
        // Nếu là VNPay, hiển thị thông tin và vẫn xử lý như bình thường
        if (paymentMethod === "vnpay") {
          setPaymentStatus("Đang xử lý thanh toán VNPay Sandbox...")
        }
        
        const paymentResult = await processPayment({
          orderId: orderId,
          totalAmount: singleCourse ? singleCourse.price : getCartTotal(),
          paymentMethod: paymentMethod === "vnpay" ? "vnpay_sandbox" : paymentMethod,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone
        }, paymentMethod === "vnpay" ? "vnpay_sandbox" : paymentMethod)

        console.log("Payment processed:", paymentResult)

        if (paymentResult.success) {
          setPaymentStatus(
            paymentMethod === "vnpay"
              ? "Thanh toán VNPay Sandbox thành công! (Demo)"
              : "Thanh toán thành công!"
          )
          setTransactionId(paymentResult.transactionId)
          
          // ✅ Backend tự động tạo enrollment khi payment status = "success"
          // (PaymentsController.cs dòng 337-373)
          // Không cần gọi createBatchEnrollments() nữa để tránh duplicate
          
          const successMessage =
            paymentMethod === "vnpay"
              ? `Thanh toán VNPay Sandbox thành công! (Demo - Không trừ tiền thật)
Mã thanh toán: #${paymentResult.paymentId}
Mã giao dịch: ${paymentResult.transactionId}
Số tiền: ${new Intl.NumberFormat("vi-VN").format(paymentResult.amount || (singleCourse ? singleCourse.price : getCartTotal()))} đ
Cảm ơn bạn đã test thanh toán.`
              : `Thanh toán thành công! 
Mã thanh toán: #${paymentResult.paymentId}
Mã giao dịch: ${paymentResult.transactionId}
Số tiền: ${new Intl.NumberFormat("vi-VN").format(paymentResult.amount || (singleCourse ? singleCourse.price : getCartTotal()))} đ
Cảm ơn bạn đã mua khóa học.`
          
          alert(successMessage)

          // Xóa giỏ hàng sau thanh toán thành công
          clearCart()
          router.push("/khoa-hoc-cua-toi")
        } else {
          throw new Error("Payment processing failed")
        }

      } catch (apiError) {
        console.error("API error:", apiError)
        
        // Fallback: Try direct payment creation if processPayment fails
        try {
          // Tạo order trước nếu chưa có
          let orderId = null
          if (!createdOrder) {
            setPaymentStatus("Đang tạo đơn hàng (fallback)...")
            const fallbackOrder = await createOrder(orderData)
            orderId = fallbackOrder.orderId || fallbackOrder.id || fallbackOrder.OrderId
            createdOrder = fallbackOrder
          } else {
            orderId = createdOrder.orderId || createdOrder.id || createdOrder.OrderId
          }

          if (!orderId) {
            throw new Error("Không thể tạo đơn hàng")
          }

          setPaymentStatus("Đang xử lý thanh toán (fallback)...")
          const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          const totalAmount = singleCourse ? singleCourse.price : getCartTotal()
          
          const paymentData = {
            orderId: orderId,
            paymentMethod: paymentMethod === "vnpay" ? "vnpay_sandbox" : paymentMethod,
            transactionId: transactionId,
            amount: totalAmount,
            paymentStatus: "success",
            paidAt: new Date().toISOString(),
            rawResponse: JSON.stringify({
              customerName: formData.fullName,
              customerEmail: formData.email,
              customerPhone: formData.phone,
              paymentMethod: paymentMethod === "vnpay" ? "vnpay_sandbox" : paymentMethod,
              isVnPaySandbox: paymentMethod === "vnpay",
              orderItems: orderItems.map(item => ({
                courseId: item.id || item.courseId,
                quantity: item.quantity || 1,
                price: item.price
              }))
            })
          }

          const payment = await createPayment(paymentData)
          console.log("Direct payment created:", payment)

          // ✅ Backend tự động tạo enrollment khi payment status = "success"
          // Không cần gọi createBatchEnrollments() nữa để tránh duplicate

          const fallbackMessage =
            paymentMethod === "vnpay"
              ? `Thanh toán VNPay Sandbox thành công! (Demo - Không trừ tiền thật)
Mã thanh toán: #${payment.paymentId}
Mã giao dịch: ${transactionId}
Số tiền: ${new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
Cảm ơn bạn đã test thanh toán.`
              : `Thanh toán thành công! 
Mã thanh toán: #${payment.paymentId}
Mã giao dịch: ${transactionId}
Số tiền: ${new Intl.NumberFormat("vi-VN").format(totalAmount)} đ
Cảm ơn bạn đã mua khóa học.`

          alert(fallbackMessage)

          // Xóa giỏ hàng sau thanh toán thành công
          clearCart()
          router.push("/khoa-hoc-cua-toi")

        } catch (fallbackError) {
          console.error("Fallback payment error:", fallbackError)
          alert("Có lỗi xảy ra khi xử lý thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ!")
        }
      }

    } catch (err) {
      console.error("Payment error:", err)
      alert("Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!")
    } finally {
      setLoading(false)
    }
  }

  // 🔄 Loading UI
  if (loading) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang xử lý...</p>
        </div>
        <Footer />
      </>
    )
  }

  // 🛒 Không có khóa học nào
  if (!singleCourse && (!cart || cart.length === 0)) {
    return (
      <>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-lg mb-4">Giỏ hàng của bạn đang trống</p>
          <Link href="/courses" className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Tiếp tục mua sắm
          </Link>
        </div>
        <Footer />
      </>
    )
  }

  // Helper function to get course data from cart item
  const getCourseFromItem = (item) => {
    // API format: item.course contains course data
    if (item.course) {
      // Hỗ trợ cả PascalCase và camelCase cho thumbnailUrl
      const thumbnailUrl = item.course.ThumbnailUrl || item.course.thumbnailUrl || item.course.image || item.course.Image
      const courseId = item.course.CourseId || item.course.courseId || item.course.id
      const title = item.course.Title || item.course.title
      const price = item.course.Price || item.course.price
      
      return {
        id: courseId,
        title: title || "Khóa học",
        image: thumbnailUrl,
        price: price || 0,
        quantity: item.quantity || 1
      }
    }
    // Fallback for localStorage format - hỗ trợ nhiều tên field
    return {
      id: item.id || item.courseId,
      title: item.title || "Khóa học",
      image: item.image || item.thumbnailUrl || item.ThumbnailUrl,
      price: item.price || 0,
      quantity: item.quantity || 1
    }
  }

  const orderList = singleCourse ? [singleCourse] : cart

  return (
    <>
      <Header />
      <div className="max-w-6xl mx-auto py-8 px-4 md:px-0">
        <Link href="/cart" className="flex items-center text-blue-600 mb-4">
          <ArrowLeft className="mr-2 w-4 h-4" /> Quay lại giỏ hàng
        </Link>

        <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

        {/* Payment Status Display */}
        {(paymentStatus || transactionId) && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
            <h2 className="text-lg font-semibold mb-2">Trạng thái thanh toán</h2>
            {paymentStatus && (
              <p className="text-blue-700 mb-2">
                <strong>Status:</strong> {paymentStatus}
              </p>
            )}
            {transactionId && (
              <p className="text-green-700">
                <strong>Mã giao dịch:</strong> {transactionId}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form người mua */}
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Thông tin người mua</h2>
              <div className="space-y-4">
                {["email", "fullName", "phone"].map((field) => (
                  <div key={field}>
                    <label className="block mb-1 capitalize">
                      {field === "fullName"
                        ? "Họ và tên"
                        : field === "phone"
                        ? "Số điện thoại"
                        : "Email"}
                      {field === "phone" && (
                        <span className="text-gray-500 text-sm ml-1">(10 số)</span>
                      )}
                    </label>
                    <input
                      type={field === "email" ? "email" : "text"}
                      value={formData[field]}
                      onChange={(e) => {
                        let value = e.target.value
                        // Nếu là số điện thoại, chỉ cho phép nhập số
                        if (field === "phone") {
                          value = value.replace(/\D/g, "") // Chỉ giữ lại số
                          // Giới hạn tối đa 10 số
                          if (value.length > 10) {
                            value = value.slice(0, 10)
                          }
                        }
                        setFormData({ ...formData, [field]: value })
                        // Xóa lỗi khi user bắt đầu nhập lại
                        if (errors[field]) {
                          setErrors({ ...errors, [field]: "" })
                        }
                      }}
                      className={`w-full border rounded-md px-3 py-2 ${
                        errors[field] ? "border-red-500" : ""
                      }`}
                      placeholder={
                        field === "phone" ? "0123456789" : undefined
                      }
                      maxLength={field === "phone" ? 10 : undefined}
                    />
                    {errors[field] && (
                      <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                    )}
                    {field === "phone" && formData.phone && !errors.phone && (
                      <p className="text-gray-500 text-xs mt-1">
                        Đã nhập: {formData.phone.replace(/\D/g, "").length}/10 số
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Phương thức thanh toán */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="ewallet"
                    checked={paymentMethod === "ewallet"}
                    onChange={() => setPaymentMethod("ewallet")}
                    className="cursor-pointer"
                  />
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span>Ví điện tử (MoMo, ZaloPay)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-md hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={paymentMethod === "bank"}
                    onChange={() => setPaymentMethod("bank")}
                    className="cursor-pointer"
                  />
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Chuyển khoản ngân hàng</span>
                </label>
              </div>

              {/* QR Code cho Ví điện tử khi được chọn */}
              {paymentMethod === "ewallet" && (
                <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-900 mb-2">
                        Thanh toán bằng ví điện tử
                      </h3>
                      <div className="space-y-2 text-sm text-purple-800">
                        {/* QR Code Section */}
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                            {/* QR Code */}
                            <div className="flex-shrink-0">
                              <div className="bg-white p-3 rounded-lg border-2 border-purple-300 shadow-sm">
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                    JSON.stringify({
                                      type: "EWALLET_PAYMENT",
                                      amount: singleCourse ? singleCourse.price : getCartTotal(),
                                      currency: "VND",
                                      orderInfo: `Thanh toan khoa hoc - ${formData.fullName || "Khách hàng"}`,
                                      merchant: "EduLearn Platform",
                                      paymentMethod: "MoMo/ZaloPay",
                                      timestamp: new Date().toISOString(),
                                      customerPhone: formData.phone || "",
                                      customerEmail: formData.email || ""
                                    })
                                  )}`}
                                  alt="QR Code Ví điện tử"
                                  className="w-48 h-48 mx-auto"
                                />
                              </div>
                              <p className="text-xs text-center text-purple-600 mt-2 font-medium">
                                Quét QR để thanh toán
                              </p>
                            </div>
                            
                            {/* Payment Info */}
                            <div className="flex-1 space-y-2">
                              <div className="bg-white p-3 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-900 mb-2">
                                  💳 Thông tin thanh toán
                                </h4>
                                <div className="space-y-1 text-xs">
                                  <p>
                                    <strong>Số tiền:</strong>{" "}
                                    {formatPrice(singleCourse ? singleCourse.price : getCartTotal())}
                                  </p>
                                  <p>
                                    <strong>Người nhận:</strong> EduLearn Platform
                                  </p>
                                  <p>
                                    <strong>Nội dung:</strong> Thanh toán khóa học
                                  </p>
                                  <p>
                                    <strong>Phương thức:</strong>{" "}
                                    <span className="text-purple-600 font-semibold">MoMo / ZaloPay</span>
                                  </p>
                                  {formData.phone && (
                                    <p>
                                      <strong>SĐT:</strong> {formData.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800">
                                <p>
                                  <strong>💡 Lưu ý:</strong> Quét QR code bằng ứng dụng MoMo hoặc ZaloPay để thanh toán nhanh chóng.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-md transition-colors ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              {loading ? "Đang xử lý..." : "Hoàn tất thanh toán"}
            </button>
          </form>

          {/* Tóm tắt đơn hàng */}
          <div className="border p-4 rounded-md bg-gray-50">
            <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
              {orderList.map((item) => {
                const course = singleCourse ? item : getCourseFromItem(item)
                return (
                  <div key={course.id || course.courseId} className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                      <Image
                        src={getImageSrc(course.image)}
                        alt={course.title || "Khóa học"}
                        fill
                        className="rounded-md object-cover"
                        sizes="64px"
                        unoptimized={course.image?.includes('/uploads/')}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{course.title || "Khóa học"}</p>
                      <p className="text-sm text-gray-500">Số lượng: {course.quantity || 1}</p>
                    </div>
                    <p className="font-semibold">{formatPrice(course.price)}</p>
                  </div>
                )
              })}
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-semibold">
              <span>Tổng cộng:</span>
              <span>
                {formatPrice(singleCourse ? singleCourse.price : getCartTotal())}
              </span>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
