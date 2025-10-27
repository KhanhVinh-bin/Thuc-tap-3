"use client"

import { createContext, useContext, useReducer, useEffect } from "react"
import { 
  getCartByUser, 
  addToCartAPI, 
  clearCartAPI, 
  deleteCartItemByCartAndCourse,
  updateCartItem,
  getCartSummaryByUser 
} from "./api"
import { useAuth } from "./auth-context"

// Cart actions
const CART_ACTIONS = {
  ADD_TO_CART: "ADD_TO_CART",
  REMOVE_FROM_CART: "REMOVE_FROM_CART",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  LOAD_CART: "LOAD_CART",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR"
}

// Cart reducer
function cartReducer(state, action) {
  switch (action.type) {
    case CART_ACTIONS.ADD_TO_CART: {
      const existingItem = state.cartItems?.find(item => item.course?.courseId === action.payload.courseId)
      
      if (existingItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.course?.courseId === action.payload.courseId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        }
      }
      
      return {
        ...state,
        cartItems: [...(state.cartItems || []), action.payload]
      }
    }
    
    case CART_ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        cartItems: state.cartItems?.filter(item => item.course?.courseId !== action.payload) || []
      }
    
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { courseId, quantity } = action.payload
      
      if (quantity <= 0) {
        return {
          ...state,
          cartItems: state.cartItems?.filter(item => item.course?.courseId !== courseId) || []
        }
      }
      
      return {
        ...state,
        cartItems: state.cartItems?.map(item =>
          item.course?.courseId === courseId ? { ...item, quantity } : item
        ) || []
      }
    }
    
    case CART_ACTIONS.CLEAR_CART:
      return { ...state, cartItems: [] }
    
    case CART_ACTIONS.LOAD_CART:
      return { ...state, ...action.payload }
    
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case CART_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }
    
    default:
      return state
  }
}

// Create context
const CartContext = createContext()

// Cart provider component
export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, {
    cartItems: [],
    loading: false,
    error: null,
    totalAmount: 0,
    totalItems: 0
  })
  const { user, isAuthenticated } = useAuth()

  // Load cart from API when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      loadCartFromAPI()
    } else {
      // Load from localStorage for guest users
      loadCartFromLocalStorage()
    }
  }, [isAuthenticated, user?.userId])

  // Load cart from API
  const loadCartFromAPI = async () => {
    if (!user?.userId) return

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: null })
      
      const cartData = await getCartByUser(user.userId)
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData })
    } catch (error) {
      console.error("Error loading cart from API:", error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: "Không thể tải giỏ hàng" })
      // Fallback to localStorage
      loadCartFromLocalStorage()
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Load cart from localStorage (for guest users)
  const loadCartFromLocalStorage = () => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Convert localStorage format to API format
        const formattedCart = {
          cartItems: parsedCart.map(item => ({
            course: {
              courseId: item.id,
              title: item.title,
              thumbnailUrl: item.image,
              price: item.price,
              instructorName: item.instructor
            },
            quantity: item.quantity || 1
          })),
          totalAmount: parsedCart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0),
          totalItems: parsedCart.reduce((total, item) => total + (item.quantity || 1), 0)
        }
        dispatch({ type: CART_ACTIONS.LOAD_CART, payload: formattedCart })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }

  // Save cart to localStorage for guest users
  const saveCartToLocalStorage = () => {
    if (!isAuthenticated && cart.cartItems) {
      const localStorageFormat = cart.cartItems.map(item => ({
        id: item.course?.courseId,
        title: item.course?.title,
        image: item.course?.thumbnailUrl,
        price: item.course?.price,
        instructor: item.course?.instructorName,
        quantity: item.quantity
      }))
      localStorage.setItem("cart", JSON.stringify(localStorageFormat))
    }
  }

  // Save to localStorage when cart changes for guest users
  useEffect(() => {
    if (!isAuthenticated) {
      saveCartToLocalStorage()
    }
  }, [cart.cartItems, isAuthenticated])

  // Cart actions
  const addToCart = async (course) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: null })

      if (isAuthenticated && user?.userId) {
        // Add to cart via API
        const addToCartData = {
          userId: user.userId,
          courseId: course.id || course.courseId,
          quantity: 1
        }
        
        await addToCartAPI(addToCartData)
        // Reload cart from API to get updated data
        await loadCartFromAPI()
      } else {
        // Add to local cart for guest users
        const cartItem = {
          course: {
            courseId: course.id || course.courseId,
            title: course.title,
            thumbnailUrl: course.image,
            price: typeof course.price === 'string' 
              ? parseFloat(course.price.replace(/[^\d]/g, '')) 
              : course.price,
            instructorName: course.instructor?.name || course.instructor
          },
          quantity: 1
        }
        dispatch({ type: CART_ACTIONS.ADD_TO_CART, payload: cartItem })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: "Không thể thêm vào giỏ hàng" })
    }
  }

  const removeFromCart = async (courseId) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: null })

      if (isAuthenticated && user?.userId && cart.cartId) {
        // Remove from cart via API
        await deleteCartItemByCartAndCourse(cart.cartId, courseId)
        // Reload cart from API
        await loadCartFromAPI()
      } else {
        // Remove from local cart for guest users
        dispatch({ type: CART_ACTIONS.REMOVE_FROM_CART, payload: courseId })
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: "Không thể xóa khỏi giỏ hàng" })
    }
  }

  const updateQuantity = async (courseId, quantity) => {
    try {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: null })

      if (isAuthenticated && user?.userId) {
        // Find cart item
        const cartItem = cart.cartItems?.find(item => item.course?.courseId === courseId)
        if (cartItem) {
          await updateCartItem(cartItem.cartItemId, { quantity })
          // Reload cart from API
          await loadCartFromAPI()
        }
      } else {
        // Update local cart for guest users
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { courseId, quantity } })
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: "Không thể cập nhật số lượng" })
    }
  }

  const clearCart = async () => {
    try {
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: null })

      if (isAuthenticated && user?.userId) {
        // Clear cart via API
        await clearCartAPI(user.userId)
        // Reload cart from API
        await loadCartFromAPI()
      } else {
        // Clear local cart for guest users
        dispatch({ type: CART_ACTIONS.CLEAR_CART })
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      dispatch({ type: CART_ACTIONS.SET_ERROR, payload: "Không thể xóa giỏ hàng" })
    }
  }

  const getCartTotal = () => {
    return cart.totalAmount || cart.cartItems?.reduce((total, item) => {
      const price = typeof item.course?.price === 'string' 
        ? parseFloat(item.course.price.replace(/[^\d]/g, '')) 
        : item.course?.price || 0
      return total + (price * item.quantity)
    }, 0) || 0
  }

  const getCartItemsCount = () => {
    return cart.totalItems || cart.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0
  }

  const isInCart = (courseId) => {
    return cart.cartItems?.some(item => item.course?.courseId === courseId) || false
  }

  const value = {
    cart: cart.cartItems || [],
    cartData: cart,
    loading: cart.loading,
    error: cart.error,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    loadCartFromAPI,
    isAuthenticated,
    user
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use cart context
export function useCart() {
  const context = useContext(CartContext)
  
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  
  return context
}