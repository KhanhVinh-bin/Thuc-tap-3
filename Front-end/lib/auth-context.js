"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { getCurrentUser, logout as logoutAPI } from "@/app/(Home)/services/API"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

useEffect(() => {
  const storedUser = getCurrentUser()
  if (storedUser) {
    setUser(storedUser)
  } else {
    setUser(null)
  }
  setLoading(false)
}, [])


const login = (userData) => {
  setUser(userData)
  localStorage.setItem("user", JSON.stringify(userData))
}

const logout = () => {
  logoutAPI()
  localStorage.removeItem("currentUser") // <- đảm bảo gọi dòng này
  setUser(null)
}



const isAuthenticated = () => {
  const storedUser = localStorage.getItem("currentUser")
  return !!user && !!storedUser
}


  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}