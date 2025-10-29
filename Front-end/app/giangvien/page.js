"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useAuth } from "@/lib/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [userType, setUserType] = useState("student") // student or instructor
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [shakeInput, setShakeInput] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState(null)

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  useEffect(() => {
    // Lấy redirect URL từ query params
    const redirect = searchParams.get('redirect')
    if (redirect) {
      setRedirectUrl(decodeURIComponent(redirect))
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (!formData.email.trim()) {
      setError("Vui lòng nhập email")
      setShakeInput(true)
      setTimeout(() => setShakeInput(false), 500)
      setIsLoading(false)
      return
    }

    if (!formData.password.trim()) {
      setError("Vui lòng nhập mật khẩu")
      setShakeInput(true)
      setTimeout(() => setShakeInput(false), 500)
      setIsLoading(false)
      return
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check credentials for admin access
    if (formData.email === "admin@gmail.com" && formData.password === "123456") {
      // Admin login - set user info với key "currentUser" để header có thể đọc được
      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: 1,
          name: "Admin",
          email: formData.email,
          type: "admin",
          role: "admin",
        })
      );

      setIsLoading(false);
      router.push("/"); // chuyển về trang chủ
      return;
    }


    // Regular user login validation (you can add more credentials here)
    const validCredentials = [
      { email: "student@gmail.com", password: "123456", type: "student" },
      { email: "instructor@gmail.com", password: "123456", type: "instructor" }
    ]

    const validUser = validCredentials.find(
      user => user.email === formData.email && user.password === formData.password
    )

    if (!validUser) {
      setError("Email hoặc mật khẩu không đúng")
      setShakeInput(true)
      setTimeout(() => setShakeInput(false), 500)
      setIsLoading(false)
      return
    }

    // Save user data với key "currentUser" để header có thể đọc được
    const userData = {
      id: validUser.type === "student" ? 2 : 3,
      name: validUser.type === "student" ? "Học viên" : "Giảng viên",
      email: formData.email,
      type: validUser.type,
    }
    
    localStorage.setItem("currentUser", JSON.stringify(userData))
    
    // Cập nhật auth context
    login(userData)

    setIsLoading(false)
    
    // Redirect về trang được yêu cầu hoặc trang chủ
    if (redirectUrl) {
      router.push(redirectUrl)
    } else {
      router.push("/")
    }
  }

  const studentBenefits = [
    "Truy cập hàng ngàn khóa học chất lượng",
    "Học tập theo tiến độ riêng",
    "Nhận chứng chỉ sau khi hoàn thành",
    "Tương tác trực tiếp với giảng viên",
    "Theo dõi tiến độ học tập chi tiết",
    "Hỗ trợ marketing khóa học",
  ]

  const instructorBenefits = [
    "Tạo và quản lý khóa học không giới hạn",
    "Chăm sóc và theo dõi tiến độ học viên",
    "Tạo bài tập và quản lý lý thuyết day",
    "Nhận doanh thu từ khóa học",
    "Dashboard analytics chi tiết",
    "Hỗ trợ marketing khóa học",
  ]

  const benefits = userType === "student" ? studentBenefits : instructorBenefits

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Benefits */}
            <div className="hidden lg:block">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">EduLearn</h1>
                  <p className="text-sm text-gray-600">Nền tảng học trực tuyến hàng đầu</p>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {userType === "student" ? "Nâng cao kỹ năng" : "Chia sẻ kiến thức"}
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {userType === "student"
                    ? "Học từ các chuyên gia hàng đầu và phát triển sự nghiệp của bạn."
                    : "Trở thành giảng viên và chia sẻ kiến thức của bạn với hàng ngàn học viên."}
                </p>

                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Form Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 zoom-in">
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng nhập</h2>
                <p className="text-gray-600 text-sm">Chọn vai trò và đăng nhập vào tài khoản</p>
              </div>

              {/* User Type Tabs */}
              <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-full">
                <button
                  onClick={() => setUserType("student")}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                    userType === "student" ? "bg-white text-gray-900 shadow-md" : "text-gray-600"
                  }`}
                >
                  Học sinh
                </button>
                <button
                  onClick={() => setUserType("instructor")}
                  className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
                    userType === "instructor" ? "bg-white text-gray-900 shadow-md" : "text-gray-600"
                  }`}
                >
                  Giảng viên
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      shakeInput ? "shake" : ""
                    }`}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Mật khẩu *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                      shakeInput ? "shake" : ""
                    }`}
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="#" className="text-sm text-indigo-600 hover:underline font-semibold">
                    Quên mật khẩu?
                  </a>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 mt-6"
                >
                  {isLoading ? "Đang đăng nhập..." : `Đăng nhập ${userType === "student" ? "Học sinh" : "Giảng viên"}`}
                </button>

                {/* Toggle to Register */}
                <p className="text-center text-sm text-gray-600 pt-2">
                  Chưa có tài khoản?{" "}
                  <Link href="/register" className="text-indigo-600 hover:underline font-semibold">
                    Đăng ký ngay
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .shake {
            animation: shake 0.5s ease-in-out;
          }
          .zoom-in {
            animation: zoomIn 0.3s ease-out;
          }
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
      <Footer />
    </>
  )
}
