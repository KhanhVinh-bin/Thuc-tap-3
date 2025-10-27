"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import "./page.css"

export default function GiangVienLoginPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("register")

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (activeTab === "login") {
      if (!email || !password) {
        setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu")
        return
      }
      router.push("/giangvien/tongquan")
      return
    }

    // Register mode validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Vui lòng điền đầy đủ thông tin đăng ký")
      return
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu không khớp, vui lòng kiểm tra lại")
      return
    }
    router.push("/giangvien/tongquan")
  }

  return (
    <div className="gv-login-root">
      <span className="gv-deco-circle" aria-hidden="true" />

      <div className="gv-brand-stack">
        <span className="gv-brand-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1e3a8a">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </span>
        <div className="gv-brand-title">EduLearn</div>
        <div className="gv-brand-subtitle">Nền tảng học trực tuyến hàng đầu</div>
      </div>

      <div className="gv-login-card">
        <div className="gv-card-header">
          <div className="gv-card-title">Chào mừng bạn</div>
          <div className="gv-card-desc">
            Đăng nhập hoặc tạo tài khoản để bắt đầu hành trình học tập của bạn.
          </div>
        </div>

        <div className="gv-segment">
          <button
            type="button"
            className={`gv-segment-btn ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`gv-segment-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Đăng ký
          </button>
        </div>

        <form className="gv-login-form" onSubmit={handleSubmit}>
          {activeTab === "register" && (
            <label className="gv-field">
              <span className="gv-label">Họ và tên</span>
              <input
                className="gv-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                autoComplete="name"
              />
            </label>
          )}

          <label className="gv-field">
            <span className="gv-label">Email</span>
            <input
              className="gv-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete={activeTab === "login" ? "username" : "email"}
            />
          </label>

          <label className="gv-field">
            <span className="gv-label">Mật khẩu</span>
            <input
              className="gv-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={activeTab === "login" ? "current-password" : "new-password"}
            />
          </label>

          {activeTab === "register" && (
            <label className="gv-field">
              <span className="gv-label">Xác nhận lại mật khẩu</span>
              <input
                className="gv-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </label>
          )}

          {error && <div className="gv-error">{error}</div>}

          <button type="submit" className="gv-btn-primary">{activeTab === "register" ? "Đăng ký" : "Đăng nhập"}</button>
        </form>

        <div className="gv-divider-labeled"><span>Hoặc đăng nhập bằng</span></div>

        <div className="gv-social">
          <button type="button" className="gv-social-btn google" aria-label="Đăng nhập bằng Google">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#fff" />
              <path d="M12 5v2.5h4.5c.2.6.3 1.2.3 1.9 0 4-2.7 6.6-6.7 6.6a6.9 6.9 0 0 1-6.8-6.9 6.9 6.9 0 0 1 6.8-6.9c1.9 0 3.5.7 4.7 1.8l-2 2A4.6 4.6 0 0 0 12 5z" fill="#4285F4" />
              <path d="M5.6 9.7a4.3 4.3 0 0 1 2.5-3.9l2 2.1c-.6.4-1 .9-1.2 1.6H5.6z" fill="#FBBC05" />
              <path d="M12.1 18.9c1.8 0 3.3-.6 4.4-1.6l-2.1-1.7c-.6.4-1.4.6-2.3.6-1.8 0-3.4-1.2-4-2.9H5.6v1.8a6.9 6.9 0 0 0 6.5 3.8z" fill="#34A853" />
              <path d="M18.6 11.4c0-.6-.1-1.2-.3-1.8H12v3.4h3.7c-.2.9-.8 1.7-1.6 2.2l2.1 1.7c1.3-1.1 2.1-2.8 2.1-5.5z" fill="#EA4335" />
            </svg>
            <span>Google</span>
          </button>

          <button type="button" className="gv-social-btn facebook" aria-label="Đăng nhập bằng Facebook">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#1877F2" />
              <path d="M13.5 12H12v6h-2.3v-6H8.5v-2h1.2V9.4c0-1.1.3-2.7 2.7-2.7h1.9v2h-1.4c-.4 0-.9.2-.9.8V10h2.1l-.1 2z" fill="#fff" />
            </svg>
            <span>Facebook</span>
          </button>
        </div>
      </div>
    </div>
  )
}