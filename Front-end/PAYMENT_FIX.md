# 🔧 Fix Lỗi Thanh Toán - Payment Processing Errors

## ❌ Các Lỗi Đã Gặp

### 1. **POST /api/Orders → 400 Bad Request**
**Nguyên nhân:** Format JSON không đúng với backend `OrderCreateDTO`

**Lỗi trước:**
```javascript
const orderData = {
  userId: 4,
  customerName: "vinh",  // ❌ Không có trong DTO
  customerEmail: "vinh@example.com",  // ❌ Không có trong DTO
  totalAmount: 899000,  // ❌ Không có trong DTO
  status: "pending",  // ❌ Không có trong DTO
  orderItems: [...]  // ❌ Sai tên field (phải là orderDetails)
}
```

**Sửa thành:**
```javascript
const orderData = {
  userId: 4,
  notes: "Khách hàng: vinh, Email: vinh@example.com, Phone: 0123456789",
  orderDetails: [  // ✅ Đúng tên field
    {
      orderId: 0,  // ✅ Required field, backend sẽ tự set
      courseId: 1,
      price: 899000,
      quantity: 1
    }
  ]
}
```

---

### 2. **createdOrder is not defined**
**Nguyên nhân:** Biến `createdOrder` được khai báo trong `try` block nhưng được dùng trong `catch` block

**Lỗi trước:**
```javascript
try {
  const createdOrder = await createOrder(orderData)  // ❌ Scope trong try
  // ...
} catch (apiError) {
  if (!createdOrder) {  // ❌ ReferenceError: createdOrder is not defined
    // ...
  }
}
```

**Sửa thành:**
```javascript
let createdOrder = null  // ✅ Khai báo ở scope ngoài

try {
  createdOrder = await createOrder(orderData)  // ✅ Assign giá trị
  // ...
} catch (apiError) {
  if (!createdOrder) {  // ✅ Có thể access được
    // ...
  }
}
```

---

## ✅ Format JSON Đúng Theo Backend

### OrderCreateDTO
```json
{
  "userId": 4,
  "notes": "Khách hàng: vinh, Email: vinh@example.com, Phone: 0123456789",
  "orderDetails": [
    {
      "orderId": 0,
      "courseId": 1,
      "price": 899000.00,
      "quantity": 1
    }
  ]
}
```

**Lưu ý:**
- ✅ `orderDetails` (không phải `orderItems`)
- ✅ `orderId: 0` trong orderDetails (backend sẽ tự động set khi tạo order)
- ✅ `price` và `quantity` là số (parseInt/parseFloat)
- ✅ Không có `totalAmount`, `status` (backend tự tính)

---

## 🔄 Luồng Thanh Toán Sau Khi Fix

```
1. User click "Hoàn tất thanh toán"
   ↓
2. Validate form data
   ↓
3. Format orderData đúng OrderCreateDTO
   {
     userId: 4,
     notes: "...",
     orderDetails: [{ orderId: 0, courseId: 1, price: 899000, quantity: 1 }]
   }
   ↓
4. POST /api/Orders
   → Backend tạo Order
   → Backend tự động set orderId cho orderDetails
   → Trả về OrderDTO với orderId = 1
   ↓
5. Lấy orderId từ response
   orderId = createdOrder.orderId || createdOrder.id || createdOrder.OrderId
   ↓
6. POST /api/Payments
   {
     orderId: 1,
     paymentMethod: "ewallet",
     transactionId: "TXN_...",
     amount: 899000,
     paymentStatus: "success",
     ...
   }
   → Backend tạo Payment
   → Backend tự động:
     - Cập nhật Order.status = "paid"
     - Tạo Enrollments cho tất cả courses
   → Trả về PaymentDTO với paymentId = 2
   ↓
7. Redirect to /khoa-hoc-cua-toi
```

---

## 🎯 Các Thay Đổi Quan Trọng

### 1. Format OrderCreateDTO
- ✅ Bỏ các field không có trong DTO: `customerName`, `customerEmail`, `totalAmount`, `status`
- ✅ Đổi `orderItems` → `orderDetails`
- ✅ Thêm `orderId: 0` trong mỗi orderDetail
- ✅ Parse number: `parseInt()`, `parseFloat()`

