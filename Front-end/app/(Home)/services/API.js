// ✅ Bật/tắt fake API ở đây
const USE_MOCK = false // 👉 true = dùng dữ liệu giả, false = gọi API thật

// 🧪 Dữ liệu giả cho chế độ mock
let mockUsers = [
  { userId: 1, email: "test@gmail.com", password: "123456", fullName: "Test User" }
]

const API_URL = "https://localhost:7025/api/Users"

// 👉 ĐĂNG NHẬP
export const loginUser = async (email, password) => {
  if (USE_MOCK) {
    const user = mockUsers.find(u => u.email === email && u.password === password)
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user))
      return { success: true, user }
    }
    return { success: false, message: "Email hoặc mật khẩu không chính xác" }
  }

  try {
    const res = await fetch(`${API_URL}/Login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error("❌ Phản hồi không phải JSON:", text)
      return { success: false, message: "Phản hồi server không hợp lệ" }
    }

    if (!res.ok) {
      return { success: false, message: data?.message || "Đăng nhập thất bại" }
    }

    // ✅ Lưu thông tin user vào localStorage (sử dụng key đúng)
    localStorage.setItem("currentUser", JSON.stringify(data))
    if (data.token) {
      localStorage.setItem("authToken", data.token)
    }
    console.log("✅ Đã lưu user:", data)

    return { success: true, user: data }
  } catch (err) {
    console.error("❌ Lỗi kết nối API:", err)
    return { success: false, message: err.message }
  }
}

// 👉 ĐĂNG KÝ
export const registerUser = async (email, password, fullName) => {
  if (USE_MOCK) {
    if (mockUsers.some(u => u.email === email)) {
      return { success: false, message: "Email đã tồn tại" }
    }

    const newUser = {
      userId: mockUsers.length + 1,
      email,
      password,
      fullName,
    }
    mockUsers.push(newUser)
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return { success: true, user: newUser }
  }

  try {
    const res = await fetch(`${API_URL}/Register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, fullName }),
    })

    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      console.error("❌ Phản hồi không hợp lệ:", text)
      return { success: false, message: "Server trả về dữ liệu lỗi" }
    }

    if (!res.ok) {
      return { success: false, message: data?.message || "Đăng ký thất bại" }
    }

    // ✅ Lưu user sau khi đăng ký
    localStorage.setItem("currentUser", JSON.stringify(data))
    if (data.token) {
      localStorage.setItem("authToken", data.token)
    }
    console.log("✅ Đã lưu user:", data)

    return { success: true, user: data }
  } catch (err) {
    console.error("❌ Lỗi khi đăng ký:", err)
    return { success: false, message: err.message }
  }
}

// 👉 LẤY USER HIỆN TẠI
export const getCurrentUser = () => {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem("currentUser")
  if (!data) return null

  try {
    return JSON.parse(data)
  } catch {
    console.error("❌ Lỗi parse JSON từ localStorage.currentUser")
    return null
  }
}

// 👉 ĐĂNG XUẤT
export const logout = () => {
  localStorage.removeItem("currentUser")
  localStorage.removeItem("authToken")
}
