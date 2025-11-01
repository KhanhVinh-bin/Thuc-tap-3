# 💳 Kết Nối API Payment & Orders - Hiển Thị Mã Payment

## ✅ Đã Kết Nối Đầy Đủ

### 1. **POST /api/Orders** - Tạo Order
**File:** `/thanhtoan/page.jsx` (dòng 121)  
**Helper:** `/lib/api.js` → `createOrder()`

**Request JSON:**
```json
{
  "userId": 4,
  "orderDetails": [
    {
      "courseId": 1,
      "quantity": 1,
      "price": 899000
    }
  ],
  "totalAmount": 899000,
  "status": "pending"
}
```

**Response từ Backend:**
```json
{
  "orderId": 1,
  "userId": 4,
  "orderDate": "2025-10-31T10:00:00Z",
  "totalAmount": 899000,
  "status": "pending",
  "orderDetails": [...]
}
```

**Backend Controller:** `OrdersController.cs` (dòng 240-338)

---

### 2. **POST /api/Payments** - Tạo Payment
**File:** `/thanhtoan/page.jsx` (dòng 125-131)  
**Helper:** `/lib/paymentApi.js` → `processPayment()` → `createPayment()`

**Request JSON (theo Swagger):**
```json
{
  "orderId": 1,
  "paymentMethod": "ewallet",
  "transactionId": "TXN_1761849662323_82i156do1",
  "amount": 899000,
  "paymentStatus": "success",
  "paidAt": "2025-10-30T18:41:02.323Z",
  "rawResponse": "{\"customerName\":\"vinh\",...}"
}
```

**Response từ Backend:**
```json
{
  "paymentId": 2,
  "orderId": 1,
  "paymentMethod": "ewallet",
  "transactionId": "TXN_1761849662323_82i156do1",
  "amount": 899000,
  "paymentStatus": "success",
  "paidAt": "2025-10-30T18:41:02.323Z"
}
```

**Backend Controller:** `PaymentsController.cs` (dòng 136-184)

**Lưu ý:** Backend tự động:
- ✅ Cập nhật Order status = "paid" khi payment status = "success"
- ✅ Tạo Enrollments cho tất cả khóa học trong order (dòng 337-373)

---

### 3. **GET /api/Orders/ByUser/{userId}** - Lấy Lịch Sử Giao Dịch
**File:** `/khoa-hoc-cua-toi/oders/page.jsx` (dòng 33)

**Response từ Backend:**
```json
[
  {
    "orderId": 1,
    "userId": 4,
    "orderDate": "2025-10-30T10:00:00Z",
    "totalAmount": 899000,
    "status": "paid",
    "orderDetails": [
      {
        "orderDetailId": 1,
        "courseId": 1,
        "price": 899000,
        "quantity": 1,
        "course": {
          "courseId": 1,
          "title": "React Development Course",
          "thumbnailUrl": "...",
          "price": 899000
        }
      }
    ],
    "payments": [
      {
        "paymentId": 2,
        "orderId": 1,
        "paymentMethod": "ewallet",
        "transactionId": "TXN_1761849662323_82i156do1",
        "amount": 899000,
        "paymentStatus": "success",
        "paidAt": "2025-10-30T18:41:02.323Z"
      }
    ]
  }
]
```

**Backend Controller:** `OrdersController.cs` (dòng 146-212)

---

## 📊 Luồng Thanh Toán Hoàn Chỉnh

```
1. User click "Hoàn tất thanh toán"
   ↓
2. POST /api/Orders
   → Tạo Order
   → Trả về orderId = 1
   ↓
3. POST /api/Payments
   {
     orderId: 1,
     paymentMethod: "ewallet",
     transactionId: "TXN_...",
     amount: 899000,
     paymentStatus: "success",
     ...
   }
   → Tạo Payment
   → Trả về paymentId = 2
   ↓
4. Backend tự động:
   ✅ Cập nhật Order.status = "paid"
   ✅ Tạo Enrollments cho các khóa học
   ↓
5. Frontend:
   ✅ Hiển thị paymentId trong console
   ✅ Redirect to /khoa-hoc-cua-toi
   ↓
6. GET /api/Orders/ByUser/4
   → Lấy danh sách orders + payments
   ↓
7. Hiển thị trong trang lịch sử giao dịch:
   - Mã đơn hàng: ORD-000001
   - Mã thanh toán: #2
   - Transaction ID: TXN_1761849662323_82i156do1
```

---

## 🎯 Hiển Thị Trong UI

### Bảng Lịch Sử Giao Dịch

**File:** `/khoa-hoc-cua-toi/oders/page.jsx`

| Cột | Dữ Liệu | Source |
|-----|---------|--------|
| Mã đơn hàng | `ORD-{orderId}` | `order.orderId` |
| Ngày đặt | `31/10/2025` | `order.orderDate` |
| Số lượng khóa học | `2 khóa học` | `order.orderDetails.length` |
| Tổng tiền | `1.798.000đ` | `order.totalAmount` |
| **Mã thanh toán** | `#2` | `order.payments[0].paymentId` |
| | `TX: TXN_1761849662...` | `order.payments[0].transactionId` |
| Trạng thái | `Đã thanh toán` | `order.status` |

