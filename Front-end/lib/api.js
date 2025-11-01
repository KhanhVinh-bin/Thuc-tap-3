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
    // First, get or create a cart for the user
    let cartId = addToCartData.cartId
    
    if (!cartId) {
      // Get user's cart or create one if it doesn't exist
      try {
        const userCart = await this.getCartByUser(addToCartData.userId)
        cartId = userCart.cartId
      } catch (error) {
        // If no cart exists, create one
        const newCart = await this.createCart({ userId: addToCartData.userId })
        cartId = newCart.cartId
      }
    }

    // Add item to cart using CartItems endpoint
    const cartItemData = {
      cartId: cartId,
      courseId: addToCartData.courseId,
      quantity: addToCartData.quantity || 1
    }

    return this.fetchData("/CartItems", {
      method: "POST",
      body: JSON.stringify(cartItemData),
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
    // Ensure the data structure matches CartItemCreateDTO
    const createData = {
      cartId: cartItemData.cartId,
      courseId: cartItemData.courseId,
      quantity: cartItemData.quantity || 1
    }

    return this.fetchData("/CartItems", {
      method: "POST",
      body: JSON.stringify(createData),
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

  // Order API methods
  async createOrder(orderData) {
    return this.fetchData("/Orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    })
  }

  async getOrderById(orderId) {
    return this.fetchData(`/Orders/${orderId}`)
  }

  async getOrdersByUser(userId) {
    return this.fetchData(`/Orders/ByUser/${userId}`)
  }

  async updateOrderStatus(orderId, status) {
    return this.fetchData(`/Orders/${orderId}/Status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  }
}

// Helper function to format course data from API
export const formatCourseData = (courseData) => {
  if (!courseData) {
    console.warn('formatCourseData: courseData is null or undefined')
    return null
  }
  
  console.log('formatCourseData input:', courseData)

  const formatVND = (value) =>
    value ? `${value.toLocaleString("vi-VN")}đ` : "Miễn phí"

  // Xử lý thumbnailUrl - hỗ trợ cả PascalCase và camelCase
  const thumbnailUrlRaw = courseData.ThumbnailUrl || courseData.thumbnailUrl || null
  let thumbnailUrl = "/placeholder.jpg"
  
  if (thumbnailUrlRaw) {
    if (thumbnailUrlRaw.startsWith("http://") || thumbnailUrlRaw.startsWith("https://")) {
      thumbnailUrl = thumbnailUrlRaw
    } else {
      thumbnailUrl = thumbnailUrlRaw.startsWith("/") 
        ? thumbnailUrlRaw 
        : `/${thumbnailUrlRaw.replace(/^\/+/, "")}`
    }
  }

  // Xử lý previewVideoUrl - hỗ trợ cả PascalCase và camelCase
  const previewVideoUrlRaw = courseData.PreviewVideoUrl || courseData.previewVideoUrl || null
  let previewVideoUrl = ""
  
  if (previewVideoUrlRaw) {
    // Nếu là URL YouTube, convert sang embed format
    if (previewVideoUrlRaw.includes('youtube.com') || previewVideoUrlRaw.includes('youtu.be')) {
      let videoId = previewVideoUrlRaw
      if (previewVideoUrlRaw.includes('/watch?v=')) {
        videoId = previewVideoUrlRaw.split('/watch?v=')[1].split('&')[0]
      } else if (previewVideoUrlRaw.includes('youtu.be/')) {
        videoId = previewVideoUrlRaw.split('youtu.be/')[1].split('?')[0]
      } else if (previewVideoUrlRaw.includes('embed/')) {
        // Đã là embed URL, giữ nguyên
        previewVideoUrl = previewVideoUrlRaw
      } else {
        videoId = previewVideoUrlRaw.split('/').pop().split('?')[0]
      }
      if (!previewVideoUrl) {
        previewVideoUrl = `https://www.youtube.com/embed/${videoId}`
      }
    } else if (previewVideoUrlRaw.startsWith('http://') || previewVideoUrlRaw.startsWith('https://')) {
      previewVideoUrl = previewVideoUrlRaw
    } else {
      // Nếu là đường dẫn file, thêm prefix nếu cần
      previewVideoUrl = previewVideoUrlRaw.startsWith('/') 
        ? previewVideoUrlRaw 
        : `/${previewVideoUrlRaw}`
    }
  }

  const priceValue = courseData.Price || courseData.price || 0

  const result = {
    id: courseData.CourseId || courseData.courseId,
    courseId: courseData.CourseId || courseData.courseId,
    title: courseData.Title || courseData.title || "Khóa học",
    description: courseData.Description || courseData.description || "Mô tả khóa học",
    price: formatVND(priceValue),
    priceValue: priceValue, // Giá trị số để tính toán
    oldPrice: priceValue ? formatVND(priceValue * 1.5) : "",
    discount: priceValue ? "33" : "0",
    image: thumbnailUrl,
    thumbnailUrl: thumbnailUrl, // Thêm để tongquan component sử dụng
    previewVideoUrl: previewVideoUrl,
    category: courseData.Category?.CategoryName || courseData.Category?.categoryName || courseData.category?.CategoryName || courseData.category?.categoryName || "Lập trình",
    categoryId: courseData.CategoryId || courseData.categoryId || courseData.Category?.CategoryId || courseData.Category?.categoryId || courseData.category?.CategoryId || courseData.category?.categoryId || null,
    level: courseData.Level || courseData.level || "Cơ bản",
    language: courseData.Language || courseData.language || "Tiếng Việt",
    duration: courseData.Duration || courseData.duration || "20 giờ",
    rating:
      courseData.Instructor?.RatingAverage || courseData.Instructor?.ratingAverage || courseData.instructor?.RatingAverage || courseData.instructor?.ratingAverage || (Math.random() * 5).toFixed(1),
    reviews: Math.floor(Math.random() * 500) + 100,
    totalStudents: courseData.Instructor?.TotalStudents || courseData.Instructor?.totalStudents || courseData.instructor?.TotalStudents || courseData.instructor?.totalStudents || 0,
    students: (courseData.Instructor?.TotalStudents || courseData.Instructor?.totalStudents || courseData.instructor?.TotalStudents || courseData.instructor?.totalStudents)
      ? `${Math.floor((courseData.Instructor?.TotalStudents || courseData.Instructor?.totalStudents || courseData.instructor?.TotalStudents || courseData.instructor?.totalStudents) / 1000)}k`
      : `${Math.floor(Math.random() * 200) + 50}k`,
    instructor: {
      name: courseData.Instructor?.Expertise || courseData.Instructor?.expertise || courseData.instructor?.Expertise || courseData.instructor?.expertise || "Giảng viên",
      expertise: courseData.Instructor?.Expertise || courseData.Instructor?.expertise || courseData.instructor?.Expertise || courseData.instructor?.expertise,
      bio: courseData.Instructor?.Biography || courseData.Instructor?.biography || courseData.instructor?.Biography || courseData.instructor?.biography || "Chuyên gia trong lĩnh vực lập trình",
      avatar: (courseData.Instructor?.AvatarUrl || courseData.Instructor?.avatarUrl || courseData.instructor?.AvatarUrl || courseData.instructor?.avatarUrl)
        ? ((courseData.Instructor?.AvatarUrl || courseData.Instructor?.avatarUrl || courseData.instructor?.AvatarUrl || courseData.instructor?.avatarUrl).startsWith("http")
          ? (courseData.Instructor?.AvatarUrl || courseData.Instructor?.avatarUrl || courseData.instructor?.AvatarUrl || courseData.instructor?.avatarUrl)
          : `/${(courseData.Instructor?.AvatarUrl || courseData.Instructor?.avatarUrl || courseData.instructor?.AvatarUrl || courseData.instructor?.avatarUrl).replace(/^\/+/, "")}`)
        : "/placeholder-user.jpg",
      experience: courseData.Instructor?.ExperienceYears || courseData.Instructor?.experienceYears || courseData.instructor?.ExperienceYears || courseData.instructor?.experienceYears || 5,
      totalStudents: courseData.Instructor?.TotalStudents || courseData.Instructor?.totalStudents || courseData.instructor?.TotalStudents || courseData.instructor?.totalStudents || 1000,
      totalCourses: courseData.Instructor?.TotalCourses || courseData.Instructor?.totalCourses || courseData.instructor?.TotalCourses || courseData.instructor?.totalCourses || 10,
      rating: courseData.Instructor?.RatingAverage || courseData.Instructor?.ratingAverage || courseData.instructor?.RatingAverage || courseData.instructor?.ratingAverage || 4.8,
    },
    status: courseData.Status || courseData.status,
    createdAt: courseData.CreatedAt || courseData.createdAt,
    updatedAt: courseData.UpdatedAt || courseData.updatedAt,
  }
  
  console.log('formatCourseData output:', result)
  return result
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

// Order API exports
export const createOrder = apiService.createOrder.bind(apiService)
export const getOrderById = apiService.getOrderById.bind(apiService)
export const getOrdersByUser = apiService.getOrdersByUser.bind(apiService)
export const updateOrderStatus = apiService.updateOrderStatus.bind(apiService)

