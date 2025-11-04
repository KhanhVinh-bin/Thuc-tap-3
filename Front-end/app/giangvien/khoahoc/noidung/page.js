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

  // Dữ liệu chương/bài học - load từ courseData hoặc tạo mới
  const [chapters, setChapters] = useState(() => {
    if (courseData.lessons && courseData.lessons.length > 0) {
      // Convert lessons to chapters format (simplified - assuming flat structure)
      return [{
        id: 1,
        title: "Chương 1",
        desc: "",
        lessons: courseData.lessons.map((l, idx) => ({
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
      }]
    }
    return [{
      id: 1,
      title: "Chương 1",
      desc: "",
      lessons: [{ id: 1, title: "Bài học mới", type: "video", duration: "", videoName: "", videoUrl: "", videoFile: null, docName: "", filePath: "", docFile: null, lessonId: 0, sortOrder: 1 }]
    }]
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  
  // Helper: Lưu file object để upload sau
  const updateLesson = (cid, lid, patch) => {
    setChapters(chapters.map(c => {
      if (c.id !== cid) return c
      return { ...c, lessons: c.lessons.map(l => {
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
          // ✅ Tạo preview URL để hiển thị video ngay
          updated.videoUrl = URL.createObjectURL(patch.videoFile)
          console.log("✅ Video preview URL created:", updated.videoUrl)
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
      })}
    }))
  }
  
  // ✅ Cleanup blob URLs khi component unmount
  useEffect(() => {
    return () => {
      chapters.forEach(ch => {
        ch.lessons.forEach(ls => {
          if (ls.videoUrl && ls.videoUrl.startsWith('blob:')) {
            URL.revokeObjectURL(ls.videoUrl)
          }
          if (ls.filePath && ls.filePath.startsWith('blob:')) {
            URL.revokeObjectURL(ls.filePath)
          }
        })
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

  const addChapter = () => {
    const nextId = (chapters[chapters.length - 1]?.id || 0) + 1
    setChapters([...chapters, { id: nextId, title: `Chương ${nextId}`, desc: "", lessons: [] }])
  }
  const updateChapter = (cid, patch) => {
    setChapters(chapters.map(c => c.id === cid ? { ...c, ...patch } : c))
  }
  const removeChapter = (cid) => {
    setChapters(chapters.filter(c => c.id !== cid))
  }
  const addLesson = (cid) => {
    setChapters(chapters.map(c => {
      if (c.id !== cid) return c
      const nextId = (c.lessons[c.lessons.length - 1]?.id || 0) + 1
      return { ...c, lessons: [...c.lessons, { id: nextId, title: "Bài học mới", type: "video", duration: "", videoName: "", docName: "", videoFile: null, docFile: null, lessonId: 0, sortOrder: (c.lessons.length + 1) }] }
    }))
  }
  const removeLesson = (cid, lid) => {
    setChapters(chapters.map(c => c.id === cid ? { ...c, lessons: c.lessons.filter(l => l.id !== lid) } : c))
  }

  const toggleTypeMenu = (cid, lid) => {
    const key = `${cid}-${lid}`
    setOpenTypeKey(prev => prev === key ? null : key)
  }
  const selectType = (cid, lid, type) => {
    updateLesson(cid, lid, { type })
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

          {chapters.map((ch) => (
            <div key={ch.id} className="gvc-chapter">
              {/* Chapter Header */}
              <div className="gvc-chapter-header">
                <input 
                  className="gvc-chapter-title-input" 
                  value={ch.title}
                  onChange={(e) => updateChapter(ch.id, { title: e.target.value })}
                  placeholder="Tên chương"
                />
                {chapters.length > 1 && (
                  <button 
                    className="gvc-btn-icon-only danger" 
                    onClick={() => removeChapter(ch.id)}
                    title="Xóa chương"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Lessons Section */}
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
                    Bài học ({ch.lessons.length})
                  </div>
                  <button type="button" className="gvc-btn gradient gvc-add-lesson" onClick={() => addLesson(ch.id)}>
                    <span className="gvc-btn-icon">
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                      </svg>
                    </span>
                    <span>Thêm bài học</span>
                  </button>
                </div>

                <div className="gvc-lessons-list">
                  {ch.lessons.map((ls, lsIndex) => {
                    const inputId = `file-${ch.id}-${ls.id}`
                    const menuKey = `${ch.id}-${ls.id}`
                    return (
                      <div key={ls.id} className="gvc-lesson-card">
                        <div className="gvc-lesson-card-header">
                          <div className="gvc-lesson-number">{lsIndex + 1}</div>
                          <input 
                            className="gvc-lesson-title-input" 
                            value={ls.title}
                            onChange={(e) => updateLesson(ch.id, ls.id, { title: e.target.value })}
                            placeholder="Tên bài học"
                          />
                          <div className="gvc-type-wrapper" ref={menuKey === openTypeKey ? closeMenuRef : null}>
                            <button 
                              type="button" 
                              className="gvc-btn light gvc-type-toggle" 
                              onClick={() => toggleTypeMenu(ch.id, ls.id)}
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
                                <button type="button" className="gvc-type-menu-item" onClick={() => selectType(ch.id, ls.id, "video")}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="none" stroke="currentColor">
                                    <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                    <polyline points="184 112 240 80 240 176 184 144" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                  </svg>
                                  Video
                                </button>
                                <button type="button" className="gvc-type-menu-item" onClick={() => selectType(ch.id, ls.id, "document")}>
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                                    <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="2" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h8M8 12h8M8 16h8" />
                                  </svg>
                                  Tài liệu
                                </button>
                              </div>
                            )}
                          </div>
                          {ch.lessons.length > 1 && (
                            <button 
                              className="gvc-btn-icon-only danger" 
                              onClick={() => removeLesson(ch.id, ls.id)}
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
                                onChange={(e) => updateLesson(ch.id, ls.id, { duration: e.target.value })}
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
                                    accept="video/*,*/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]
                                      if (file) {
                                        updateLesson(ch.id, ls.id, { videoFile: file })
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
                                        updateLesson(ch.id, ls.id, { docFile: file })
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
                                    updateLesson(ch.id, ls.id, { videoName: "", videoUrl: "", videoFile: null })
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
                                        updateLesson(ch.id, ls.id, { videoName: "", videoUrl: "", videoFile: null })
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
                                      onClick={() => updateLesson(ch.id, ls.id, { docName: "", filePath: "", docFile: null })}
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
                  {ch.lessons.length === 0 && (
                    <div className="gvc-empty-lessons">
                      <p>Chưa có bài học nào. Nhấn "Thêm bài học" để bắt đầu.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add Chapter Button */}
          <div className="gvc-add-chapter-section">
            <button className="gvc-btn light gvc-add-chapter-btn" onClick={addChapter}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
              </svg>
              <span>Thêm chương mới</span>
            </button>
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

                const lessons = chapters.flatMap((ch, chIdx) => 
                  ch.lessons.map((ls, lsIdx) => {
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
                      sortOrder: ls.sortOrder || (chIdx * 100 + lsIdx + 1),
                      _videoFile: ls.videoFile || null,
                      _docFile: ls.docFile || null,
                    }
                  })
                )

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
                  tagIds: courseData.tagIds || [],
                  slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course",
                  lessons: lessons,
                  status: "published", // ✅ Tự động publish, không cần duyệt
                }

                const result = await createOrUpdateCourseStep(coursePayload, token)
                console.log("📝 Created/Updated lessons:", result.lessons)

                // Upload files after lesson creation
                if (result.lessons && result.lessons.length > 0 && courseId > 0) {
                  try {
                    const uploadPromises = []
                    
                    chapters.forEach((ch, chIdx) => {
                      ch.lessons.forEach((ls, lsIdx) => {
                        const expectedSortOrder = ls.sortOrder || (chIdx * 100 + lsIdx + 1)
                        const savedLesson = result.lessons.find(l => 
                          l.lessonId > 0 && 
                          (l.sortOrder === expectedSortOrder || 
                           (l.title === ls.title && Math.abs((l.sortOrder || 0) - expectedSortOrder) < 10))
                        )
                        
                        if (!savedLesson || !savedLesson.lessonId) {
                          console.warn("⚠️ Cannot find saved lesson for:", ls.title)
                          return
                        }

                        // Upload video
                        if (ls.videoFile && ls.videoFile instanceof File && ls.type === "video") {
                          uploadPromises.push(
                            uploadLessonFile(courseId, savedLesson.lessonId, ls.videoFile, token)
                              .then(uploadResult => {
                                const uploadedFilePath = uploadResult.file?.filePath || uploadResult.filePath
                                if (uploadedFilePath) {
                                  // ✅ Set videoUrl = filePath vì filePath chính là URL của video đã upload
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
                                    tagIds: courseData.tagIds || [],
                                    slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course",
                                    lessons: [{
                                      lessonId: savedLesson.lessonId,
                                      title: ls.title || "",
                                      contentType: "video",
                                      videoUrl: uploadedFilePath, // ✅ Set videoUrl từ filePath đã upload
                                      filePath: uploadedFilePath, // ✅ Giữ cả filePath để tương thích
                                      durationSec: savedLesson.durationSec || 0,
                                      sortOrder: savedLesson.sortOrder || expectedSortOrder,
                                    }],
                                  }, token).then(() => {
                                    console.log("✅ Lesson", savedLesson.lessonId, "updated with videoUrl:", uploadedFilePath)
                                  })
                                }
                              })
                              .catch(err => {
                                console.error("Error uploading video for lesson", savedLesson.lessonId, ":", err)
                              })
                          )
                        }

                        // Upload document
                        if (ls.docFile && ls.docFile instanceof File && (ls.type === "document" || ls.type === "text")) {
                          uploadPromises.push(
                            uploadLessonFile(courseId, savedLesson.lessonId, ls.docFile, token)
                              .then(uploadResult => {
                                const uploadedFilePath = uploadResult.file?.filePath || uploadResult.filePath
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
                                    tagIds: courseData.tagIds || [],
                                    slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course",
                                    lessons: [{
                                      lessonId: savedLesson.lessonId,
                                      title: ls.title || "",
                                      contentType: ls.type === "document" ? "pdf" : "text",
                                      videoUrl: null,
                                      filePath: uploadedFilePath,
                                      durationSec: savedLesson.durationSec || 0,
                                      sortOrder: savedLesson.sortOrder || expectedSortOrder,
                                    }],
                                  }, token).then(() => {
                                    console.log("✅ Lesson", savedLesson.lessonId, "updated with document filePath:", uploadedFilePath)
                                  })
                                }
                              })
                              .catch(err => {
                                console.error("Error uploading document for lesson", savedLesson.lessonId, ":", err)
                              })
                          )
                        }
                      })
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
                  lessons: result.Lessons || result.lessons || lessons,
                  courseId: result.CourseId || result.courseId || courseData.courseId,
                  thumbnailUrl: result.ThumbnailUrl || result.thumbnailUrl || courseData.thumbnailUrl || "", // ✅ Giữ thumbnailUrl từ các step trước
                })
                
                console.log("✅ Updated courseData after step 3:", {
                  thumbnailUrl: result.ThumbnailUrl || result.thumbnailUrl || courseData.thumbnailUrl,
                  lessonsCount: (result.Lessons || result.lessons || lessons).length
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
