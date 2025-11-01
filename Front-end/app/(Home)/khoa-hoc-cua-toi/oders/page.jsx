"use client"

import { useState, useEffect } from "react"
import { Award, Download, Eye } from "lucide-react"

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const API_URL = "https://localhost:7025/api"

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const userString = localStorage.getItem("currentUser")
      if (!userString) throw new Error("Chưa đăng nhập")

      const user = JSON.parse(userString)
      const userId = user.userId || user.id
      const token = localStorage.getItem("authToken")

      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      }

      const response = await fetch(`${API_URL}/Orders/ByUser/${userId}`, { headers })

      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Lỗi khi tải đơn hàng:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-100 text-gray-800"
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "paid":
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status) => {
    if (!status) return "Chưa rõ"
    const statusLower = status.toLowerCase()
    switch (statusLower) {
      case "paid":
        return "Đã thanh toán"
      case "pending":
        return "Chờ xử lý"
      case "cancelled":
        return "Đã hủy"
      case "completed":
        return "Hoàn thành"
      default:
        return status
    }
  }

  return (
    <>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử giao dịch</h1>
          <p className="text-gray-600">Quản lý và theo dõi tất cả các đơn hàng của bạn</p>
        </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Bạn chưa có đơn hàng nào</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mã đơn hàng</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ngày đặt</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Số lượng khóa học</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tổng tiền</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mã thanh toán</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order, index) => (
                        <tr
                          key={order.orderId || index}
                          className="hover:bg-gray-100 hover:shadow-sm transition-all duration-200 cursor-pointer fade-in-element"
                          style={{
                            opacity: 0,
                            transform: "translateY(10px)",
                            animation: `fadeInUp 0.4s ease-out ${index * 0.05}s forwards`,
                          }}
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            ORD-{order.orderId?.toString().padStart(6, '0') || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString("vi-VN") : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.orderDetails?.length || 0} khóa học
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {order.totalAmount?.toLocaleString("vi-VN") || 0}đ
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {order.payments && order.payments.length > 0 ? (
                              <div className="space-y-1">
                                {order.payments.map((payment, idx) => (
                                  <div key={payment.paymentId || idx}>
                                    <div className="font-medium text-indigo-600">
                                      #{payment.paymentId || 'N/A'}
                                    </div>
                                    {payment.transactionId && (
                                      <div className="text-xs text-gray-500">
                                        TX: {payment.transactionId.substring(0, 15)}...
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">Chưa thanh toán</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                            >
                              {getStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedOrder(order)
                                setShowModal(true)
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-all duration-200 group"
                            >
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              <span className="font-medium group-hover:font-semibold">Chi tiết</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

      {/* Order Detail Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 modal-content">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Mã đơn hàng</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ORD-{selectedOrder.orderId?.toString().padStart(6, '0') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trạng thái</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}
                  >
                    {getStatusLabel(selectedOrder.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ngày đặt hàng</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString("vi-VN") : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mã thanh toán</p>
                  <div className="space-y-1">
                    {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                      selectedOrder.payments.map((payment, idx) => (
                        <div key={payment.paymentId || idx}>
                          <p className="text-lg font-semibold text-indigo-600">
                            Payment ID: #{payment.paymentId || 'N/A'}
                          </p>
                          {payment.transactionId && (
                            <p className="text-sm text-gray-600">
                              TX: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-lg font-semibold text-gray-400">Chưa thanh toán</p>
                    )}
                  </div>
                </div>
                {selectedOrder.payments && selectedOrder.payments.length > 0 && selectedOrder.payments[0].paymentMethod && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Phương thức thanh toán</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {selectedOrder.payments[0].paymentMethod || "N/A"}
                      </p>
                    </div>
                    {selectedOrder.payments[0].paidAt && (
                      <div>
                        <p className="text-sm text-gray-600">Thời gian thanh toán</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(selectedOrder.payments[0].paidAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Khóa học trong đơn hàng</h3>
                <div className="space-y-3">
                  {selectedOrder.orderDetails?.map((item, index) => (
                    <div key={item.orderDetailId || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{item.course?.title || item.courseName || 'Khóa học không rõ'}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity || 1}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{(item.price || 0).toLocaleString("vi-VN")}đ</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ghi chú</h3>
                  <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <p className="text-lg font-semibold text-gray-900">Tổng cộng</p>
                <p className="text-2xl font-bold text-indigo-600">{(selectedOrder.totalAmount || 0).toLocaleString("vi-VN")}đ</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                <Download className="w-4 h-4" />
                Tải hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
