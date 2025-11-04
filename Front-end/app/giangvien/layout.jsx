"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"

// Dynamic import AvatarMenu để tránh SSR issues
const AvatarMenu = dynamic(() => import("./components/AvatarMenu"), { ssr: false })

export default function GiangVienLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, token, loading } = useAuth()
  const [avatarContainer, setAvatarContainer] = useState(null)

  useEffect(() => {
    // Đợi auth load xong
    if (loading) return

    // Kiểm tra token từ localStorage trực tiếp (vì state có thể chưa update sau khi login)
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem("currentUser") : null
    
    // Nếu không có token hoặc user trong localStorage
    if (!storedToken || !storedUser) {
      // Kiểm tra xem có phải đang từ redirect từ login không (tránh loop)
      const searchParams = new URLSearchParams(window.location.search)
      const isRedirect = searchParams.has('redirect')
      
      if (!isRedirect) {
        // Redirect về login với return URL
        const returnUrl = encodeURIComponent(pathname)
        router.push(`/login?redirect=${returnUrl}`)
      }
      return
    }

    // Parse user từ localStorage
    let parsedUser = null
    try {
      parsedUser = JSON.parse(storedUser)
    } catch (e) {
      console.error("Error parsing stored user:", e)
    }

    // Kiểm tra role instructor
    const userRole = (parsedUser?.role || parsedUser?.type || user?.role || user?.type || "").toLowerCase()
    const isInstructor = userRole === "instructor" || userRole === "giảng viên" || userRole.includes("instructor")

    if (!isInstructor) {
      // Nếu không phải instructor, redirect về trang chủ
      router.push("/")
      return
    }
  }, [user, token, loading, router, pathname])

  // Tìm và tạo container cho AvatarMenu khi DOM ready
  useEffect(() => {
    if (typeof window === 'undefined' || loading || !user) {
      setAvatarContainer(null)
      return
    }
    
    const findAndPrepareContainer = () => {
      const topbarRight = document.querySelector('.gv-topbar-right')
      if (!topbarRight) return
      
      // Ẩn avatar mặc định
      const defaultAvatar = topbarRight.querySelector('.gv-avatar')
      if (defaultAvatar) {
        defaultAvatar.style.display = 'none'
      }
      
      // Tìm hoặc tạo container
      let container = topbarRight.querySelector('[data-avatar-menu-injected]')
      if (!container) {
        container = document.createElement('div')
        container.setAttribute('data-avatar-menu-injected', 'true')
        container.className = 'instructor-avatar-menu-container'
        topbarRight.appendChild(container)
      }
      
      setAvatarContainer(container)
    }
    
    // Thử tìm ngay
    findAndPrepareContainer()
    
    // Lắng nghe DOM changes
    const observer = new MutationObserver(findAndPrepareContainer)
    observer.observe(document.body, { childList: true, subtree: true })
    
    // Timeout fallback
    const timeout = setTimeout(findAndPrepareContainer, 300)
    
    return () => {
      observer.disconnect()
      clearTimeout(timeout)
      setAvatarContainer(null)
    }
  }, [loading, user])

  // Hiển thị loading khi đang kiểm tra auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // Kiểm tra từ localStorage thay vì state (vì state có thể chưa update)
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null
  const storedUser = typeof window !== 'undefined' ? localStorage.getItem("currentUser") : null
  
  // Không render nếu chưa auth
  if (!storedToken || !storedUser) {
    return null
  }

  // Parse user từ localStorage
  let parsedUser = null
  try {
    parsedUser = JSON.parse(storedUser)
  } catch (e) {
    return null
  }

  const userRole = (parsedUser?.role || parsedUser?.type || user?.role || user?.type || "").toLowerCase()
  const isInstructor = userRole === "instructor" || userRole === "giảng viên" || userRole.includes("instructor")

  if (!isInstructor) {
    return null
  }

  return (
    <>
      {children}
      {/* Render AvatarMenu vào container bằng Portal - vẫn trong React tree nên có access đến AuthProvider */}
      {avatarContainer && typeof window !== 'undefined' && 
        createPortal(<AvatarMenu />, avatarContainer)
      }
    </>
  )
}

