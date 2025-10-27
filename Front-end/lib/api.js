// API Configuration
const BASE_URL = "https://localhost:7025/api"

// API Service class
class ApiService {
  constructor() {
    // ✅ Sửa lỗi: dùng BASE_URL chứ không phải API_BASE_URL
    this.baseURL = BASE_URL
  }

  // Generic fetch method with error handling
  async fetchData(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`
      const config = {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      }

      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      throw error
    }
  }

  // Courses API methods
  async getAllCourses() {
    return this.fetchData("/Courses")
  }

  async getCourseById(id) {
    return this.fetchData(`/Courses/${id}`)
  }

  async createCourse(courseData) {
    return this.fetchData("/Courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    })
  }

  async updateCourse(id, courseData) {
    return this.fetchData(`/Courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    })
  }

  async deleteCourse(id) {
    return this.fetchData(`/Courses/${id}`, {
      method: "DELETE",
    })
  }

  // Search courses method
  async searchCourses(query) {
    try {
      const courses = await this.getAllCourses()

      if (!query || query.length < 2) return []

      const lowerQuery = query.toLowerCase()
      return courses
        .filter((course) => {
          return (
            course.title?.toLowerCase().includes(lowerQuery) ||
            course.description?.toLowerCase().includes(lowerQuery) ||
            course.category?.categoryName?.toLowerCase().includes(lowerQuery) ||
            course.level?.toLowerCase().includes(lowerQuery) ||
            course.instructor?.expertise?.toLowerCase().includes(lowerQuery) ||
            course.language?.toLowerCase().includes(lowerQuery)
          )
        })
        .slice(0, 6) // Giới hạn 6 kết quả
    } catch (error) {
      console.error("Search courses error:", error)
      return []
    }
  }

  // Get autocomplete suggestions
  async getAutocompleteSuggestions(query) {
    try {
      const courses = await this.getAllCourses()

      if (!query || query.length < 2) return []

      const suggestions = new Set()
      const lowerQuery = query.toLowerCase()

      courses.forEach((course) => {
        if (course.title?.toLowerCase().includes(lowerQuery)) {
          suggestions.add(course.title)
        }
        if (course.category?.categoryName?.toLowerCase().includes(lowerQuery)) {
          suggestions.add(course.category.categoryName)
        }
        if (course.level?.toLowerCase().includes(lowerQuery)) {
          suggestions.add(course.level)
        }
        if (course.language?.toLowerCase().includes(lowerQuery)) {
          suggestions.add(course.language)
        }
      })

      return Array.from(suggestions).slice(0, 6)
    } catch (error) {
      console.error("Get autocomplete suggestions error:", error)
      return []
    }
  }

  // Reviews API methods
  async getReviewsByCourse(courseId) {
    return this.fetchData(`/Reviews/ByCourse/${courseId}`)
  }

  async createReview(reviewData) {
    return this.fetchData("/Reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  }

  async updateReview(reviewId, reviewData) {
    return this.fetchData(`/Reviews/${reviewId}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    })
  }

  async deleteReview(reviewId) {
    return this.fetchData(`/Reviews/${reviewId}`, {
      method: "DELETE",
    })
  }

  // Carts API methods
  async getAllCarts() {
    return this.fetchData("/Carts")
  }

  async getCartById(cartId) {
    return this.fetchData(`/Carts/${cartId}`)
  }

  async getCartByUser(userId) {
    return this.fetchData(`/Carts/ByUser/${userId}`)
  }

  async getCartSummaryByUser(userId) {
    return this.fetchData(`/Carts/Summary/ByUser/${userId}`)
  }

  async createCart(cartData) {
    return this.fetchData("/Carts", {
      method: "POST",
      body: JSON.stringify(cartData),
    })
  }

  async addToCart(addToCartData) {
    return this.fetchData("/Carts/AddToCart", {
      method: "POST",
      body: JSON.stringify(addToCartData),
    })
  }

  async clearCart(userId) {
    return this.fetchData(`/Carts/Clear/${userId}`, {
      method: "DELETE",
    })
  }

  async deleteCart(cartId) {
    return this.fetchData(`/Carts/${cartId}`, {
      method: "DELETE",
    })
  }

  // CartItems API methods
  async getAllCartItems() {
    return this.fetchData("/CartItems")
  }

  async getCartItem(cartItemId) {
    return this.fetchData(`/CartItems/${cartItemId}`)
  }

  async getCartItemsByCart(cartId) {
    return this.fetchData(`/CartItems/ByCart/${cartId}`)
  }

  async createCartItem(cartItemData) {
    return this.fetchData("/CartItems", {
      method: "POST",
      body: JSON.stringify(cartItemData),
    })
  }

  async updateCartItem(cartItemId, cartItemData) {
    return this.fetchData(`/CartItems/${cartItemId}`, {
      method: "PUT",
      body: JSON.stringify(cartItemData),
    })
  }

  async deleteCartItem(cartItemId) {
    return this.fetchData(`/CartItems/${cartItemId}`, {
      method: "DELETE",
    })
  }

  async deleteCartItemByCartAndCourse(cartId, courseId) {
    return this.fetchData(`/CartItems/ByCartAndCourse?cartId=${cartId}&courseId=${courseId}`, {
      method: "DELETE",
    })
  }

  async increaseCartItemQuantity(cartItemId) {
    return this.fetchData(`/CartItems/${cartItemId}/Increase`, {
      method: "PATCH",
    })
  }

  async decreaseCartItemQuantity(cartItemId) {
    return this.fetchData(`/CartItems/${cartItemId}/Decrease`, {
      method: "PATCH",
    })
  }
}

// Helper function to format course data from API
export const formatCourseData = (courseData) => {
  if (!courseData) return null

  const formatVND = (value) =>
    value ? `${value.toLocaleString("vi-VN")}đ` : "Miễn phí"

  return {
    id: courseData.courseId,
    title: courseData.title || "Khóa học",
    description: courseData.description || "Mô tả khóa học",
    price: formatVND(courseData.price),
    oldPrice: courseData.price ? formatVND(courseData.price * 1.5) : "",
    discount: courseData.price ? "33" : "0",
    image: courseData.thumbnailUrl
      ? courseData.thumbnailUrl.startsWith("http")
        ? courseData.thumbnailUrl
        : `/${courseData.thumbnailUrl.replace(/^\/+/, "")}`
      : "/placeholder.jpg",
    category: courseData.category?.categoryName || "Lập trình",
    level: courseData.level || "Cơ bản",
    language: courseData.language || "Tiếng Việt",
    duration: courseData.duration || "20 giờ",
    rating:
      courseData.instructor?.ratingAverage || (Math.random() * 5).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 100,
    students: courseData.instructor?.totalStudents
      ? `${courseData.instructor.totalStudents}k`
      : `${Math.floor(Math.random() * 200) + 50}k`,
    instructor: {
      name: courseData.instructor?.expertise || "Giảng viên",
      expertise: courseData.instructor?.expertise,
      bio: courseData.instructor?.biography || "Chuyên gia trong lĩnh vực lập trình",
      avatar: courseData.instructor?.avatarUrl
        ? courseData.instructor.avatarUrl.startsWith("http")
          ? courseData.instructor.avatarUrl
          : `/${courseData.instructor.avatarUrl.replace(/^\/+/, "")}`
        : "/placeholder-user.jpg",
      experience: courseData.instructor?.experienceYears || 5,
      totalStudents: courseData.instructor?.totalStudents || 1000,
      totalCourses: courseData.instructor?.totalCourses || 10,
      rating: courseData.instructor?.ratingAverage || 4.8,
    },
    previewVideoUrl: courseData.previewVideoUrl,
    status: courseData.status,
    createdAt: courseData.createdAt,
    updatedAt: courseData.updatedAt,
  }
}

// Helper function to format course list data
export const formatCourseListData = (coursesData) => {
  if (!Array.isArray(coursesData)) return []

  return coursesData.map((course) => {
    const formatted = formatCourseData(course)
    const slug =
      course.title
        ?.toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .trim() || `course-${course.courseId}`
    return {
      ...formatted,
      slug,
    }
  })
}

// Export singleton instance
export const apiService = new ApiService()

// Export individual methods for convenience
// Export singleton instance

// ✅ Giữ nguyên context bằng bind
export const getAllCourses = apiService.getAllCourses.bind(apiService)
export const getCourseById = apiService.getCourseById.bind(apiService)
export const createCourse = apiService.createCourse.bind(apiService)
export const updateCourse = apiService.updateCourse.bind(apiService)
export const deleteCourse = apiService.deleteCourse.bind(apiService)
export const searchCourses = apiService.searchCourses.bind(apiService)
export const getAutocompleteSuggestions = apiService.getAutocompleteSuggestions.bind(apiService)
export const getReviewsByCourse = apiService.getReviewsByCourse.bind(apiService)
export const createReview = apiService.createReview.bind(apiService)
export const updateReview = apiService.updateReview.bind(apiService)
export const deleteReview = apiService.deleteReview.bind(apiService)

// Cart API exports
export const getAllCarts = apiService.getAllCarts.bind(apiService)
export const getCartById = apiService.getCartById.bind(apiService)
export const getCartByUser = apiService.getCartByUser.bind(apiService)
export const getCartSummaryByUser = apiService.getCartSummaryByUser.bind(apiService)
export const createCart = apiService.createCart.bind(apiService)
export const addToCartAPI = apiService.addToCart.bind(apiService)
export const clearCartAPI = apiService.clearCart.bind(apiService)
export const deleteCart = apiService.deleteCart.bind(apiService)

// CartItems API exports
export const getAllCartItems = apiService.getAllCartItems.bind(apiService)
export const getCartItem = apiService.getCartItem.bind(apiService)
export const getCartItemsByCart = apiService.getCartItemsByCart.bind(apiService)
export const createCartItem = apiService.createCartItem.bind(apiService)
export const updateCartItem = apiService.updateCartItem.bind(apiService)
export const deleteCartItem = apiService.deleteCartItem.bind(apiService)
export const deleteCartItemByCartAndCourse = apiService.deleteCartItemByCartAndCourse.bind(apiService)
export const increaseCartItemQuantity = apiService.increaseCartItemQuantity.bind(apiService)
export const decreaseCartItemQuantity = apiService.decreaseCartItemQuantity.bind(apiService)

