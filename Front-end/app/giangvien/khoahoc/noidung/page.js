"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import "./page.css"

export default function NoiDungChuongPage() {
  const router = useRouter()

  // Dữ liệu chương/bài học
  const [chapters, setChapters] = useState([
    {
      id: 1,
      title: "Chương 1",
      desc: "Mô tả sơ bộ nội dung chương...",
      lessons: [
        { id: 1, title: "Bài học mới", type: "video", duration: "", fileName: "" }
      ]
    }
  ])

  const [openTypeKey, setOpenTypeKey] = useState(null) // ví dụ: "chapterId-lessonId"
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
      return { ...c, lessons: [...c.lessons, { id: nextId, title: "Bài học mới", type: "video", duration: "", fileName: "" }] }
    }))
  }
  const removeLesson = (cid, lid) => {
    setChapters(chapters.map(c => c.id === cid ? { ...c, lessons: c.lessons.filter(l => l.id !== lid) } : c))
  }
  const updateLesson = (cid, lid, patch) => {
    setChapters(chapters.map(c => {
      if (c.id !== cid) return c
      return { ...c, lessons: c.lessons.map(l => l.id === lid ? { ...l, ...patch } : l) }
    }))
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
      {/* Header steps: , active step 3 */}
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
              <div >
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
              


              <div className="gvc-lessons-head">
                <div className="gvc-lessons-title">
                  <span className="gvc-lessons-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="14" height="14" fill="none" stroke="currentColor">
                      <rect width="256" height="256" fill="none" />
                      <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                      <polyline points="184 112 240 80 240 176 184 144" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                    </svg>
                  </span>
                  Bài học ({ch.lessons.length})
                </div>
                <button type="button" className="gvc-btn gradient gvc-add-lesson" onClick={()=>addLesson(ch.id)}>
                  <span className="gvc-btn-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v12M6 12h12" />
                    </svg>
                  </span>
                  <span>Thêm bài học</span>
                </button>
              </div>

              <div className="gvc-lessons">
                {ch.lessons.map((ls, lsIndex) => {
                  const inputId = `file-${ch.id}-${ls.id}`
                  const menuKey = `${ch.id}-${ls.id}`
                  return (
                    <div key={ls.id} className="gvc-lesson-row" ref={menuKey === openTypeKey ? closeMenuRef : null}>
                      <div className="gvc-lesson-num">{lsIndex + 1}</div>

                      <input className="gvc-input gvc-lesson-title" value={ls.title}
                        onChange={(e)=>updateLesson(ch.id, ls.id, { title: e.target.value })} />

                      <div className="gvc-type">
                        <button type="button" className="gvc-btn light gvc-type-toggle" onClick={()=>toggleTypeMenu(ch.id, ls.id)}>
                          <span className="gvc-type-icon" aria-hidden="true">
                            {ls.type === "video" && (
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16" fill="none" stroke="currentColor">
                                <rect width="256" height="256" fill="none" />
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
                            {ls.type === "quiz" && (
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                              </svg>
                            )}
                            {ls.type === "voice" && (
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                                <rect x="9" y="5" width="6" height="10" rx="3" strokeWidth="2" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v3m-4-6a4 4 0 008 0" />
                              </svg>
                            )}
                          </span>
                          <span className="gvc-type-label">
                            {ls.type === "video" && "Video"}
                            {ls.type === "document" && "Tài liệu"}
                            {ls.type === "quiz" && "Bài kiểm tra"}
                          </span>
                          <span className="gvc-chevron" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#9ca3af">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" />
                            </svg>
                          </span>
                        </button>
                        {openTypeKey === menuKey && (
                          <div className="gvc-type-menu">
                            <button className="gvc-type-item" onClick={()=>selectType(ch.id, ls.id, "video")}>
                              <span className="gvc-type-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="16" height="16" fill="none" stroke="currentColor">
                                  <rect width="256" height="256" fill="none" />
                                  <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" stroke-linecap="round" stroke-linejoin="round" stroke-width="12" />
                                  <polyline points="184 112 240 80 240 176 184 144" stroke-linecap="round" stroke-linejoin="round" stroke-width="12" />
                                </svg>
                              </span>
                              <span>Video</span>
                              {ls.type === "video" && (
                                <span className="gvc-type-check" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9ca3af">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                  </svg>
                                </span>
                              )}
                            </button>
                            <button className="gvc-type-item" onClick={()=>selectType(ch.id, ls.id, "document")}>
                              <span className="gvc-type-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                                  <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="2" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h8M8 12h8M8 16h8" />
                                </svg>
                              </span>
                              <span>Tài liệu</span>
                              {ls.type === "document" && (
                                <span className="gvc-type-check" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9ca3af">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                  </svg>
                                </span>
                              )}
                            </button>
                            <button className="gvc-type-item" onClick={()=>selectType(ch.id, ls.id, "quiz")}>
                              <span className="gvc-type-icon">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor">
                                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                </svg>
                              </span>
                              <span>Bài kiểm tra</span>
                              {ls.type === "quiz" && (
                                <span className="gvc-type-check" aria-hidden="true">
                                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#9ca3af">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                  </svg>
                                </span>
                              )}
                            </button>

                          </div>
                        )}
                      </div>

                      <button type="button" className="gvc-btn icon" onClick={()=>removeLesson(ch.id, ls.id)}>×</button>

                      <div className="gvc-lesson-controls">
                        <div className="gvc-field">
                          <div className="gvc-field-label">Thời lượng</div>
                          <input className="gvc-input gvc-lesson-duration" placeholder="VD: 15:30" value={ls.duration}
                            onChange={(e)=>updateLesson(ch.id, ls.id, { duration: e.target.value })} />
                        </div>

                        <div className="gvc-field">
                          <div className="gvc-field-label">Tải lên nội dung</div>
                          <div className="gvc-lesson-content">
                            <div className="gvc-drop" onClick={()=>document.getElementById(inputId)?.click()}>
                              <input type="file" id={inputId} hidden
                                accept={ls.type === "video" ? "video/*" : ls.type === "voice" ? "audio/*" : ls.type === "document" ? "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "*/*"}
                                onChange={(e)=>{
                                  const name = e.target.files?.[0]?.name || ""
                                  updateLesson(ch.id, ls.id, { fileName: name })
                                }} />
                              <span className="gvc-upload-icon" aria-hidden="true">
                                {ls.type === "video" && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="20" height="20" fill="none" stroke="#64748b">
                                    <rect width="256" height="256" fill="none" />
                                    <path d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                    <polyline points="184 112 240 80 240 176 184 144" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" />
                                  </svg>
                                )}
                                {ls.type === "document" && (
                                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b">
                                    <rect x="6" y="4" width="12" height="16" rx="2" strokeWidth="2" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 8h8M8 12h8M8 16h8" />
                                  </svg>
                                )}
                                {ls.type === "quiz" && (
                                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b">
                                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" />
                                  </svg>
                                )}
                                {ls.type === "voice" && (
                                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b">
                                    <rect x="9" y="5" width="6" height="10" rx="3" strokeWidth="2" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v3m-4-6a4 4 0 008 0" />
                                  </svg>
                                )}
                              </span>
                              <span className="gvc-drop-text">
                                {ls.type === "document" ? "Tài liệu" : ls.type === "voice" ? "Audio" : ls.type === "quiz" ? "Bài kiểm tra" : "Video"}
                              </span>
                            </div>
                            {ls.fileName && <div className="gvc-upload-name">{ls.fileName}</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Footer  */}
      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" onClick={() => router.push("/giangvien/khoahoc/chitiet")}>Quay lại</button>
          <div className="gvc-step-info">Bước 3 / 4</div>
          <button className="gvc-btn primary" onClick={() => router.push("/giangvien/khoahoc/xemtruoc")}>Tiếp tục →</button>
        </div>
      </div>
    </div>
  )
}