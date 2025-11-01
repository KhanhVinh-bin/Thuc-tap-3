"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getCurrentUser, logout as logoutAPI } from "@/app/(Home)/services/API"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // 🔹 Lấy user và token khi load trang
  useEffect(() => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    const storedToken = localStorage.getItem("authToken");
    
    if (storedUser) {
      setUser(storedUser);
    } else {
      setUser(null);
    }
    
    if (storedToken) {
      setToken(storedToken);
    } else {
      setToken(null);
    }
  } catch (error) {
    console.error("❌ Lỗi khi đọc user/token từ localStorage:", error);
    setUser(null);
    setToken(null);
  } finally {
    setLoading(false);
  }
}, []);


  // 🔹 Khi login thành công
  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem("currentUser", JSON.stringify(userData))
    localStorage.setItem("authToken", authToken)
  }

  // 🔹 Khi logout
  const logout = () => {
    logoutAPI() // gọi hàm logout trong API.js
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
    setUser(null)
    setToken(null)
  }

  // 🔹 Kiểm tra đăng nhập
  const isAuthenticated = (() => {
    if (typeof window === 'undefined') return false
    if (!user) return false
    const storedUser = localStorage.getItem("currentUser")
    return !!(user && storedUser)
  })()

  const value = {
    user,
    token,
    login,
    logout,
    isAuthenticated,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 🔹 Hook tiện dụng để dùng Auth ở mọi nơi
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
