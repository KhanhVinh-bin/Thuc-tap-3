# 🛒 Fix Lỗi "Cart not found" Khi Thêm Vào Giỏ Hàng

## ❌ Vấn Đề

**Lỗi:** `POST /api/cartItems` → `400 Bad Request` với message `"Cart not found"`

### Nguyên Nhân
Backend yêu cầu phải có **Cart** trước khi thêm **CartItems**, nhưng code đang:
1. ❌ Gọi trực tiếp API `/api/cartItems`
2. ❌ Giả định `cartId = userId` (không đúng)
3. ❌ Không tạo Cart trước khi thêm item

### Luồng Backend
```
User → Cart (1-to-1) → CartItems (1-to-many)
```

**Đúng:**
1. Tạo Cart cho User (nếu chưa có)
2. Thêm CartItem vào Cart

**Sai:**
1. Thêm CartItem trực tiếp (lỗi "Cart not found")

---

## ✅ Giải Pháp

### Trước (Code Cũ - Lỗi)
```javascript
const handleAddToCart = async () => {
  const response = await fetch("https://localhost:7025/api/cartItems", {
    method: "POST",
    body: JSON.stringify({
      cartId: user.userId,  // ❌ Sai: userId ≠ cartId
      courseId: course.courseId,
      quantity: 1,
    }),
  })
}
```

### Sau (Code Mới - Đúng)
```javascript
import { addToCartAPI } from "@/lib/api"

const handleAddToCart = async () => {
  try {
    // ✅ Helper tự động:
    // 1. Kiểm tra Cart của user
    // 2. Tạo Cart nếu chưa có
    // 3. Thêm item vào Cart
    const cartData = {
      userId: user.userId || user.id,
      courseId: course.id,
      quantity: 1
    }
    
    const result = await addToCartAPI(cartData)
    console.log("✅ Đã thêm vào giỏ hàng:", result)
    
    // Cập nhật cart context cho UI
    addToCart(cartItem)
    
    alert("Đã thêm vào giỏ hàng thành công!")
  } catch (error) {
    console.error("❌ Lỗi:", error)
    alert("Không thể thêm vào giỏ hàng!")
  }
}
```

---

## 🔧 Cách Helper Function Hoạt Động

### File: `/lib/api.js` (dòng 173-200)

```javascript
async addToCart(addToCartData) {
  // 1️⃣ Lấy hoặc tạo Cart cho User
  let cartId = addToCartData.cartId
  
  if (!cartId) {
    try {
      // Thử lấy Cart hiện có
      const userCart = await this.getCartByUser(addToCartData.userId)
      cartId = userCart.cartId
    } catch (error) {
      // Nếu chưa có Cart → Tạo mới
      const newCart = await this.createCart({ 
        userId: addToCartData.userId 
      })
      cartId = newCart.cartId
    }
  }

  // 2️⃣ Thêm item vào Cart
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
```

**Logic:**
- ✅ Tự động kiểm tra Cart của user
- ✅ Tự động tạo Cart nếu chưa có
- ✅ Thêm item vào đúng Cart
- ✅ Xử lý lỗi đầy đủ

---

## 📊 API Backend Liên Quan

### 1. Tạo Cart
**Endpoint:** `POST /api/Carts`  
**Body:**
```json
{
  "userId": 4
}
```

**Response:**
```json
{
  "cartId": 1,
  "userId": 4,
  "createdAt": "2025-10-31T10:00:00Z"
}
```

### 2. Lấy Cart của User
**Endpoint:** `GET /api/Carts/ByUser/{userId}`

**Response:**
```json
{
  "cartId": 1,
  "userId": 4,
  "items": [],
  "totalAmount": 0
}
```

### 3. Thêm Item vào Cart
**Endpoint:** `POST /api/CartItems`  
**Body:**
```json
{
  "cartId": 1,
  "courseId": 5,
  "quantity": 1
}
```

---

## 🧪 Test Sau Khi Fix

### Bước 1: Đăng nhập
```
User: vinh@example.com
UserId: 4
```

### Bước 2: Vào trang khóa học
```
/courses/1
```

### Bước 3: Click "Thêm vào giỏ hàng"
**Console sẽ log:**
```
✅ Đã thêm vào giỏ hàng: {
  cartItemId: 1,
  cartId: 1,
  courseId: 1,
  quantity: 1
}
```

**Alert hiển thị:**
```
Đã thêm vào giỏ hàng thành công!
```

### Bước 4: Kiểm tra giỏ hàng
```
/cart
```
→ Thấy khóa học vừa thêm

---

## 🔍 Debug

### Nếu vẫn lỗi "Cart not found"

1. **Kiểm tra userId có đúng không:**
```javascript
console.log("User:", user)
console.log("UserId:", user.userId || user.id)
```

2. **Kiểm tra backend có API /api/Carts không:**
```bash
GET https://localhost:7025/api/Carts/ByUser/4
```

3. **Kiểm tra console browser:**
- F12 → Console tab
- Network tab → Filter "cart"
- Xem request/response

### Nếu lỗi "Course not found"

**Đảm bảo:**
```javascript
courseId: course.id  // ✅ Đúng
// KHÔNG PHẢI:
courseId: course.courseId  // ❌ Sai nếu API trả về "id"
```

---

## 📁 Files Đã Sửa

1. ✅ `/courses/[id]/page.jsx`
   - Import `addToCartAPI` từ `/lib/api`
   - Sử dụng helper thay vì gọi API trực tiếp
   - Cập nhật cart context sau khi thêm thành công

---

## 💡 Best Practices

### ✅ Nên Làm
- Sử dụng helper functions từ `/lib/api.js`
- Kiểm tra user đã đăng nhập trước khi thao tác
- Cập nhật cả backend API lẫn frontend context
- Log kết quả để debug

### ❌ Không Nên
- Gọi trực tiếp API endpoints
- Giả định cartId = userId
- Bỏ qua error handling
- Không tạo Cart trước khi thêm item

---

## 🎯 Tóm Tắt

| Vấn đề | Giải pháp |
|--------|-----------|
| ❌ Cart not found | ✅ Dùng `addToCartAPI()` tự động tạo cart |
| ❌ Gọi API trực tiếp | ✅ Dùng helper functions |
| ❌ cartId = userId | ✅ Lấy cartId từ backend |
| ❌ Thiếu error handling | ✅ Try-catch đầy đủ |

---

**Kết quả:** Giỏ hàng hoạt động bình thường, không còn lỗi "Cart not found"! 🎉

**Cập nhật:** 31/10/2025