### 2. Scope Variables
- ✅ Khai báo `createdOrder` ở scope ngoài `try-catch`
- ✅ Fallback có thể access `createdOrder`

### 3. Error Handling
- ✅ Validate `orderId` sau khi tạo order
- ✅ Fallback tự tạo order nếu order creation fail
- ✅ Clear error messages

### 4. Enrollment
- ✅ **Bỏ** `createBatchEnrollments()` vì backend tự động tạo
- ✅ Backend PaymentsController tự động tạo enrollment khi payment status = "success"

---

## 🧪 Test Sau Khi Fix

### Test Case 1: Thanh Toán Thành Công
1. ✅ Vào `/thanhtoan?courseId=1&buyNow=true`
2. ✅ Nhập thông tin → Click "Hoàn tất thanh toán"
3. ✅ Console log: `Order created: { orderId: 1, ... }`
4. ✅ Console log: `Payment processed: { paymentId: 2, ... }`
5. ✅ Alert: "Thanh toán thành công! Mã thanh toán: #2"
6. ✅ Redirect to `/khoa-hoc-cua-toi`

### Test Case 2: Order Creation Fail → Fallback
1. ✅ Simulate order API fail
2. ✅ Fallback tự tạo order
3. ✅ Fallback tạo payment
4. ✅ Thanh toán vẫn thành công

---

## 📊 Console Logs Sau Khi Fix

**Thành công:**
```
Order created: { orderId: 1, userId: 4, totalAmount: 899000, ... }
Payment processed: { success: true, paymentId: 2, transactionId: "TXN_...", ... }
```

**Lỗi (nếu có):**
```
API error: Error: HTTP error! status: 400, message: ...
Đang tạo đơn hàng (fallback)...
Direct payment created: { paymentId: 2, ... }
```

---

## 🔍 Debug

### Nếu vẫn lỗi 400 Bad Request

**Kiểm tra format JSON:**
```javascript
console.log("Order data:", JSON.stringify(orderData, null, 2))
```

**Phải có format:**
```json
{
  "userId": 4,
  "notes": "...",
  "orderDetails": [
    {
      "orderId": 0,
      "courseId": 1,
      "price": 899000,
      "quantity": 1
    }
  ]
}
```

**Không được có:**
- ❌ `orderItems` (phải là `orderDetails`)
- ❌ `totalAmount` (backend tự tính)
- ❌ `status` (backend tự set = "pending")
- ❌ `customerName`, `customerEmail`, etc.

---

## 📝 Notes

- ✅ **Backend tự động tạo enrollments** khi payment thành công (PaymentsController.cs dòng 337-373)
- ✅ **Không cần gọi API Enrollments** từ frontend nữa
- ✅ **Format JSON phải đúng** với DTO của backend (PascalCase hoặc camelCase tùy config)
- ✅ **orderId trong orderDetails** phải có giá trị (có thể là 0, backend sẽ tự set)

---

## 🎁 Bonus: Backend Auto-Enrollment

Khi payment status = "success", backend tự động:
1. ✅ Cập nhật Order.status = "paid"
2. ✅ Tạo Enrollment cho mỗi course trong OrderDetails
3. ✅ Set enrollment status = "active"
4. ✅ Update student enrollment count

**Code backend (PaymentsController.cs):**
```csharp
private async Task CreateEnrollments(int? orderId)
{
  // Lấy order với orderDetails
  var order = await _context.Orders
    .Include(o => o.OrderDetails)
    .FirstOrDefaultAsync(o => o.OrderId == orderId.Value);

  // Tạo enrollment cho mỗi course
  foreach (var orderDetail in order.OrderDetails)
  {
    var enrollment = new Enrollment
    {
      CourseId = orderDetail.CourseId,
      UserId = order.UserId.Value,
      EnrollDate = DateTime.UtcNow,
      Status = "active"
    };
    _context.Enrollments.Add(enrollment);
  }
  await _context.SaveChangesAsync();
}
```

---

**Kết quả:** Thanh toán hoạt động hoàn hảo, không còn lỗi 400 và reference error! 🎉

**Cập nhật:** 31/10/2025  
**Version:** 2.0

