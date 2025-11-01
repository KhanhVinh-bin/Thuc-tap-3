"use client"

import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  // 🔹 Load giỏ hàng từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    }
  }, [])

  // 🔹 Lưu giỏ hàng vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart])

  // ➕ Thêm khóa học vào giỏ
  const addToCart = (course) => {
    setCart((prev) => {
      const already = prev.find((item) => item.id === course.id)
      if (already) return prev
      return [...prev, course]
    })
  }

  // ❌ Xóa khóa học khỏi giỏ
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  // 🔎 Kiểm tra xem khóa học có trong giỏ không
  const isInCart = (id) => {
    return cart.some((item) => item.id === id)
  }

  // 🔢 Đếm tổng số item trong giỏ
  const getCartItemsCount = () => {
    return cart.length
  }

  // 💰 Tính tổng tiền giỏ hàng
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price || 0), 0)
  }

  // 🧹 Xóa toàn bộ giỏ
  const clearCart = () => {
    setCart([])
  }

  const value = {
    cart,
    addToCart,
    removeFromCart,
    isInCart,
    getCartItemsCount,
    getCartTotal, // ⚡ thêm dòng này
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  return useContext(CartContext)
}
