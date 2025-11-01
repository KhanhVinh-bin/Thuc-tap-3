# Luồng Ghi Danh Khóa Học (Enrollment Flow)

## 📋 Tổng Quan Luồng

```
Học viên → Thêm vào giỏ → Thanh toán → Tạo Enrollment → Xem khóa học đã mua → Học bài
```

## 🔄 Chi Tiết Từng Bước

### 1️⃣ Thêm Khóa Học Vào Giỏ
**File:** `/courses/[id]/page.jsx`

```javascript
// Click "Mua ngay" hoặc "Thêm vào giỏ hàng"
handleBuyNow() → Redirect to /thanhtoan?courseId={id}&buyNow=true
handleAddToCart() → Thêm vào giỏ hàng qua API
```

### 2️⃣ Thanh Toán
**File:** `/thanhtoan/page.jsx`

**API Call Sequence:**
1. Tạo Order: `POST /api/Orders`
2. Xử lý Payment: `POST /api/Payment`
3. **Nhận paymentId từ response**

### 3️⃣ Tạo Enrollment (Sau Thanh Toán Thành Công)
**File:** `/thanhtoan/page.jsx`
**Helper:** `/lib/enrollmentApi.js`

```javascript
// Sau khi payment thành công
const enrollmentsData = orderItems.map((item) => ({
  courseId: item.id,
  userId: user.userId,
  status: "active",
  paymentId: paymentResult.paymentId
}))

await createBatchEnrollments(enrollmentsData)
// → Redirect to /khoa-hoc-cua-toi
```

**API Endpoint:** `POST /api/Enrollments`

**Request JSON:**
```json
{
  "courseId": 1,
  "userId": 4,
  "status": "active",
  "paymentId": 123
}
```

### 4️⃣ Hiển Thị Khóa Học Đã Mua
**File:** `/khoa-hoc-cua-toi/page.jsx`

**API Calls:**
- `GET /api/Students/{userId}` - Lấy thông tin học viên
- `GET /api/Students/{userId}/enrollments` - Lấy danh sách khóa học đã ghi danh
- `GET /api/Progress/ByUser/{userId}` - Lấy tiến độ học tập

### 5️⃣ Học Bài
**File:** `/bai-hoc/[Courses]/page.jsx`

Click button "Tiếp tục học" → Navigate to `/bai-hoc/{courseId}`

---

## 🛠️ API Helper Functions

### File: `/lib/enrollmentApi.js`

#### Tạo Enrollment
```javascript
import { createEnrollment } from '@/lib/enrollmentApi'

const enrollment = await createEnrollment({
  courseId: 1,
  userId: 4,
  status: "active",
  paymentId: 123
})
```

#### Tạo Nhiều Enrollments
```javascript
import { createBatchEnrollments } from '@/lib/enrollmentApi'

const enrollments = await createBatchEnrollments([
  { courseId: 1, userId: 4, status: "active", paymentId: 123 },
  { courseId: 2, userId: 4, status: "active", paymentId: 123 }
])
```

#### Lấy Enrollments của User
```javascript
import { getEnrollmentsByUser } from '@/lib/enrollmentApi'

const enrollments = await getEnrollmentsByUser(userId)
```

#### Lấy Tiến Độ
```javascript
import { getEnrollmentProgress } from '@/lib/enrollmentApi'

const progress = await getEnrollmentProgress(enrollmentId)
```

#### Đánh Dấu Bài Học Hoàn Thành
```javascript
import { markLessonComplete } from '@/lib/enrollmentApi'

await markLessonComplete(enrollmentId, lessonId)
```

#### Hoàn Thành Khóa Học
```javascript
import { completeEnrollment } from '@/lib/enrollmentApi'

await completeEnrollment(enrollmentId)
```

---

## 📊 Database Schema (Backend)

### Enrollments Table
```sql
CREATE TABLE Enrollments (
  EnrollmentId INT PRIMARY KEY,
  CourseId INT,
  UserId INT,
  Status VARCHAR(50),
  PaymentId INT,
  EnrollDate DATETIME,
  CompletedAt DATETIME,
  FOREIGN KEY (CourseId) REFERENCES Courses(CourseId),
  FOREIGN KEY (UserId) REFERENCES Users(UserId),
  FOREIGN KEY (PaymentId) REFERENCES Payments(PaymentId)
)
```

---

## ✅ Kiểm Tra Luồng Hoạt Động

### Test Case 1: Mua 1 Khóa Học
1. ✅ Vào `/courses/1` → Click "Mua ngay"
2. ✅ Nhập thông tin thanh toán → Click "Hoàn tất thanh toán"
3. ✅ Kiểm tra console: `✅ Đã ghi danh 1/1 khóa học`
4. ✅ Redirect to `/khoa-hoc-cua-toi`
5. ✅ Thấy khóa học vừa mua
6. ✅ Click "Tiếp tục học" → Navigate to `/bai-hoc/1`

### Test Case 2: Mua Nhiều Khóa Học
1. ✅ Thêm 3 khóa học vào giỏ hàng
2. ✅ Vào `/cart` → Click "Thanh toán"
3. ✅ Hoàn tất thanh toán
4. ✅ Kiểm tra console: `✅ Đã ghi danh 3/3 khóa học`
5. ✅ Redirect to `/khoa-hoc-cua-toi`
6. ✅ Thấy cả 3 khóa học

---

## 🐛 Troubleshooting

### Lỗi: "Failed to create enrollment"
**Nguyên nhân:** Backend API không hoạt động hoặc dữ liệu không hợp lệ

**Giải pháp:**
1. Kiểm tra backend có đang chạy tại `https://localhost:7025`
2. Kiểm tra courseId, userId có tồn tại trong database
3. Kiểm tra console browser để xem error chi tiết

### Lỗi: "Không thấy khóa học trong /khoa-hoc-cua-toi"
**Nguyên nhân:** API `/api/Students/{userId}/enrollments` không trả về dữ liệu

**Giải pháp:**
1. Kiểm tra userId có đúng không
2. Kiểm tra enrollment đã được tạo trong database
3. F12 → Network → Xem response của API call

### Lỗi: Link "Tiếp tục học" không hoạt động
**Nguyên nhân:** URL không đúng hoặc trang bài học chưa tồn tại

**Giải pháp:**
1. Kiểm tra URL: `/bai-hoc/{courseId}` (không phải `/learn/{courseId}`)
2. Kiểm tra trang `/bai-hoc/[Courses]/page.jsx` có tồn tại

---

## 📝 Notes

- **Status values:** `"active"`, `"completed"`, `"cancelled"`
- **PaymentId:** Có thể null nếu chưa thanh toán
- **Redirect:** Sau thanh toán thành công luôn redirect về `/khoa-hoc-cua-toi`
- **Error Handling:** Ngay cả khi enrollment thất bại, vẫn redirect để không làm gián đoạn UX

---

## 🔗 Related Files

- `/thanhtoan/page.jsx` - Trang thanh toán
- `/khoa-hoc-cua-toi/page.jsx` - Danh sách khóa học đã mua
- `/bai-hoc/[Courses]/page.jsx` - Trang học bài
- `/lib/enrollmentApi.js` - Helper functions cho Enrollment API
- `/lib/paymentApi.js` - Helper functions cho Payment API

---

**Cập nhật cuối:** 31/10/2025
**Version:** 1.0