### Modal Chi Tiết Đơn Hàng

**Hiển thị:**
- ✅ Payment ID: #2
- ✅ Transaction ID: TXN_1761849662323_82i156do1
- ✅ Phương thức thanh toán: ewallet
- ✅ Thời gian thanh toán: 30/10/2025, 18:41:02

---

## 🔍 Cấu Trúc Dữ Liệu Backend

### OrderDTO (OrdersController.cs dòng 164-211)
```csharp
{
  OrderId: int,
  UserId: int?,
  OrderDate: DateTime,
  TotalAmount: decimal,
  Status: string,
  OrderDetails: OrderDetailDTO[],
  Payments: PaymentDTO[]  // ← Chứa paymentId, transactionId
}
```

### PaymentDTO (PaymentsController.cs)
```csharp
{
  PaymentId: int,
  OrderId: int?,
  PaymentMethod: string,
  TransactionId: string,
  Amount: decimal,
  PaymentStatus: string,
  PaidAt: DateTime?
}
```

---

## ✅ Checklist Kết Nối

### Thanh Toán (`/thanhtoan/page.jsx`)
- [x] Gọi `POST /api/Orders` để tạo Order
- [x] Lấy `orderId` từ response
- [x] Gọi `POST /api/Payments` với `orderId`
- [x] Nhận `paymentId` từ response
- [x] Hiển thị `paymentId` trong console log
- [x] Redirect về `/khoa-hoc-cua-toi`

### Lịch Sử Giao Dịch (`/oders/page.jsx`)
- [x] Gọi `GET /api/Orders/ByUser/{userId}`
- [x] Map dữ liệu từ `OrderDTO` format
- [x] Hiển thị `paymentId` trong bảng
- [x] Hiển thị `transactionId` trong bảng
- [x] Hiển thị đầy đủ thông tin payment trong modal

---

## 🧪 Test Case

### Test 1: Thanh Toán Thành Công
1. ✅ Vào `/thanhtoan?courseId=1&buyNow=true`
2. ✅ Nhập thông tin → Click "Hoàn tất thanh toán"
3. ✅ Console log: `Payment processed: { paymentId: 2, ... }`
4. ✅ Alert: "Thanh toán thành công! Mã giao dịch: TXN_..."
5. ✅ Redirect to `/khoa-hoc-cua-toi`

### Test 2: Xem Lịch Sử Giao Dịch
1. ✅ Vào `/khoa-hoc-cua-toi/oders`
2. ✅ Thấy bảng với cột "Mã thanh toán"
3. ✅ Thấy Payment ID: #2
4. ✅ Thấy Transaction ID (rút gọn)
5. ✅ Click "Chi tiết" → Modal hiển thị đầy đủ payment info

---

## 🐛 Troubleshooting

### Lỗi: Không thấy mã payment trong lịch sử
**Nguyên nhân:** Order chưa có payment hoặc payment chưa được liên kết

**Giải pháp:**
1. Kiểm tra Order có `payments` array không
2. Kiểm tra `payment.orderId` có khớp với `order.orderId` không
3. Kiểm tra console: `console.log("Orders:", orders)` để xem dữ liệu

### Lỗi: Payment ID không hiển thị
**Nguyên nhân:** Format dữ liệu không đúng

**Giải pháp:**
```javascript
// Kiểm tra
console.log("Order payments:", order.payments)
// Phải là array: [{ paymentId: 2, transactionId: "...", ... }]

// Nếu payments là null/undefined
if (order.payments && order.payments.length > 0) {
  // Hiển thị paymentId
} else {
  // Hiển thị "Chưa thanh toán"
}
```

---

## 📝 Notes

- ✅ **Backend tự động tạo enrollments** khi payment status = "success" (PaymentsController.cs dòng 337-373)
- ✅ **Order status tự động cập nhật** thành "paid" khi payment thành công
- ✅ **Frontend không cần gọi API Enrollments** nữa (backend đã tự động xử lý)
- ⚠️ Nếu vẫn gọi `createBatchEnrollments()` → Có thể bị duplicate (backend đã tạo rồi)

---

## 🔄 So Sánh: Backend vs Frontend Enrollment

### Backend (Tự Động)
```
Payment status = "success" 
  → CreateEnrollments() (dòng 337-373)
  → Tạo enrollment cho mỗi course trong OrderDetails
```

### Frontend (Manual - Hiện Tại)
```
Payment thành công
  → createBatchEnrollments() (dòng 148)
  → Tạo enrollment thủ công
```

**⚠️ Lưu ý:** Có thể bị duplicate enrollment. Nên **bỏ** `createBatchEnrollments()` trong `/thanhtoan/page.jsx` vì backend đã tự động tạo.

---

**Cập nhật cuối:** 31/10/2025  
**Version:** 1.2

