# 🔌 Bảng Kết Nối API với EnrollmentsController

## ✅ Đã Kết Nối

### 1. **POST /api/Enrollments** - Tạo Enrollment Mới
**File:** `/thanhtoan/page.jsx` (dòng 148-153, 215-220)  
**Helper:** `/lib/enrollmentApi.js` → `createEnrollment()`, `createBatchEnrollments()`

**Sử dụng khi:** Sau khi thanh toán thành công

**Request JSON:**
```json
{
  "courseId": 1,
  "userId": 4,
  "status": "active",
  "paymentId": 123
}
```

**Backend Controller:** `EnrollmentsController.cs` (dòng 227-287)

---

### 2. **GET /api/Enrollments/ByUser/{userId}** - Lấy Danh Sách Enrollment của User
**File:** `/khoa-hoc-cua-toi/page.jsx` (dòng 33)  
**Helper:** `/lib/enrollmentApi.js` → `getEnrollmentsByUser()`

**Sử dụng khi:** Hiển thị danh sách khóa học đã mua

**Response JSON:**
```json
[
  {
    "enrollmentId": 1,
    "courseId": 1,
    "courseTitle": "React Development",
    "completedLessons": 3,
    "totalLessons": 10,
    "progressPercentage": 30.0,
    "lastActivity": "2025-10-31T10:00:00Z"
  }
]
```

**Backend Controller:** `EnrollmentsController.cs` (dòng 110-136)

---

## 📝 API Endpoints Có Sẵn (Chưa Sử Dụng)

### 3. **GET /api/Enrollments** - Lấy Tất Cả Enrollments
**Helper:** Chưa có (có thể thêm vào `/lib/enrollmentApi.js`)  
**Backend:** `EnrollmentsController.cs` (dòng 20-59)

**Use case:** Admin xem tất cả enrollments

---

### 4. **GET /api/Enrollments/{id}** - Lấy Chi Tiết 1 Enrollment
**Helper:** Chưa có  
**Backend:** `EnrollmentsController.cs` (dòng 62-107)

**Use case:** Xem chi tiết enrollment cụ thể

---

### 5. **GET /api/Enrollments/ByCourse/{courseId}** - Lấy Enrollments của 1 Khóa Học
**Helper:** `/lib/enrollmentApi.js` → `getEnrollmentsByCourse()` ✅  
**Backend:** `EnrollmentsController.cs` (dòng 139-170)

**Use case:** Giảng viên xem danh sách học viên đã ghi danh khóa học của mình

---

### 6. **GET /api/Enrollments/{id}/Progress** - Lấy Tiến Độ Chi Tiết
**Helper:** `/lib/enrollmentApi.js` → `getEnrollmentProgress()` ✅  
**Backend:** `EnrollmentsController.cs` (dòng 173-224)

**Use case:** Xem tiến độ chi tiết từng bài học của enrollment

**Response JSON:**
```json
{
  "enrollmentId": 1,
  "courseId": 1,
  "courseTitle": "React Development",
  "completedLessons": 3,
  "totalLessons": 10,
  "progressPercentage": 30.0,
  "lastActivity": "2025-10-31T10:00:00Z",
  "lessons": [
    {
      "lessonId": 1,
      "title": "Introduction to React",
      "sortOrder": 1,
      "isCompleted": true,
      "completedAt": "2025-10-30T10:00:00Z"
    }
  ]
}
```

---

### 7. **PUT /api/Enrollments/{id}** - Cập Nhật Enrollment
**Helper:** Chưa có  
**Backend:** `EnrollmentsController.cs` (dòng 290-320)

**Use case:** Thay đổi trạng thái enrollment (active → cancelled)

---

### 8. **PATCH /api/Enrollments/{id}/Complete** - Hoàn Thành Enrollment
**Helper:** `/lib/enrollmentApi.js` → `completeEnrollment()` ✅  
**Backend:** `EnrollmentsController.cs` (dòng 323-346)

**Use case:** Đánh dấu đã hoàn thành toàn bộ khóa học

---

### 9. **POST /api/Enrollments/{enrollmentId}/Progress/{lessonId}/Complete** - Hoàn Thành Bài Học
**Helper:** `/lib/enrollmentApi.js` → `markLessonComplete()` ✅  
**Backend:** `EnrollmentsController.cs` (dòng 349-397)

**Use case:** Đánh dấu đã hoàn thành 1 bài học cụ thể

**Ví dụ:**
```javascript
await markLessonComplete(enrollmentId: 1, lessonId: 5)
```

---

