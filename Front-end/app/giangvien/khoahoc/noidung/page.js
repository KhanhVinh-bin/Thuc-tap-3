"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCourse } from "../context/CourseContext"
import { createOrUpdateCourseStep, uploadLessonFile } from "../../lib/instructorApi"
import { generateSlug } from "@/lib/slug-helper"
import "./page.css"

export default function NoiDungChuongPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { courseData, updateCourseData } = useCourse()

  // Dữ liệu bài học - load từ courseData hoặc tạo mới
  const [lessons, setLessons] = useState(() => {
    if (courseData.lessons && courseData.lessons.length > 0) {
      // Convert lessons trực tiếp
      return courseData.lessons.map((l, idx) => ({
        id: l.lessonId || idx + 1,
        title: l.title || "Bài học mới",
        type: l.contentType || "video",
        duration: l.durationSec ? `${Math.floor(l.durationSec / 60)}:${(l.durationSec % 60).toString().padStart(2, '0')}` : "",
        videoName: l.videoUrl ? (l.videoUrl.includes('/uploads/') ? l.videoUrl.split('/').pop() : l.videoUrl) : "",
        videoUrl: l.videoUrl || "",
        videoFile: null,
        docName: (l.file && l.file.filePath) ? (l.file.filePath.includes('/uploads/') ? l.file.filePath.split('/').pop() : l.file.filePath) : "",
        filePath: (l.file && l.file.filePath) ? l.file.filePath : "",
        docFile: null,
        lessonId: l.lessonId || 0,
        sortOrder: l.sortOrder || idx + 1,
      }))
    }
    return [{ id: 1, title: "Bài học mới", type: "video", duration: "", videoName: "", videoUrl: "", videoFile: null, docName: "", filePath: "", docFile: null, lessonId: 0, sortOrder: 1 }]
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  
  // Helper: Lưu file object để upload sau
  const updateLesson = (lid, patch) => {
    setLessons(lessons.map(l => {
      if (l.id !== lid) return l
      const updated = { ...l, ...patch }
      // Nếu là file upload mới, lưu file object
      if (patch.videoFile && patch.videoFile instanceof File) {
        // ✅ Cleanup old blob URL nếu có
        if (updated.videoUrl && updated.videoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(updated.videoUrl)
        }
        updated.videoFile = patch.videoFile
        updated.videoName = patch.videoFile.name
        // ✅ Tạo preview URL để hiển thị video ngay (chấp nhận tất cả định dạng video)
        updated.videoUrl = URL.createObjectURL(patch.videoFile)
        console.log("✅ Video preview URL created:", {
          url: updated.videoUrl,
          fileName: patch.videoFile.name,
          fileType: patch.videoFile.type,
          fileSize: patch.videoFile.size
        })
      }
      if (patch.docFile && patch.docFile instanceof File) {
        // ✅ Cleanup old blob URL nếu có
        if (updated.filePath && updated.filePath.startsWith('blob:')) {
          URL.revokeObjectURL(updated.filePath)
        }
        updated.docFile = patch.docFile
        updated.docName = patch.docFile.name
        // Tạo preview URL chỉ để hiển thị (cho document có thể không cần)
        // updated.filePath = URL.createObjectURL(patch.docFile)
      }
      return updated
    }))
  }
  
  // ✅ Cleanup blob URLs khi component unmount
  useEffect(() => {
    return () => {
      lessons.forEach(ls => {
        if (ls.videoUrl && ls.videoUrl.startsWith('blob:')) {
          URL.revokeObjectURL(ls.videoUrl)
        }
        if (ls.filePath && ls.filePath.startsWith('blob:')) {
          URL.revokeObjectURL(ls.filePath)
        }
      })
    }
  }, [])

  const [openTypeKey, setOpenTypeKey] = useState(null)
  const closeMenuRef = useRef(null)

  useEffect(() => {
    const onDocClick = (e) => {
      if (!closeMenuRef.current) return
      if (!closeMenuRef.current.contains(e.target)) {
        setOpenTypeKey(null)
      }
    }
    document.addEventListener("click", onDocClick)
    return () => document.removeEventListener("click", onDocClick)
  }, [])

  const addLesson = () => {
    const nextId = (lessons[lessons.length - 1]?.id || 0) + 1
    setLessons([...lessons, { id: nextId, title: "Bài học mới", type: "video", duration: "", videoName: "", docName: "", videoFile: null, docFile: null, lessonId: 0, sortOrder: lessons.length + 1 }])
  }
  const removeLesson = (lid) => {
    setLessons(lessons.filter(l => l.id !== lid))
  }

  const toggleTypeMenu = (lid) => {
    setOpenTypeKey(prev => prev === lid ? null : lid)
  }
  const selectType = (lid, type) => {
    updateLesson(lid, { type })
    setOpenTypeKey(null)
  }

  return (
    <div className="gvc-create-root">
      {/* Header steps */}
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
          <div className="gvc-step active">
            <div className="gvc-step-num">3</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Nội dung chương</div>
              <div className="gvc-step-sub">Thêm chương và bài học</div>
            </div>
          </div>
          <div className="gvc-step">
            <div className="gvc-step-num">4</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Xem trước</div>
              <div className="gvc-step-sub">Kiểm tra và hoàn thành</div>
            </div>
          </div>
        </div>
        <div className="gvc-progress is-step3" />
      </div>

      {/* Body */}
      <div className="gvc-create-grid">
        <section className="gvc-card">
          <div className="gvc-card-header">
            <div className="gvc-card-left">
              <div className="gvc-card-icon purple">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="5" width="8" height="14" rx="2" strokeWidth="2" />
                  <rect x="13" y="5" width="8" height="14" rx="2" strokeWidth="2" />
                  <path d="M7 9h2M7 12h2M17 9h2M17 12h2" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="gvc-card-title">Nội dung chương trình học</div>
            </div>
          </div>

          {/* Danh sách bài học */}
          <div className="gvc-lessons-section">
            <div className="gvc-lessons-header">
              <div className="gvc-lessons-title">
                <span className="gvc-lessons-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor">
                    <rect width="256" height="256" fill="none" />
                    <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                    <polyline points="184 112 240 80 240 176 184 144" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                  </svg>
                </span>
                Bài học ({lessons.length})
              </div>
              <button type="button" className="gvc-btn gradient gvc-add-lesson" onClick={addLesson}>
                <span className="gvc-btn-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                  </svg>
                </span>
                <span>Thêm bài học</span>
              </button>
            </div>

            <div className="gvc-lessons-list">
              {lessons.map((ls, lsIndex) => {
                const inputId = `file-${ls.id}`
                const menuKey = ls.id
                return (
                  <div key={ls.id} className="gvc-lesson-card">
                    <div className="gvc-lesson-card-header">
                      <div className="gvc-lesson-number">{lsIndex + 1}</div>
                      <input 
                        className="gvc-lesson-title-input" 
                        value={ls.title}
                        onChange={(e) => updateLesson(ls.id, { title: e.target.value })}
                        placeholder="Tên bài học"
                      />
                      <div className="gvc-type-wrapper" ref={menuKey === openTypeKey ? closeMenuRef : null}>
                        <button 
                          type="button" 
                          className="gvc-btn light gvc-type-toggle" 
                          onClick={() => toggleTypeMenu(ls.id)}
                        >
                          <span className="gvc-type-icon">
                            {ls.type === "video" && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor">
                                <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                <polyline points="184 112 240 80 240 176 184 144" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                              </svg>
                            )}
                            {ls.type === "document" && (
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                                <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h8M8 12h8M8 16h8" />
                              </svg>
                            )}
                          </span>
                          <span className="gvc-type-label">
                            {ls.type === "video" && "Video"}
                            {ls.type === "document" && "Tài liệu"}
                          </span>
                          <span className="gvc-type-arrow">
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor">
                              <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </button>
                        {openTypeKey === menuKey && (
                          <div className="gvc-type-menu">
                            <button type="button" className="gvc-type-menu-item" onClick={() => selectType(ls.id, "video")}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor">
                                <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                <polyline points="184 112 240 80 240 176 184 144" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                              </svg>
                              Video
                            </button>
                            <button type="button" className="gvc-type-menu-item" onClick={() => selectType(ls.id, "document")}>
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                                <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h8M8 12h8M8 16h8" />
                              </svg>
                              Tài liệu
                            </button>
                          </div>
                        )}
                      </div>
                      {lessons.length > 1 && (
                        <button 
                          className="gvc-btn-icon-only danger" 
                          onClick={() => removeLesson(ls.id)}
                          title="Xóa bài học"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className="gvc-lesson-card-body">
                      <div className="gvc-field-row">
                        <div className="gvc-field">
                          <label className="gvc-field-label">Thời lượng (phút:giây)</label>
                          <input 
                            className="gvc-input gvc-lesson-duration" 
                            placeholder="VD: 15:30" 
                            value={ls.duration}
                            onChange={(e) => updateLesson(ls.id, { duration: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="gvc-field">
                        <label className="gvc-field-label">Tải lên nội dung</label>
                        <div className="gvc-upload-buttons">
                          {ls.type === "video" && (
                            <div className="gvc-upload-btn" onClick={() => document.getElementById(`video-${inputId}`)?.click()}>
                              <input 
                                type="file" 
                                id={`video-${inputId}`} 
                                hidden 
                                accept="video/*,.mp4,.webm,.ogg,.avi,.mov,.wmv,.flv,.mkv,.m4v,.3gp,.mpg,.mpeg,.f4v,.asf,.rm,.rmvb,.vob,.ts,.mts,.m2ts,.divx,.xvid,.dv,.swf,.mxf,.m1v,.m2v,.mpv,.m4p,.m4v,.qt,.yuv,.h264,.h265,.hevc,*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    console.log("📤 Video file selected:", {
                                      name: file.name,
                                      type: file.type,
                                      size: file.size,
                                      lastModified: file.lastModified
                                    })
                                    updateLesson(ls.id, { videoFile: file })
                                  }
                                }} 
                              />
                              <span className="gvc-upload-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor">
                                  <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                  <polyline points="184 112 240 80 240 176 184 144" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                </svg>
                              </span>
                              <span className="gvc-upload-text">Tải video</span>
                            </div>
                          )}
                          {(ls.type === "document" || ls.type === "text") && (
                            <div className="gvc-upload-btn" onClick={() => document.getElementById(`doc-${inputId}`)?.click()}>
                              <input 
                                type="file" 
                                id={`doc-${inputId}`} 
                                hidden 
                                accept="*/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) {
                                    updateLesson(ls.id, { docFile: file })
                                  }
                                }} 
                              />
                              <span className="gvc-upload-icon">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor">
                                  <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="2" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h8M8 12h8M8 16h8" />
                                </svg>
                              </span>
                              <span className="gvc-upload-text">Tải tài liệu</span>
                            </div>
                          )}
                        </div>
                        {/* ✅ Video Preview */}
                        {ls.videoFile && ls.videoUrl && ls.videoUrl.startsWith('blob:') && (
                          <div className="gvc-video-preview-container" style={{
                            position: 'relative',
                            marginTop: '12px',
                            marginBottom: '8px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            backgroundColor: '#000',
                            aspectRatio: '16/9',
                            maxHeight: '400px',
                            width: '100%'
                          }}>
                            <video 
                              src={ls.videoUrl}
                              controls
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                              onError={(e) => {
                                console.error("Video preview error:", e)
                                e.target.style.display = 'none'
                              }}
                              onLoadStart={() => {
                                console.log("✅ Video preview loading:", ls.videoName)
                              }}
                            >
                              Trình duyệt của bạn không hỗ trợ video.
                            </video>
                            <button 
                              type="button" 
                              onClick={() => {
                                // Cleanup blob URL
                                if (ls.videoUrl && ls.videoUrl.startsWith('blob:')) {
                                  URL.revokeObjectURL(ls.videoUrl)
                                }
                                updateLesson(ls.id, { videoName: "", videoUrl: "", videoFile: null })
                              }}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                zIndex: 10,
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                cursor: 'pointer',
                                fontSize: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1,
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.9)'}
                              onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.7)'}
                              title="Xóa video"
                            >
                              ×
                            </button>
                          </div>
                        )}
                        
                        {(ls.videoName || ls.docName) && (
                          <div className="gvc-upload-list">
                            {ls.videoName && (
                              <div className="gvc-upload-item">
                                <span className="gvc-upload-type">Video</span>
                                <span className="gvc-upload-filename">{ls.videoName}</span>
                                <button 
                                  type="button" 
                                  className="gvc-remove-btn" 
                                  onClick={() => {
                                    // Cleanup blob URL
                                    if (ls.videoUrl && ls.videoUrl.startsWith('blob:')) {
                                      URL.revokeObjectURL(ls.videoUrl)
                                    }
                                    updateLesson(ls.id, { videoName: "", videoUrl: "", videoFile: null })
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                            {ls.docName && (
                              <div className="gvc-upload-item">
                                <span className="gvc-upload-type">Tài liệu</span>
                                <span className="gvc-upload-filename">{ls.docName}</span>
                                <button 
                                  type="button" 
                                  className="gvc-remove-btn" 
                                  onClick={() => updateLesson(ls.id, { docName: "", filePath: "", docFile: null })}
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {lessons.length === 0 && (
                <div className="gvc-empty-lessons">
                  <p>Chưa có bài học nào. Nhấn "Thêm bài học" để bắt đầu.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" onClick={() => router.push("/giangvien/khoahoc/chitiet")}>
            Quay lại
          </button>
          <div className="gvc-step-info">Bước 3 / 4</div>
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

              if (typeof token === 'string' && token.startsWith('demo_token_')) {
                setError("Vui lòng đăng nhập qua trang login chính thức để lấy token hợp lệ")
                return
              }

              setIsSaving(true)
              setError("")

              try {
                const courseId = courseData.courseId || 0

                const lessonsToSave = lessons.map((ls, lsIdx) => {
                    const durationSec = ls.duration ? 
                      (ls.duration.split(':').reduce((acc, val) => acc * 60 + parseInt(val), 0)) : 0

                    let videoUrl = ls.videoUrl || null
                    let filePath = ls.filePath || null

                    // Xử lý Blob URL - bỏ qua nếu chưa upload (sẽ upload sau)
                    if (videoUrl && videoUrl.startsWith('blob:')) {
                      videoUrl = null
                    }
                    if (filePath && filePath.startsWith('blob:')) {
                      filePath = null
                    }

                    return {
                      lessonId: ls.lessonId || 0,
                      title: ls.title || "",
                      contentType: ls.type === "video" ? "video" : (ls.type === "document" ? "pdf" : "text"),
                      videoUrl: ls.type === "video" && videoUrl && !videoUrl.startsWith('/uploads/') ? videoUrl : null,
                      filePath: ls.type === "video" && !videoUrl && filePath && filePath.startsWith('/uploads/') ? filePath :
                                ((ls.type === "document" || ls.type === "text") && filePath ? filePath : null),
                      durationSec: durationSec,
                      sortOrder: ls.sortOrder || lsIdx + 1,
                      _videoFile: ls.videoFile || null,
                      _docFile: ls.docFile || null,
                    }
                  })

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
                  slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course",
                  lessons: lessonsToSave,
                  status: "published", // ✅ Tự động publish, không cần duyệt
                }

                const result = await createOrUpdateCourseStep(coursePayload, token)
                
                // ✅ Lấy lessons từ result - hỗ trợ cả PascalCase và camelCase
                const savedLessons = result.Lessons || result.lessons || []
                console.log("📝 Created/Updated lessons:", savedLessons)
                console.log("📝 Original lessons count:", lessons.length)
                console.log("📝 Saved lessons count:", savedLessons.length)
                
                // Log chi tiết từng bài học đã lưu
                savedLessons.forEach((sl, idx) => {
                  console.log(`📝 Saved lesson ${idx + 1}:`, {
                    lessonId: sl.LessonId || sl.lessonId,
                    title: sl.Title || sl.title,
                    sortOrder: sl.SortOrder || sl.sortOrder,
                    videoUrl: sl.VideoUrl || sl.videoUrl,
                    filePath: sl.FilePath || sl.filePath
                  })
                })

                // Upload files after lesson creation
                if (savedLessons && savedLessons.length > 0 && courseId > 0) {
                  try {
                    const uploadPromises = []
                    
                    lessons.forEach((ls, lsIdx) => {
                      const expectedSortOrder = ls.sortOrder || lsIdx + 1
                      
                      // ✅ Tìm savedLesson theo nhiều cách để đảm bảo không bỏ sót
                      let savedLesson = null
                      
                      // Cách 1: Tìm theo index (ưu tiên nhất)
                      if (savedLessons[lsIdx]) {
                        const candidate = savedLessons[lsIdx]
                        const candidateLessonId = candidate.LessonId || candidate.lessonId
                        if (candidateLessonId > 0) {
                          savedLesson = candidate
                          console.log(`✅ Found lesson ${lsIdx + 1} by index:`, {
                            lessonId: candidateLessonId,
                            title: candidate.Title || candidate.title
                          })
                        }
                      }
                      
                      // Cách 2: Nếu không tìm được theo index, tìm theo sortOrder
                      if (!savedLesson) {
                        savedLesson = savedLessons.find(l => {
                          const lLessonId = l.LessonId || l.lessonId
                          const lSortOrder = l.SortOrder || l.sortOrder
                          return lLessonId > 0 && lSortOrder === expectedSortOrder
                        })
                        if (savedLesson) {
                          console.log(`✅ Found lesson ${lsIdx + 1} by sortOrder:`, {
                            lessonId: savedLesson.LessonId || savedLesson.lessonId,
                            title: savedLesson.Title || savedLesson.title
                          })
                        }
                      }
                      
                      // Cách 3: Nếu vẫn không tìm được, tìm theo title
                      if (!savedLesson) {
                        savedLesson = savedLessons.find(l => {
                          const lLessonId = l.LessonId || l.lessonId
                          const lTitle = l.Title || l.title
                          return lLessonId > 0 && lTitle === ls.title
                        })
                        if (savedLesson) {
                          console.log(`✅ Found lesson ${lsIdx + 1} by title:`, {
                            lessonId: savedLesson.LessonId || savedLesson.lessonId,
                            title: savedLesson.Title || savedLesson.title
                          })
                        }
                      }
                      
                      // Cách 4: Nếu vẫn không tìm được, lấy bài học đầu tiên có lessonId hợp lệ và chưa được dùng
                      if (!savedLesson && lsIdx < savedLessons.length) {
                        const unusedLesson = savedLessons.find(l => {
                          const lLessonId = l.LessonId || l.lessonId
                          return lLessonId > 0
                        })
                        if (unusedLesson) {
                          savedLesson = unusedLesson
                          console.log(`✅ Found lesson ${lsIdx + 1} by fallback:`, {
                            lessonId: savedLesson.LessonId || savedLesson.lessonId,
                            title: savedLesson.Title || savedLesson.title
                          })
                        }
                      }
                      
                      if (!savedLesson || !(savedLesson.LessonId || savedLesson.lessonId)) {
                        console.error("❌ Cannot find saved lesson for:", {
                          index: lsIdx,
                          title: ls.title,
                          sortOrder: expectedSortOrder,
                          availableLessons: savedLessons.map(l => ({
                            lessonId: l.LessonId || l.lessonId,
                            title: l.Title || l.title,
                            sortOrder: l.SortOrder || l.sortOrder
                          }))
                        })
                        return
                      }
                      
                      const savedLessonId = savedLesson.LessonId || savedLesson.lessonId
                      console.log(`📤 Processing lesson ${lsIdx + 1}:`, {
                        originalTitle: ls.title,
                        savedLessonId: savedLessonId,
                        hasVideoFile: !!(ls.videoFile && ls.videoFile instanceof File),
                        hasDocFile: !!(ls.docFile && ls.docFile instanceof File),
                        type: ls.type
                      })

                      // Upload video
                      if (ls.videoFile && ls.videoFile instanceof File && ls.type === "video") {
                        uploadPromises.push(
                          uploadLessonFile(courseId, savedLessonId, ls.videoFile, token)
                            .then(uploadResult => {
                              console.log(`📤 Upload result for lesson ${lsIdx + 1} (${savedLessonId}):`, uploadResult)
                              // ✅ Hỗ trợ cả PascalCase và camelCase từ API response
                              const uploadedFilePath = uploadResult.file?.FilePath || 
                                                       uploadResult.file?.filePath || 
                                                       uploadResult.filePath ||
                                                       uploadResult.FilePath
                              
                              console.log(`📤 Extracted filePath for lesson ${lsIdx + 1}:`, uploadedFilePath)
                              
                              if (uploadedFilePath) {
                                // ✅ Set videoUrl = filePath vì filePath chính là URL của video đã upload
                                console.log(`📤 Updating lesson ${lsIdx + 1} (${savedLessonId}) with videoUrl:`, uploadedFilePath)
                                return createOrUpdateCourseStep({
                                  courseId: courseId,
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
                                  slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course",
                                  lessons: [{
                                    lessonId: savedLessonId,
                                    title: ls.title || "",
                                    contentType: "video",
                                    videoUrl: uploadedFilePath, // ✅ Set videoUrl từ filePath đã upload
                                    filePath: uploadedFilePath, // ✅ Giữ cả filePath để tương thích
                                    durationSec: savedLesson.DurationSec || savedLesson.durationSec || 0,
                                    sortOrder: savedLesson.SortOrder || savedLesson.sortOrder || expectedSortOrder,
                                  }],
                                }, token).then((updateResult) => {
                                  console.log(`✅ Lesson ${lsIdx + 1} (${savedLessonId}) updated with videoUrl:`, uploadedFilePath)
                                  console.log(`✅ Update result for lesson ${lsIdx + 1}:`, updateResult)
                                }).catch((updateErr) => {
                                  console.error(`❌ Error updating lesson ${lsIdx + 1} with videoUrl:`, updateErr)
                                })
                              } else {
                                console.error(`❌ No filePath in upload result for lesson ${lsIdx + 1} (${savedLessonId}):`, uploadResult)
                              }
                            })
                            .catch(err => {
                              console.error(`❌ Error uploading video for lesson ${lsIdx + 1} (${savedLessonId}):`, err)
                            })
                        )
                      } else if (ls.type === "video" && !ls.videoFile) {
                        // ⚠️ Cảnh báo nếu bài học là video nhưng không có file để upload
                        console.warn(`⚠️ Lesson ${lsIdx + 1} (${savedLessonId}) "${ls.title}" is type video but has no videoFile to upload`)
                      }

                      // Upload document
                      if (ls.docFile && ls.docFile instanceof File && (ls.type === "document" || ls.type === "text")) {
                        uploadPromises.push(
                          uploadLessonFile(courseId, savedLessonId, ls.docFile, token)
                            .then(uploadResult => {
                              const uploadedFilePath = uploadResult.file?.FilePath || 
                                                       uploadResult.file?.filePath || 
                                                       uploadResult.filePath ||
                                                       uploadResult.FilePath
                              if (uploadedFilePath) {
                                return createOrUpdateCourseStep({
                                  courseId: courseId,
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
                                  slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course",
                                  lessons: [{
                                    lessonId: savedLessonId,
                                    title: ls.title || "",
                                    contentType: ls.type === "document" ? "pdf" : "text",
                                    videoUrl: null,
                                    filePath: uploadedFilePath,
                                    durationSec: savedLesson.DurationSec || savedLesson.durationSec || 0,
                                    sortOrder: savedLesson.SortOrder || savedLesson.sortOrder || expectedSortOrder,
                                  }],
                                }, token).then(() => {
                                  console.log(`✅ Lesson ${lsIdx + 1} (${savedLessonId}) updated with document filePath:`, uploadedFilePath)
                                })
                              }
                            })
                            .catch(err => {
                              console.error(`❌ Error uploading document for lesson ${lsIdx + 1} (${savedLessonId}):`, err)
                            })
                        )
                      }
                    })

                    if (uploadPromises.length > 0) {
                      Promise.all(uploadPromises).catch(err => {
                        console.error("Some file uploads failed:", err)
                      })
                    }
                  } catch (err) {
                    console.error("Error processing file uploads:", err)
                  }
                }

                updateCourseData({
                  lessons: result.Lessons || result.lessons || lessonsToSave,
                  courseId: result.CourseId || result.courseId || courseData.courseId,
                  thumbnailUrl: result.ThumbnailUrl || result.thumbnailUrl || courseData.thumbnailUrl || "", // ✅ Giữ thumbnailUrl từ các step trước
                })
                
                console.log("✅ Updated courseData after step 3:", {
                  thumbnailUrl: result.ThumbnailUrl || result.thumbnailUrl || courseData.thumbnailUrl,
                  lessonsCount: (result.Lessons || result.lessons || lessonsToSave).length
                })
                
                router.push("/giangvien/khoahoc/xemtruoc")
              } catch (err) {
                console.error("Error saving course step 3:", err)
                setError(err.message || "Có lỗi xảy ra khi lưu khóa học")
              } finally {
                setIsSaving(false)
              }
            }}
          >
            {isSaving ? "Đang lưu..." : "Tiếp tục"}
          </button>
        </div>
      </div>
    </div>
  )
}
