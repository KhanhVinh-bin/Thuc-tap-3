"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import "./login.css"

export default function AdminLoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("https://localhost:7166/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: formData.email.trim(), Password: formData.password }),
      })
      const data = await res.json()
      if (res.ok && data.token) {
        setSuccess("Đăng nhập thành công!")
        // Lưu token và thông tin người dùng để dùng cho các trang admin
        try {
          localStorage.setItem("admin_token", data.token)
          if (data.user) localStorage.setItem("admin_user", JSON.stringify(data.user))
        } catch {}
        // Redirect to admin dashboard after successful login
        setTimeout(() => {
          router.push("/admin/dashboard")
        }, 800)
      } else {
        setError(data.message || "Email hoặc mật khẩu không đúng")
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="brand">
        <div className="brand-logo" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#3b82f6"/>
            <path d="M8 8h8v8H8z" fill="none" stroke="white" strokeWidth="1.5"/>
            <path d="M12 8v8M8 12h8" stroke="white" strokeWidth="1"/>
          </svg>
        </div>
        <h1 className="brand-title">EduLearn</h1>
        <p className="brand-subtitle">Nền tảng học trực tuyến hàng đầu</p>
      </div>

      <div className="login-card">
        <h2 className="card-title">Chào mừng bạn</h2>
        <p className="card-desc">Đăng nhập để bắt đầu hành trình học tập của bạn.</p>

        <div className="tab-container">
          <div className="tab active">Đăng nhập</div>
          <div className="tab inactive">Đăng ký</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              className="input"
              placeholder="admin@edulearn.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu:</label>
            <input
              id="password"
              name="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && <div className="alert error" role="alert">{error}</div>}
          {success && <div className="alert success" role="status">{success}</div>}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  )
}