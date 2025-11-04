"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Trash2, Plus, Minus, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function CartPage() {
  const { 
    cart, 
    cartData, 
    loading, 
    error, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal,
    getCartItemsCount 
  } = useCart()
  const [isClearing, setIsClearing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [deleteType, setDeleteType] = useState(null) // 'item' or 'all'

  // Ensure image URL is properly formatted for next/image
  const getImageSrc = (imageUrl) => {
    if (!imageUrl) return "/react-course.png"
    
    // If it's already an absolute URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // If it's a relative path, ensure it starts with /
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  }

  const handleClearCart = () => {
    setDeleteType('all')
    setShowDeleteConfirm(true)
  }

  const handleDeleteItem = (courseId) => {
    setItemToDelete(courseId)
    setDeleteType('item')
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (deleteType === 'all') {
      setIsClearing(true)
      setTimeout(() => {
        clearCart()
        setIsClearing(false)
        setShowDeleteConfirm(false)
        setDeleteType(null)
      }, 300)
    } else if (deleteType === 'item' && itemToDelete) {
      removeFromCart(itemToDelete)
      setShowDeleteConfirm(false)
      setItemToDelete(null)
      setDeleteType(null)
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setItemToDelete(null)
    setDeleteType(null)
  }

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d]/g, '')) : price
    return new Intl.NumberFormat("vi-VN").format(numPrice || 0) + " đ"
  }

  // Helper function to get course data from cart item
  const getCourseFromItem = (item) => {
    // API format: item.course contains course data
    if (item.course) {
      return {
        id: item.course.courseId,
        title: item.course.title,
        image: item.course.thumbnailUrl,
        price: item.course.price,
        instructor: item.course.instructorName,
        quantity: item.quantity
      }
    }
    // Fallback for localStorage format
    return item
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn</h1>
            <p className="text-gray-600">{getCartItemsCount()} khóa học trong giỏ hàng</p>
            
            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f46e5] mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải giỏ hàng...</p>
            </div>
          )}

          {!loading && cart.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <p className="text-gray-600 mb-4">Giỏ hàng của bạn đang trống</p>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item) => {
                  const course = getCourseFromItem(item)
                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-lg p-6 flex gap-4 fade-in hover:shadow-md transition-shadow"
                    >
                      <Image
                        src={getImageSrc(course.image)}
                        alt={course.title}
                        width={160}
                        height={90}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">Giảng viên: {course.instructor}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-bold text-[#4f46e5]">{formatPrice(course.price)}</p>
                          <div className="flex items-center gap-3">
                            {course.quantity > 1 && (
                              <span className="text-sm text-gray-600">Số lượng: {course.quantity}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteItem(course.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <Link
                    href="/courses"
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Tiếp tục mua sắm
                  </Link>
                  <button
                    onClick={handleClearCart}
                    disabled={loading || isClearing}
                    className="flex items-center gap-2 px-6 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isClearing ? "Đang xóa..." : "Xóa tất cả"}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg p-6 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Tổng đơn hàng</h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(getCartTotal())}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between text-lg font-bold">
                      <span>Tổng cộng:</span>
                      <span className="text-[#4f46e5]">{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>

                  <Link
                    href="/thanhtoan"
                    className="w-full block text-center px-6 py-3 bg-[#4f46e5] text-white rounded-lg hover:bg-[#4338ca] transition-colors font-medium mb-6"
                  >
                    Thanh toán ngay
                  </Link>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2 text-green-600">
                      <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Học trọn đời</span>
                    </div>
                    <div className="flex items-start gap-2 text-green-600">
                      <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Chứng chỉ hoàn thành</span>
                    </div>
                    <div className="flex items-start gap-2 text-green-600">
                      <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Hoàn tiền trong 30 ngày</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
              <button
                onClick={cancelDelete}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-700 mb-6">
              {deleteType === 'all' 
                ? "Bạn có chắc muốn xóa tất cả khóa học trong giỏ hàng?"
                : "Bạn có chắc muốn xóa khóa học này khỏi giỏ hàng?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>

      <Footer />
    </>
  )
}
