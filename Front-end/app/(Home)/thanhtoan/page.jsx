"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, Building2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getCourseById } from "@/app/(Home)/Data/mockCourses"

export default function CheckoutPage() {
const { cart, getCartTotal, clearCart } = useCart()
const router = useRouter()
const searchParams = useSearchParams()
const courseId = searchParams.get("courseId") // 🔥 kiểm tra xem có courseId không
const [singleCourse, setSingleCourse] = useState(null) // 🔥 lưu khóa học mua ngay
const [paymentMethod, setPaymentMethod] = useState("ewallet")
const [formData, setFormData] = useState({
email: "",
fullName: "",
phone: "",
})
const [errors, setErrors] = useState({})

const formatPrice = (price) => {
return new Intl.NumberFormat("vi-VN").format(price) + " đ"
}

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

// 🔥 Khi có courseId (mua ngay), lấy thông tin khóa học
useEffect(() => {
if (courseId) {
const foundCourse = getCourseById(courseId)
if (foundCourse) {
setSingleCourse({
id: foundCourse.id,
title: foundCourse.title,
price: parseFloat(foundCourse.price.replace(/[^\d]/g, "")),
image: foundCourse.image,
quantity: 1,
})
}
}
}, [courseId])

const validateForm = () => {
const newErrors = {}
if (!formData.email) newErrors.email = "Email không được bỏ trống"
if (!formData.fullName) newErrors.fullName = "Họ và tên không được bỏ trống"
if (!formData.phone) newErrors.phone = "Số điện thoại không được bỏ trống"
setErrors(newErrors)
return Object.keys(newErrors).length === 0
}

const handleSubmit = (e) => {
e.preventDefault()
if (validateForm()) {
alert("Thanh toán thành công!")

  // 🔥 Nếu là mua ngay thì không cần clear giỏ
  if (!singleCourse) clearCart()

  router.push("/")
}


}

// 🔥 Kiểm tra trường hợp không có gì để thanh toán
if (!singleCourse && cart.length === 0) {
return (
<>
<Header />
<div className="flex flex-col items-center justify-center min-h-screen">
<p className="text-lg mb-4">Giỏ hàng của bạn đang trống</p>
<Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-md">
Tiếp tục mua sắm
</Link>
</div>
<Footer />
</>
)
}

return (
<>
<Header />
<div className="max-w-6xl mx-auto py-8 px-4 md:px-0">
<Link href="/cart" className="flex items-center text-blue-600 mb-4">
<ArrowLeft className="mr-2 w-4 h-4" /> Quay lại giỏ hàng
</Link>

    <h1 className="text-2xl font-bold mb-6">Thanh toán</h1>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Form thông tin */}
      <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Thông tin người mua</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-1">Họ và tên</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block mb-1">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border rounded-md px-3 py-2"
              />
              {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="payment"
                value="ewallet"
                checked={paymentMethod === "ewallet"}
                onChange={() => setPaymentMethod("ewallet")}
              />
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Thanh toán qua ví điện tử (MoMo, ZaloPay, VNPay)</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="payment"
                value="bank"
                checked={paymentMethod === "bank"}
                onChange={() => setPaymentMethod("bank")}
              />
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Chuyển khoản ngân hàng</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700"
        >
          Hoàn tất thanh toán
        </button>
      </form>

      {/* Tóm tắt đơn hàng */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h2>
        <div className="space-y-4">
          {(singleCourse ? [singleCourse] : cart).map((item) => (
            <div key={item.id} className="flex items-center space-x-4">
              <Image
                src={getImageSrc(item.image)}
                alt={item.title}
                width={60}
                height={60}
                className="rounded-md object-cover"
              />
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.price)}</p>
            </div>
          ))}
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