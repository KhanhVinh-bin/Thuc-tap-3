"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Settings, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

export default function AvatarMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  // Đóng menu khi click ra ngoài hoặc nhấn Escape
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowUserMenu(false)
    }
    document.addEventListener("mousedown", handleOutsideClick)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  const currentUser = user
  // Chuẩn hóa tên và email giống header tổng
  const userName =
    currentUser?.fullName ||
    currentUser?.FullName ||
    currentUser?.name ||
    currentUser?.Name ||
    currentUser?.email ||
    "Tài khoản"
  const userEmail = currentUser?.email || currentUser?.Email || ""
  const userInitial = (userName || "U").charAt(0).toUpperCase()
  // Lấy avatar URL từ user
  const userAvatar = currentUser?.avatarUrl || currentUser?.AvatarUrl || null

  const handleLogout = () => {
    try {
      logout()
      setShowUserMenu(false)
      router.push("/")
    } catch (err) {
      console.error("Đăng xuất thất bại:", err)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      {currentUser ? (
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F6F4FF] transition-all duration-200 group"
            aria-haspopup="menu"
            aria-expanded={showUserMenu}
          >
            <div className="w-9 h-9 rounded-full bg-[#6B5EDB] flex items-center justify-center text-white font-medium group-hover:ring-2 group-hover:ring-[#6B5EDB] group-hover:ring-offset-2 transition-all duration-200 overflow-hidden relative">
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={userName}
                  fill
                  className="object-cover"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <span className="text-sm font-medium text-gray-800">{userName}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border animate-fade-in">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-sm text-gray-500">{userEmail}</p>
              </div>

              {/* XÓA HỌC TẬP THEO YÊU CẦU */}

              <button
                onClick={() => {
                  setShowUserMenu(false)
                  router.push("/giangvien/caidat")
                }}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#F6F4FF] transition"
              >
                <Settings className="w-4 h-4 mr-2 text-[#6B5EDB]" />
                Cài đặt
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 border-t border-gray-100 hover:bg-[#F6F4FF] transition"
              >
                <LogOut className="w-4 h-4 mr-2 text-red-500" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-9 h-9 rounded-full bg-gray-200" aria-hidden="true" />
      )}
    </div>
  )
}