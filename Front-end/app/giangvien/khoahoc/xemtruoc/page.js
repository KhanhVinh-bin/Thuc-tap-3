"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCourse } from "../context/CourseContext"
import { createOrUpdateCourseStep, getInstructorCourses } from "../../lib/instructorApi"
import { generateSlug } from "@/lib/slug-helper"
import "./page.css"

export default function XemTruocKhoaHocPage(){
  const router = useRouter()
  const { token } = useAuth()
  const { courseData, updateCourseData, resetCourseData } = useCourse()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  
  // ✅ Load thumbnail từ API nếu courseId có nhưng thumbnailUrl chưa có hoặc là blob URL
  useEffect(() => {
    const loadThumbnailFromApi = async () => {
      // Chỉ load nếu có courseId và không có thumbnailUrl hợp lệ (không phải blob)
      if (courseData.courseId && 
          (!courseData.thumbnailUrl || courseData.thumbnailUrl.startsWith('blob:'))) {
        try {
          console.log("📤 Loading course thumbnail from API for courseId:", courseData.courseId)
          const courses = await getInstructorCourses(token)
          const currentCourse = Array.isArray(courses) 
            ? courses.find(c => (c.CourseId || c.courseId) === courseData.courseId)
            : null
          
          if (currentCourse) {
            const thumbnailUrl = currentCourse.ThumbnailUrl || currentCourse.thumbnailUrl
            if (thumbnailUrl && !thumbnailUrl.startsWith('blob:')) {
              console.log("✅ Found thumbnail from API:", thumbnailUrl)
              updateCourseData({ thumbnailUrl })
            }
          }
        } catch (err) {
          console.warn("⚠️ Could not load thumbnail from API:", err)
        }
      }
    }
    
    if (token && courseData.courseId) {
      loadThumbnailFromApi()
    }
  }, [courseData.courseId, token])

  const slug = generateSlug(courseData.title || "")
  const previewUrl = `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/courses/${slug}`

  return (
    <div className="gvc-create-root">
      {/* Header steps: active step 4 */}
      <div className="gvc-steps">
        <div className="gvc-steps-heading">
          <div className="gvc-steps-title">Tạo khóa học mới</div>
          <div className="gvc-steps-desc">Hoàn thành các bước bên dưới để tạo khóa học mới của bạn</div>
        </div>
        <div className="gvc-steps-line">
          <div className="gvc-step">
            <div className="gvc-step-num">1</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Thông tin cơ bản</div>
              <div className="gvc-step-sub">Tiêu đề, mô tả & danh mục</div>
            </div>
          </div>
          <div className="gvc-step">
            <div className="gvc-step-num">2</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Chi tiết khóa học</div>
              <div className="gvc-step-sub">Giá, thời lượng và yêu cầu</div>
            </div>
          </div>
          <div className="gvc-step">
            <div className="gvc-step-num">3</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Nội dung chương</div>
              <div className="gvc-step-sub">Thêm chương và bài học</div>
            </div>
          </div>
          <div className="gvc-step active">
            <div className="gvc-step-num">4</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Xem trước</div>
              <div className="gvc-step-sub">Kiểm tra và hoàn thành</div>
            </div>
          </div>
        </div>
        <div className="gvc-progress is-step4" />
      </div>

      {/* Body */}
      <div className="gvc-create-grid">
        <section className="gvc-card">
          {/* Heading centered + logo */}
          <div className="gvc-preview-header">
            <div className="gvc-preview-heading">
              
              <div className="gvc-preview-title">Xem trước khóa học</div>
            </div>
            <div className="gvc-preview-desc">Kiểm tra lại thông tin trước khi xuất bản khóa học</div>
          </div>

          {/* Thẻ preview chính */}
          <div className="gvc-preview-main">
            <div className="gvc-thumb-large" aria-label="Thumbnail">
              {courseData.thumbnailUrl ? (() => {
                // ✅ Build full URL từ thumbnailUrl
                let imageUrl = courseData.thumbnailUrl
                
                // Nếu là relative path, thêm base URL
                if (imageUrl.startsWith('/uploads/')) {
                  imageUrl = `https://localhost:3001${imageUrl}`
                } else if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('blob:')) {
                  // Nếu không phải absolute URL và không phải blob, thêm base URL
                  imageUrl = `https://localhost:3001${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
                }
                
                return (
                  <img 
                    src={imageUrl}
                  alt="Course thumbnail"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '10px'
                  }}
                  onError={(e) => {
                      console.warn("⚠️ Failed to load thumbnail:", imageUrl)
                      // ✅ Nếu ảnh không load được, ẩn image và giữ placeholder từ parent
                    e.target.style.display = 'none'
                    }}
                    onLoad={() => {
                      console.log("✅ Thumbnail loaded successfully:", imageUrl)
                  }}
                />
                )
              })() : (
                <>
                  <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#6b7280">
                    <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="2" />
                    <circle cx="9.5" cy="10" r="2.2" strokeWidth="2" />
                    <path d="M6 16l4-4 3 3 4-4 3 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="gvc-thumb-label">Chưa có ảnh</div>
                </>
              )}
            </div>
            <div className="gvc-preview-info">
              <div className="gvc-course-title">{courseData.title || "Chưa có tiêu đề"}</div>
              <div className="gvc-course-desc">{courseData.description || "Chưa có mô tả"}</div>
              <div className="gvc-pillbar">
                <span className="gvc-pill gray">
                  {/* Icon sách mở (design) */}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6">
                    <path d="M12 7c-3-1.3-6-.8-8 .6v8.8c2-1 4-1.2 8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7c3-1.3 6-.8 8 .6v8.8c-2-1-4-1.2-8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7v10" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>design</span>
                </span>
                <span className="gvc-pill purple">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff">
                    <circle cx="12" cy="8" r="3" />
                    <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>intermediate</span>
                </span>
                <span className="gvc-pill green">
                  
                  <span>$ 12đ</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hàng thẻ nhỏ */}
          <div className="gvc-mini-cards">
            <div className="gvc-mini">
              <div className="gvc-mini-title">
                <span className="gvc-mini-icon tag" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <circle cx="5.5" cy="6" r="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M5 8a2 2 0 012-2h6l5 5-6 6-5-5V8z" fill="#f59e0b" />
                    <circle cx="9" cy="10" r="1.4" fill="#fff" stroke="#d1d5db" strokeWidth="1" />
                  </svg>
                </span>
                Thẻ từ khóa
              </div>
              <div className="gvc-mini-empty">Chưa có thẻ</div>
            </div>
            <div className="gvc-mini">
              <div className="gvc-mini-title">
                <span className="gvc-mini-icon content" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="none">
                    <rect x="6" y="6" width="9" height="9" rx="2" fill="#3b82f6" opacity="0.9" />
                    <rect x="3" y="8" width="9" height="9" rx="2" fill="#22c55e" opacity="0.85" />
                    <rect x="9" y="3" width="9" height="9" rx="2" fill="#ef4444" opacity="0.85" />
                  </svg>
                </span>
                Nội dung
              </div>
              <div className="gvc-mini-list">
                <div className="gvc-mini-item">
                  <span className="gvc-num-badge blue">1</span>
                  <div className="gvc-mini-text">
                    <div className="gvc-mini-label">Chương</div>
                    <div className="gvc-mini-sub">Tổng số chương</div>
                  </div>
                </div>
                <div className="gvc-mini-item">
                  <span className="gvc-num-badge purple">1</span>
                  <div className="gvc-mini-text">
                    <div className="gvc-mini-label">Bài học</div>
                    <div className="gvc-mini-sub">Tổng số bài</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gvc-mini">
              <div className="gvc-mini-title">
                <span className="gvc-mini-icon info" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9ca3af">
                    <circle cx="12" cy="12" r="3" fill="#f8fafc" stroke="#9ca3af" />
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M16.4 7.6l2.1-2.1M5.5 18.5l2.1-2.1" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Thông tin
              </div>
              <div className="gvc-mini-list">
                <div className="gvc-mini-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b">
                    <path d="M4 4h16v6H4z" strokeWidth="2" />
                    <path d="M4 14h16v6H4z" strokeWidth="2" />
                  </svg>
                  Ngôn ngữ: Tiếng Việt  </div>
                <div className="gvc-mini-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    <path d="M12 7v5l4 2" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Thời lượng: 12
                </div>
              </div>
            </div>
          </div>

          {/* Cấu trúc khóa học */}
          <div className="gvc-structure">
            <div className="gvc-structure-title">
              <span className="gvc-struct-icon" aria-hidden="true">
                {/* Icon sách trong ô tím */}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff">
                  <path d="M12 7c-3-1.3-6-.8-8 .6v8.8c2-1 4-1.2 8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7c3-1.3 6-.8 8 .6v8.8c-2-1-4-1.2-8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7v10" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Cấu trúc khóa học
            </div>
            <div className="gvc-struct-card">
              <div className="gvc-struct-head">
                <div className="gvc-struct-num">1</div>
                <div className="gvc-struct-main">
                  <div className="gvc-struct-title">Chương 1</div>
                  <div className="gvc-struct-desc">Không có mô tả</div>
                </div>
              </div>
              <div className="gvc-lesson-chip">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#374151">
                  <rect x="4" y="5" width="16" height="12" rx="2" />
                  <path d="M8 9h8M9 12h6" />
                </svg>
                <span style={{marginLeft:6}}>Bài học mới</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" onClick={() => router.push("/giangvien/khoahoc/noidung")}>Quay lại</button>
          <div className="gvc-step-info">Bước 4 / 4</div>
          {error && (
            <div className="gvc-error" style={{marginBottom: "8px", textAlign: "center", padding: "8px", background: "#fee2e2", borderRadius: "8px"}}>
              {error}
            </div>
          )}
          <button 
            className="gvc-btn primary" 
            disabled={isSaving}
            onClick={async () => {
              if (!token) {
                setError("Vui lòng đăng nhập lại")
                return
              }

              // Kiểm tra token có hợp lệ không (không phải demo token)
              if (typeof token === 'string' && token.startsWith('demo_token_')) {
                setError("Vui lòng đăng nhập qua trang login chính thức để lấy token hợp lệ")
                return
              }

              setIsSaving(true)
              setError("")

              try {
                // ✅ Xử lý lessons để đảm bảo validation
                const skippedLessons = []
                const processedLessons = (courseData.lessons || []).map((lesson, idx) => {
                  // ✅ Hỗ trợ cả PascalCase và camelCase
                  const contentType = (lesson.ContentType || lesson.contentType || "").toLowerCase().trim()
                  const lessonId = lesson.LessonId || lesson.lessonId || 0
                  const title = lesson.Title || lesson.title || `Bài học ${idx + 1}`
                  const videoUrl = lesson.VideoUrl || lesson.videoUrl || null
                  
                  // ✅ QUAN TRỌNG: Lấy filePath từ TẤT CẢ các nguồn có thể
                  // 1. FilePath trực tiếp từ lesson (backend CreateOrUpdateCourseStep đã thêm)
                  // 2. FilePath từ File object (backend Lessons/ByCourse trả về)
                  // 3. FilePath từ các thuộc tính khác
                  const fileObj = lesson.File || lesson.file || null
                  const filePathFromLesson = lesson.FilePath || lesson.filePath || null
                  const filePathFromFile = fileObj?.FilePath || fileObj?.filePath || null
                  const filePathFromFileUrl = fileObj?.FileUrl || fileObj?.fileUrl || null
                  const fileUrlFromLesson = lesson.FileUrl || lesson.fileUrl || null
                  
                  // ✅ Ưu tiên FilePath: từ File object > từ lesson trực tiếp > từ các nguồn khác
                  const filePath = filePathFromFile || filePathFromLesson || filePathFromFileUrl || fileUrlFromLesson || null
                  
                  console.log(`📝 Processing lesson ${idx + 1} "${title}":`, {
                    contentType,
                    lessonId,
                    filePath,
                    filePathFromFile,
                    filePathFromLesson,
                    hasFile: !!fileObj,
                    fullLesson: lesson
                  })
                  
                  // ✅ Kiểm tra nếu là document type (pdf hoặc text)
                  const isDocumentType = contentType === "pdf" || contentType === "text"
                  
                  // ✅ Nếu là document type nhưng chưa có filePath hợp lệ, bỏ qua lesson này
                  if (isDocumentType) {
                    const hasValidFilePath = filePath && 
                                           (filePath.startsWith('/uploads/') || 
                                            filePath.startsWith('http://') || 
                                            filePath.startsWith('https://'))
                    
                    if (!hasValidFilePath) {
                      skippedLessons.push({ title, contentType })
                      console.warn(`⚠️ Skipping lesson "${title}" - ContentType is "${contentType}" but no valid filePath.`, {
                        filePath,
                        filePathFromFile,
                        filePathFromLesson,
                        hasFile: !!fileObj
                      })
                      return null // Bỏ qua lesson này
                    }
                  }
                  
                  // ✅ Tạo lesson object với format đúng
                  return {
                    lessonId: lessonId,
                    title: title,
                    contentType: contentType || "video",
                    videoUrl: contentType === "video" ? videoUrl : null,
                    filePath: isDocumentType ? filePath : null, // ✅ Sử dụng filePath đã lấy từ nhiều nguồn
                    durationSec: lesson.DurationSec || lesson.durationSec || 0,
                    sortOrder: lesson.SortOrder || lesson.sortOrder || idx + 1,
                  }
                }).filter(lesson => lesson !== null) // ✅ Lọc bỏ các lesson null
                
                // ✅ Cảnh báo nếu có lesson bị bỏ qua
                if (skippedLessons.length > 0) {
                  const skippedList = skippedLessons.map(s => `- "${s.title}" (${s.contentType})`).join('\n')
                  const shouldContinue = window.confirm(
                    `⚠️ Cảnh báo:\n\n` +
                    `Có ${skippedLessons.length} bài học bị bỏ qua vì chưa có file tài liệu hợp lệ:\n\n` +
                    `${skippedList}\n\n` +
                    `Các bài học này sẽ không được lưu vào khóa học.\n\n` +
                    `Bạn có muốn tiếp tục tạo khóa học không?`
                  )
                  
                  if (!shouldContinue) {
                    setIsSaving(false)
                    return
                  }
                }
                
                // Final save with all data
                const coursePayload = {
                  courseId: courseData.courseId || 0,
                  title: courseData.title || "",
                  description: courseData.description || "",
                  categoryId: courseData.categoryId || null,
                  thumbnailUrl: courseData.thumbnailUrl || "",
                  price: courseData.price || 0,
                  duration: courseData.duration || "",
                  level: courseData.level || "",
                  prerequisites: courseData.prerequisites || "",
                  learningOutcomes: courseData.learningOutcomes || "",
                  tagName: courseData.tagName || "",
                  tagIds: null, // ✅ Backend chỉ dùng TagName, không dùng TagIds. Gửi null để tránh lỗi validation
                  slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course", // ✅ Thêm slug
                  lessons: processedLessons, // ✅ Sử dụng processedLessons thay vì courseData.lessons
                  status: "published", // ✅ Mặc định là published
                }

                console.log("📤 Sending final course payload:", {
                  courseId: coursePayload.courseId,
                  title: coursePayload.title,
                  status: coursePayload.status,
                  lessonsCount: coursePayload.lessons?.length || 0,
                  lessons: coursePayload.lessons
                })

                const result = await createOrUpdateCourseStep(coursePayload, token)
                
                console.log("✅ Course created/updated successfully:", {
                  courseId: result.CourseId || result.courseId,
                  title: result.Title || result.title,
                  status: result.Status || result.status,
                  lessonsCount: result.Lessons?.length || 0
                })

                // ✅ Update courseId vào context trước khi reset (để đảm bảo có courseId mới nhất)
                const finalCourseId = result.CourseId || result.courseId
                if (finalCourseId) {
                  updateCourseData({ courseId: finalCourseId })
                }

                // Reset course data after successful creation
                resetCourseData()

                // ✅ Hiển thị thông báo thành công với option xem khóa học
                const courseTitle = result.Title || result.title || coursePayload.title
                const viewCourse = window.confirm(
                  `✅ Tạo khóa học thành công!\n\n` +
                  `Khóa học "${courseTitle}" đã được tạo và xuất bản.\n\n` +
                  `Bạn có muốn xem khóa học này ngay bây giờ?`
                )

                if (viewCourse && finalCourseId) {
                  // Navigate to view course page
                  router.push(`/bai-hoc/${finalCourseId}`)
                } else {
                router.push("/giangvien/khoahoc?created=1")
                }
              } catch (err) {
                console.error("❌ Error saving course:", err)
                const errorMessage = err.message || "Có lỗi xảy ra khi tạo khóa học"
                setError(errorMessage)
                
                // ✅ Hiển thị lỗi chi tiết
                alert(`❌ Lỗi khi tạo khóa học:\n\n${errorMessage}\n\nVui lòng kiểm tra console để biết thêm chi tiết.`)
              } finally {
                setIsSaving(false)
              }
            }}
          >
            {isSaving ? "Đang tạo..." : "Tạo khóa học"}
          </button>
        </div>
      </div>
    </div>
  )
}