"use client"

import { useState, useEffect } from "react"

export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState(false)

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()

    // Simulate validation
    if (password.length < 6) {
      setError(true)
      const input = document.querySelector('input[type="password"]')
      input.classList.add("shake")

      setTimeout(() => {
        input.classList.remove("shake")
        setError(false)
      }, 500)
      return
    }

    // Success - close modal
    onClose()
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 modal-content">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{isLogin ? "Đăng nhập" : "Đăng ký"}</h2>
            <button onClick={onClose} className="text-white-400 hover:text-white-600 text-2xl leading-none">
              ×
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-white-200">
            <button
              onClick={() => setIsLogin(true)}
              className={`pb-3 px-4 font-semibold transition-colors ${
                isLogin ? "text-purple-600 border-b-2 border-purple-600" : "text-white-500 hover:text-white-700"
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`pb-3 px-4 font-semibold transition-colors ${
                !isLogin ? "text-purple-600 border-b-2 border-purple-600" : "text-white-500 hover:text-white-700"
              }`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-white-700 mb-2">Họ và tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-white-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-white-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all"
                placeholder="Nhập email của bạn"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white-700 mb-2">Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none transition-all ${
                  error ? "border-red-500" : "border-white-300"
                }`}
                placeholder="Nhập mật khẩu"
                required
              />
              {error && <p className="text-red-500 text-sm mt-2">Mật khẩu phải có ít nhất 6 ký tự</p>}
            </div>

            {isLogin && (
              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-white-600">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-purple-600 hover:text-purple-700">
                  Quên mật khẩu?
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all hover:shadow-lg"
            >
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-white-500">Hoặc tiếp tục với</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-white-300 rounded-lg hover:bg-white-50 transition-colors">
                <span>🔵</span>
                <span className="font-medium">Facebook</span>
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-3 border border-white-300 rounded-lg hover:bg-white-50 transition-colors">
                <span>🔴</span>
                <span className="font-medium">Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
