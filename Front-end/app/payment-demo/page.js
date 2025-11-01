"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function PaymentDemoPage() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState(null)

  // Demo courses data
  const demoCourses = [
    {
      id: 1,
      title: "Khóa học React.js từ cơ bản đến nâng cao",
      price: 500000,
      image: "/react-course.png",
      description: "Học React.js từ cơ bản đến nâng cao với các dự án thực tế"
    },
    {
      id: 2,
      title: "Khóa học Node.js Backend Development",
      price: 750000,
      image: "/nodejs-course.jpg",
      description: "Xây dựng API và backend với Node.js và Express"
    },
    {
      id: 3,
      title: "Khóa học MongoDB Database",
      price: 400000,
      image: "/mongodb-course.jpg",
      description: "Quản lý cơ sở dữ liệu NoSQL với MongoDB"
    }
  ]

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN").format(price || 0) + " đ"

  const handleBuyNow = (course) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để mua khóa học!")
      router.push("/login")
      return
    }

    // Redirect to payment page with course info
    const params = new URLSearchParams({
      courseId: course.id.toString(),
      buyNow: "true"
    })
    router.push(`/thanhtoan?${params.toString()}`)
  }

  const handleAddToCart = (course) => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để thêm vào giỏ hàng!")
      router.push("/login")
      return
    }

    // In a real app, this would add to cart context
    alert(`Đã thêm "${course.title}" vào giỏ hàng!`)
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Demo Thanh Toán - Khóa Học</h1>
      
      {/* Authentication Status */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Trạng thái đăng nhập</h2>
        {isAuthenticated ? (
          <div className="text-green-700">
            <p>✅ Đã đăng nhập: {user?.fullName || user?.email || "User"}</p>
            <p>User ID: {user?.userId || user?.id}</p>
          </div>
        ) : (
          <div className="text-red-700">
            <p>❌ Chưa đăng nhập</p>
            <Link href="/login" className="text-blue-600 underline">
              Đăng nhập ngay
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Liên kết hữu ích</h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/thanhtoan" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Trang Thanh Toán
          </Link>
          <Link href="/payment-api-test" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Test Payment API
          </Link>
          <Link href="/cart" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
            Giỏ Hàng
          </Link>
          <Link href="/giangvien/debug-auth" className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700">
            Debug Auth
          </Link>
        </div>
      </div>

      {/* Demo Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {demoCourses.map((course) => (
          <div key={course.id} className="bg-white border rounded-lg overflow-hidden shadow-lg">
            <img
              src={course.image}
              alt={course.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.target.src = "/placeholder.jpg"
              }}
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{course.description}</p>
              <div className="flex justify-between items-center mb-4">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(course.price)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBuyNow(course)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                >
                  Mua Ngay
                </button>
                <button
                  onClick={() => handleAddToCart(course)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                >
                  Thêm Giỏ Hàng
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Flow Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Hướng dẫn test Payment Flow</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Đảm bảo đã đăng nhập (nếu chưa, click "Đăng nhập ngay" ở trên)</li>
          <li>Click "Mua Ngay" trên một khóa học để chuyển đến trang thanh toán</li>
          <li>Điền thông tin người mua và chọn phương thức thanh toán</li>
          <li>Click "Hoàn tất thanh toán" để xử lý payment qua API</li>
          <li>Kiểm tra console browser để xem chi tiết API calls</li>
          <li>Sử dụng "Test Payment API" để test riêng các endpoint</li>
        </ol>
      </div>

      {/* API Endpoints Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Payment API Endpoints</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold mb-2">GET Endpoints:</h3>
            <ul className="space-y-1">
              <li>• GET /api/Payments - Tất cả payments</li>
              <li>• GET /api/Payments/{`{id}`} - Payment theo ID</li>
              <li>• GET /api/Payments/ByOrder/{`{orderId}`} - Payments theo Order</li>
              <li>• GET /api/Payments/ByTransaction/{`{transactionId}`} - Payment theo Transaction</li>
              <li>• GET /api/Payments/Recent/{`{count}`} - Payments gần đây</li>
              <li>• GET /api/Payments/Stats - Thống kê payments</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">POST/PUT/PATCH/DELETE:</h3>
            <ul className="space-y-1">
              <li>• POST /api/Payments - Tạo payment mới</li>
              <li>• PUT /api/Payments/{`{id}`} - Cập nhật payment</li>
              <li>• PATCH /api/Payments/{`{id}`}/Status - Cập nhật status</li>
              <li>• DELETE /api/Payments/{`{id}`} - Xóa payment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}