### 10. **DELETE /api/Enrollments/{id}** - Xóa Enrollment
**Helper:** Chưa có  
**Backend:** `EnrollmentsController.cs` (dòng 400-422)

**Use case:** Hủy ghi danh khóa học

---

### 11. **DELETE /api/Enrollments/ByUserAndCourse** - Xóa Enrollment Theo User & Course
**Helper:** `/lib/enrollmentApi.js` → `deleteEnrollmentByUserAndCourse()` ✅  
**Backend:** `EnrollmentsController.cs` (dòng 425-449)

**Use case:** Hủy ghi danh khóa học cụ thể của user

**Query params:** `?userId=4&courseId=1`

---

## 📊 Tổng Kết Kết Nối

| Endpoint | Method | Frontend Connected | Helper Available | Use Case |
|----------|--------|-------------------|------------------|----------|
| `/api/Enrollments` | POST | ✅ Yes | ✅ Yes | Tạo enrollment sau thanh toán |
| `/api/Enrollments/ByUser/{userId}` | GET | ✅ Yes | ✅ Yes | Hiển thị khóa học đã mua |
| `/api/Enrollments` | GET | ❌ No | ❌ No | Admin xem tất cả |
| `/api/Enrollments/{id}` | GET | ❌ No | ❌ No | Chi tiết enrollment |
| `/api/Enrollments/ByCourse/{courseId}` | GET | ❌ No | ✅ Yes | Giảng viên xem học viên |
| `/api/Enrollments/{id}/Progress` | GET | ❌ No | ✅ Yes | Tiến độ chi tiết |
| `/api/Enrollments/{id}` | PUT | ❌ No | ❌ No | Cập nhật enrollment |
| `/api/Enrollments/{id}/Complete` | PATCH | ❌ No | ✅ Yes | Hoàn thành khóa học |
| `/api/Enrollments/{enrollmentId}/Progress/{lessonId}/Complete` | POST | ❌ No | ✅ Yes | Hoàn thành bài học |
| `/api/Enrollments/{id}` | DELETE | ❌ No | ❌ No | Xóa enrollment |
| `/api/Enrollments/ByUserAndCourse` | DELETE | ❌ No | ✅ Yes | Xóa enrollment cụ thể |

---

## 🎯 Các Tính Năng Cần Triển Khai Tiếp

### 1. Trang Học Bài (`/bai-hoc/[Courses]/page.jsx`)
- [ ] Kết nối `GET /api/Enrollments/{id}/Progress` để lấy tiến độ chi tiết
- [ ] Kết nối `POST /api/Enrollments/{enrollmentId}/Progress/{lessonId}/Complete` khi hoàn thành bài học
- [ ] Kết nối `PATCH /api/Enrollments/{id}/Complete` khi hoàn thành toàn bộ khóa học

**Ví dụ code:**
```javascript
// Khi click nút "Hoàn thành bài học"
import { markLessonComplete } from '@/lib/enrollmentApi'

const handleLessonComplete = async () => {
  try {
    await markLessonComplete(enrollmentId, lessonId)
    alert("Đã hoàn thành bài học!")
  } catch (error) {
    console.error("Error:", error)
  }
}
```

### 2. Trang Giảng Viên
- [ ] Kết nối `GET /api/Enrollments/ByCourse/{courseId}` để xem danh sách học viên

---

## 🔧 Hướng Dẫn Sử Dụng Helper Functions

### Import helper
```javascript
import { 
  createEnrollment, 
  getEnrollmentsByUser,
  markLessonComplete,
  completeEnrollment 
} from '@/lib/enrollmentApi'
```

### Ví dụ sử dụng
```javascript
// 1. Tạo enrollment
const enrollment = await createEnrollment({
  courseId: 1,
  userId: 4,
  status: "active",
  paymentId: 123
})

// 2. Lấy danh sách enrollment
const enrollments = await getEnrollmentsByUser(userId)

// 3. Đánh dấu bài học hoàn thành
await markLessonComplete(enrollmentId, lessonId)

// 4. Hoàn thành khóa học
await completeEnrollment(enrollmentId)
```

---

## 📝 Notes

- ✅ **EnrollmentsController đã được kết nối đầy đủ** cho luồng thanh toán và hiển thị khóa học
- ⚠️ Cần triển khai thêm kết nối trong trang học bài để đánh dấu tiến độ
- 💡 Helper functions đã sẵn sàng trong `/lib/enrollmentApi.js`, chỉ cần import và sử dụng

---

**Cập nhật cuối:** 31/10/2025  
**Version:** 1.1

