'use client'

import Footer from "@/components/footer"
import Link from "next/link"
import "../../tongquan/page.css"
import "../page.css"
import "./page.css"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function GiangVienKhoaHocChinhSuaPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [chapters, setChapters] = useState([])
  // Thêm state cho bài học bổ sung vào các chương tĩnh
  const [extraLessons, setExtraLessons] = useState({ chapter1: [], chapter2: [] })

  const { toast } = useToast()

  // Helper function để lấy accept attribute dựa trên loại bài học
  const getFileAcceptByType = (lessonType) => {
    switch (lessonType) {
      case 'Video':
        return 'video/*'
      case 'Tài liệu':
        return '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt'
      case 'Bài kiểm tra':
        return '.pdf,.doc,.docx,.txt'
      case 'Bài tập':
        return '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip'
      default:
        return 'video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.zip'
    }
  }

  // Function để cập nhật accept attribute của input file
  const updateFileInputAccept = (inputId, lessonType) => {
    const input = document.getElementById(inputId)
    if (input) {
      input.setAttribute('accept', getFileAcceptByType(lessonType))
    }
  }
  
  const addChapter = () => {
    setChapters(prev => [...prev, { 
      id: Date.now(), 
      title: "Chương mới", 
      lessons: [],
      expanded: true,
      isEditing: false
    }])
  }

  const addLesson = (chapterId) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId 
        ? { 
            ...ch, 
            lessons: [...ch.lessons, {
              id: Date.now(),
              title: "Bài học mới",
              type: "Video",
              duration: "10:00",
              support: "Tài liệu hỗ trợ",
              docs: [],
              status: "draft"
            }],
            expanded: true
          }
        : ch
    ))
  }

  const toggleChapter = (chapterId) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId ? { ...ch, expanded: !ch.expanded } : ch
    ))
  }

  const updateChapterTitle = (chapterId, newTitle) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId ? { ...ch, title: newTitle, isEditing: false } : ch
    ))
  }

  const startEditingChapter = (chapterId) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId ? { ...ch, isEditing: true } : ch
    ))
  }

  const updateLessonTitle = (chapterId, lessonId, newTitle) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId 
        ? {
            ...ch,
            lessons: ch.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, title: newTitle } : lesson
            )
          }
        : ch
    ))
  }

  const deleteLesson = (chapterId, lessonId) => {
    setChapters(prev => prev.map(ch => 
      ch.id === chapterId 
        ? { ...ch, lessons: ch.lessons.filter(lesson => lesson.id !== lessonId) }
        : ch
    ))
  }

  const deleteChapter = (chapterId) => {
    setChapters(prev => prev.filter(ch => ch.id !== chapterId))
  }

  // Thêm bài vào chương tĩnh (Chapter 1/2)
  const addLessonToStatic = (chapterKey) => {
    setExtraLessons(prev => ({
      ...prev,
      [chapterKey]: [
        ...prev[chapterKey],
        { id: Date.now(), title: "Bài học mới", type: "Video", duration: "10:00", support: "Tài liệu hỗ trợ", docs: [], status: "draft" }
      ]
    }))
  }

  // Trạng thái cho hai bài tĩnh (React là gì?, Môi trường phát triển)
  const [staticState, setStaticState] = useState({
    l1: { deleted: false, fileName: "", fileUrl: "", docs: [] },
    l2: { deleted: false, fileName: "", fileUrl: "", docs: [] },
  })

  // Toggle hiển thị bài trong Chapter 1
  const [chapter1Expanded, setChapter1Expanded] = useState(true)
  const toggleChapter1 = () => setChapter1Expanded(prev => !prev)
  
  // Tổng số bài trong Chapter 1 (tĩnh + thêm mới)
  const chapter1Count = (staticState?.l1?.deleted ? 0 : 1) + (staticState?.l2?.deleted ? 0 : 1) + extraLessons.chapter1.length

  // Thêm handler lưu cài đặt
  const saveSettings = () => {
    toast({
      title: "Đã lưu cài đặt",
      description: "Cài đặt đã được lưu.",
    })
  }

  // Handlers cho bài tĩnh
  const focusStaticTitle = (key) => {
    const el = document.getElementById(`static-${key}-title`)
    el?.focus()
  }
  const uploadStaticFile = (key) => {
    document.getElementById(`static-${key}-file`)?.click()
  }
  const onStaticFileChange = (key, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fileUrl = URL.createObjectURL(file)
    setStaticState(prev => ({
      ...prev,
      [key]: { ...prev[key], fileName: file.name, fileUrl }
    }))
  }
  const deleteStaticLesson = (key) => {
    setStaticState(prev => ({
      ...prev,
      [key]: { ...prev[key], deleted: true }
    }))
  }

  // Upload/Xóa tài liệu cho bài tĩnh
  const uploadStaticDoc = (key) => {
    document.getElementById(`static-${key}-doc`)?.click()
  }
  const onStaticDocChange = (key, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setStaticState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        docs: [
          ...(prev[key].docs || []),
          ...files.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))
        ]
      }
    }))
    e.target.value = ''
  }
  const deleteStaticDoc = (key, index) => {
    setStaticState(prev => {
      const docs = [...(prev[key].docs || [])]
      const removed = docs.splice(index, 1)[0]
      if (removed?.url) URL.revokeObjectURL(removed.url)
      return { ...prev, [key]: { ...prev[key], docs } }
    })
  }

  // Upload hợp nhất cho bài tĩnh (video + tài liệu)
  const uploadStaticAsset = (key) => {
    document.getElementById(`static-${key}-asset`)?.click()
  }
  const onStaticAssetChange = (key, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setStaticState(prev => {
      const next = { ...prev[key] }
      const videoFile = files.find(f => f.type?.startsWith('video'))
      const docFiles = files.filter(f => !f.type?.startsWith('video'))
      if (videoFile) {
        next.fileName = videoFile.name
        next.fileUrl = URL.createObjectURL(videoFile)
      }
      if (docFiles.length) {
        next.docs = [
          ...(prev[key].docs || []),
          ...docFiles.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))
        ]
      }
      return { ...prev, [key]: next }
    })
    e.target.value = ''
  }

  // Handlers cho bài thêm vào Chapter 1/2
  const focusExtraTitle = (chapterKey, lessonId) => {
    const el = document.getElementById(`extra-${chapterKey}-${lessonId}-title`)
    el?.focus()
  }
  const uploadExtraLessonFile = (chapterKey, lessonId) => {
    document.getElementById(`extra-${chapterKey}-${lessonId}-file`)?.click()
  }
  const onExtraFileChange = (chapterKey, lessonId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fileUrl = URL.createObjectURL(file)
    setExtraLessons(prev => ({
      ...prev,
      [chapterKey]: prev[chapterKey].map(lesson =>
        lesson.id === lessonId ? { ...lesson, fileName: file.name, fileUrl } : lesson
      )
    }))
  }
  const deleteExtraLesson = (chapterKey, lessonId) => {
    setExtraLessons(prev => ({
      ...prev,
      [chapterKey]: prev[chapterKey].filter(lesson => lesson.id !== lessonId)
    }))
  }

  // Upload/Xóa tài liệu cho bài thêm mới (Chapter 1/2)
  const uploadExtraDoc = (chapterKey, lessonId) => {
    document.getElementById(`extra-${chapterKey}-${lessonId}-doc`)?.click()
  }
  const onExtraDocChange = (chapterKey, lessonId, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setExtraLessons(prev => ({
      ...prev,
      [chapterKey]: prev[chapterKey].map(lesson =>
        lesson.id === lessonId
          ? {
              ...lesson,
              docs: [
                ...(lesson.docs || []),
                ...files.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))
              ]
            }
          : lesson
      )
    }))
    e.target.value = ''
  }
  const deleteExtraDoc = (chapterKey, lessonId, index) => {
    setExtraLessons(prev => ({
      ...prev,
      [chapterKey]: prev[chapterKey].map(lesson => {
        if (lesson.id !== lessonId) return lesson
        const docs = [...(lesson.docs || [])]
        const removed = docs.splice(index, 1)[0]
        if (removed?.url) URL.revokeObjectURL(removed.url)
        return { ...lesson, docs }
      })
    }))
  }

  // Upload hợp nhất cho bài thêm mới (Chapter 1/2)
  const uploadExtraAsset = (chapterKey, lessonId) => {
    document.getElementById(`extra-${chapterKey}-${lessonId}-asset`)?.click()
  }
  const onExtraAssetChange = (chapterKey, lessonId, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setExtraLessons(prev => ({
      ...prev,
      [chapterKey]: prev[chapterKey].map(lesson => {
        if (lesson.id !== lessonId) return lesson
        const videoFile = files.find(f => f.type?.startsWith('video'))
        const docFiles = files.filter(f => !f.type?.startsWith('video'))
        return {
          ...lesson,
          ...(videoFile ? { fileName: videoFile.name, fileUrl: URL.createObjectURL(videoFile) } : {}),
          docs: [
            ...(lesson.docs || []),
            ...docFiles.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))
          ]
        }
      })
    }))
    e.target.value = ''
  }

  // Handlers cho bài trong chương động
  const focusDynamicTitle = (chapterId, lessonId) => {
    const el = document.getElementById(`dyn-${chapterId}-${lessonId}-title`)
    el?.focus()
  }
  const uploadLessonFile = (chapterId, lessonId) => {
    document.getElementById(`dyn-${chapterId}-${lessonId}-file`)?.click()
  }
  const onDynamicFileChange = (chapterId, lessonId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fileUrl = URL.createObjectURL(file)
    setChapters(prev => prev.map(ch =>
      ch.id === chapterId
        ? {
            ...ch,
            lessons: ch.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, fileName: file.name, fileUrl } : lesson
            )
          }
        : ch
    ))
  }

  // Upload/Xóa tài liệu cho bài chương động
  const uploadDynamicDoc = (chapterId, lessonId) => {
    document.getElementById(`dyn-${chapterId}-${lessonId}-doc`)?.click()
  }
  const onDynamicDocChange = (chapterId, lessonId, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setChapters(prev => prev.map(ch =>
      ch.id === chapterId
        ? {
            ...ch,
            lessons: ch.lessons.map(lesson =>
              lesson.id === lessonId
                ? {
                    ...lesson,
                    docs: [
                      ...(lesson.docs || []),
                      ...files.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))
                    ]
                  }
                : lesson
            )
          }
        : ch
    ))
    e.target.value = ''
  }
  const deleteDynamicDoc = (chapterId, lessonId, index) => {
    setChapters(prev => prev.map(ch =>
      ch.id === chapterId
        ? {
            ...ch,
            lessons: ch.lessons.map(lesson => {
              if (lesson.id !== lessonId) return lesson
              const docs = [...(lesson.docs || [])]
              const removed = docs.splice(index, 1)[0]
              if (removed?.url) URL.revokeObjectURL(removed.url)
              return { ...lesson, docs }
            })
          }
        : ch
    ))
  }

  // Upload hợp nhất cho bài chương động (video + tài liệu)
  const uploadDynamicAsset = (chapterId, lessonId) => {
    document.getElementById(`dyn-${chapterId}-${lessonId}-asset`)?.click()
  }
  const onDynamicAssetChange = (chapterId, lessonId, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setChapters(prev => prev.map(ch =>
      ch.id === chapterId
        ? {
            ...ch,
            lessons: ch.lessons.map(lesson => {
              if (lesson.id !== lessonId) return lesson
              const videoFile = files.find(f => f.type?.startsWith('video'))
              const docFiles = files.filter(f => !f.type?.startsWith('video'))
              return {
                ...lesson,
                ...(videoFile ? { fileName: videoFile.name, fileUrl: URL.createObjectURL(videoFile) } : {}),
                docs: [
                  ...(lesson.docs || []),
                  ...docFiles.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f) }))
                ]
              }
            })
          }
        : ch
    ))
    e.target.value = ''
  }

  return (
    <div className={`gv-dashboard-root ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Header/topbar giống các trang giảng viên */}
      <header className="gv-topbar" role="banner">
        <div className="gv-topbar-left">
          <div className="gv-brand-mini">
            <span className="gv-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e3a8a">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </span>
            <span className="gv-brand-text">EduLearn</span>
          </div>
          <span className="gv-divider" aria-hidden="true" />
          <div className="gv-breadcrumb" aria-label="Breadcrumb"> 
            <button 
              type="button" 
              className="gv-collapse-btn" 
              aria-label={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"} 
              onClick={() => setSidebarCollapsed(v => !v)} 
            > 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{transform: sidebarCollapsed ? "scaleX(-1)" : "none"}}> 
                <polyline points="9 6 5 12 9 18" strokeLinecap="round" strokeLinejoin="round" /> 
                <line x1="13" y1="7" x2="20" y2="7" strokeLinecap="round" /> 
                <line x1="13" y1="12" x2="20" y2="12" strokeLinecap="round" /> 
                <line x1="13" y1="17" x2="20" y2="17" strokeLinecap="round" /> 
              </svg> 
            </button> 
             <span className="gv-bc-label">Chỉnh sửa</span> 
          </div>
        </div>
        <div className="gv-topbar-right">

          <div className="gv-avatar" title="Tài khoản">
            <span className="gv-presence" />
          </div>
        </div>
      </header>

      <div className="gv-dashboard">
        {/* Sidebar giống các trang Tổng quan/Khóa học, đặt Khóa học active */}
        <aside className="gv-sidebar">
          <nav className="gv-nav">
            <ul>
              <li><Link href="/giangvien/tongquan"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="18" height="15" aria-hidden="true"><path d="M20 42 L60 18 L100 42 V82 H20 Z" fill="none" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><path d="M24 82 H96" fill="none" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><path d="M34 52 C44 66,76 66,86 52" fill="none" stroke="#2b2b2b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/></svg></span> Tổng quan</Link></li>
              <li><Link href="/giangvien/khoahoc" className="active"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><rect width="256" height="256" fill="none"/><path d="M128,88 a32,32,0,0,1,32-32 h64 a8,8,0,0,1,8,8 V192 a8,8,0,0,1-8,8 H160 a32,32,0,0,0-32,32" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M24,192 a8,8,0,0,0,8,8 H96 a32,32,0,0,1,32,32 V88 A32,32,0,0,0,96,56 H32 a8,8,0,0,0-8,8 Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/></svg></span> Khóa học</Link></li>
              <li><Link href="/giangvien/hocvien"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#000000" d="M10 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8z M4 8a6 6 0 1 1 12 0A6 6 0 0 1 4 8z m12.828-4.243a1 1 0 0 1 1.415 0 a6 6 0 0 1 0 8.486 a1 1 0 1 1-1.415-1.415 a4 4 0 0 0 0-5.656 a1 1 0 0 1 0-1.415z m.702 13a1 1 0 0 1 1.212-.727 c1.328.332 2.169 1.18 2.652 2.148 c.468.935.606 1.98.606 2.822 a1 1 0 1 1-2 0 c0-.657-.112-1.363-.394-1.928 c-.267-.533-.677-.934-1.349-1.102 a1 1 0 0 1-.727-1.212z M6.5 18 C5.24 18 4 19.213 4 21 a1 1 0 1 1-2 0 c0-2.632 1.893-5 4.5-5h7 c2.607 0 4.5 2.368 4.5 5 a1 1 0 1 1-2 0 c0-1.787-1.24-3-2.5-3h-7z" /></svg></span> Học viên</Link></li>
              <li><Link href="/giangvien/doanhthu"><span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><rect width="256" height="256" fill="none" /><line x1="128" y1="168" x2="128" y2="184" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><line x1="128" y1="72" x2="128" y2="88" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="128" cy="128" r="96" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><path d="M104,168h36a20,20,0,0,0,0-40H116a20,20,0,0,1,0-40h36" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Doanh thu</Link></li>
              <li>
                <Link href="/giangvien/danhgia">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" aria-hidden="true">
                      {/* Font Awesome Free 6.5.1 - https://fontawesome.com - License: https://fontawesome.com/license/free */}
                      <path d="M123.6 391.3 c12.9-9.4 29.6-11.8 44.6-6.4 c26.5 9.6 56.2 15.1 87.8 15.1 c124.7 0 208-80.5 208-160 s-83.3-160-208-160 S48 160.5 48 240 c0 32 12.4 62.8 35.7 89.2 c8.6 9.7 12.8 22.5 11.8 35.5 c-1.4 18.1-5.7 34.7-11.3 49.4 c17-7.9 31.1-16.7 39.4-22.7 z M21.2 431.9 c1.8-2.7 3.5-5.4 5.1-8.1 c10-16.6 19.5-38.4 21.4-62.9 C17.7 326.8 0 285.1 0 240 C0 125.1 114.6 32 256 32 s256 93.1 256 208 s-114.6 208-256 208 c-37.1 0-72.3-6.4-104.1-17.9 c-11.9 8.7-31.3 20.6-54.3 30.6 c-15.1 6.6-32.3 12.6-50.1 16.1 c-.8 .2-1.6 .3-2.4 .5 c-4.4 .8-8.7 1.5-13.2 1.9 c-.2 0-.5 .1-.7 .1 c-5.1 .5-10.2 .8-15.3 .8 c-6.5 0-12.3-3.9-14.8-9.9 c-2.5-6-1.1-12.8 3.4-17.4 c4.1-4.2 7.8-8.7 11.3-13.5 c1.7-2.3 3.3-4.6 4.8-6.9 c.1-.2 .2-.3 .3-.5 z" />
                    </svg>
                  </span>
                  Đánh giá & Phản hồi
                </Link>
              </li>
              <li><Link href="/giangvien/danhgia"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true"><path d="M416,221.25 V416 a48,48,0,0,1-48,48 H144 a48,48,0,0,1-48-48 V96 a48,48,0,0,1,48-48 h98.75 a32,32,0,0,1,22.62,9.37 L406.63,198.63 A32,32,0,0,1,416,221.25Z" fill="none" stroke="#000" strokeLinejoin="round" strokeWidth="32" /><path d="M256,56 V176 a32,32,0,0,0,32,32 H408" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /><line x1="176" y1="288" x2="336" y2="288" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /><line x1="176" y1="368" x2="336" y2="368" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /></svg></span> Hồ sơ</Link></li>
              <li><Link href="/giangvien/caidat"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true"><path d="M262.29,192.31 a64,64,0,1,0,57.4,57.4 A64.13,64.13,0,0,0,262.29,192.31Z M416.39,256 a154.34,154.34,0,0,1-1.53,20.79 l45.21,35.46 A10.81,10.81,0,0,1,462.52,326 l-42.77,74 a10.81,10.81,0,0,1-13.14,4.59 l-44.9-18.08 a16.11,16.11,0,0,0-15.17,1.75 A164.48,164.48,0,0,1,325,400.8 a15.94,15.94,0,0,0-8.82,12.14 l-6.73,47.89 A11.08,11.08,0,0,1,298.77,470 H213.23 a11.11,11.11,0,0,1-10.69-8.87 l-6.72-47.82 a16.07,16.07,0,0,0-9-12.22 a155.3,155.3,0,0,1-21.46-12.57 a16,16,0,0,0-15.11-1.71 l-44.89,18.07 a10.81,10.81,0,0,1-13.14-4.58 l-42.77-74 a10.8,10.8,0,0,1,2.45-13.75 l38.21-30 a16.05,16.05,0,0,0,6-14.08 c-.36-4.17-.58-8.33-.58-12.5 s.21-8.27.58-12.35 a16,16,0,0,0-6.07-13.94 l-38.19-30 A10.81,10.81,0,0,1,49.48,186 l42.77-74 a10.81,10.81,0,0,1,13.14-4.59 l44.9,18.08 a16.11,16.11,0,0,0,15.17-1.75 A164.48,164.48,0,0,1,187,111.2 a15.94,15.94,0,0,0,8.82-12.14 l6.73-47.89 A11.08,11.08,0,0,1,213.23,42 h85.54 a11.11,11.11,0,0,1,10.69,8.87 l6.72,47.82 a16.07,16.07,0,0,0,9,12.22 a155.3,155.3,0,0,1,21.46,12.57 a16,16,0,0,0,15.11,1.71 l44.89-18.07 a10.81,10.81,0,0,1,13.14,4.58 l42.77,74 a10.8,10.8,0,0,1-2.45,13.75 l-38.21,30 a16.05,16.05,0,0,0-6.05,14.08 C416.17,247.67,416.39,251.83,416.39,256Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /></svg></span> Cài đặt</Link></li>
              <li><Link href="/giangvien/hotro"><span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-patch-question" viewBox="0 0 16 16" aria-hidden="true"><path d="M8.05 9.6 c.336 0 .504-.24.554-.627 .04-.534.198-.815.847-1.26 .673-.475 1.049-1.09 1.049-1.986 0-1.325-.92-2.227-2.262-2.227 -1.02 0-1.792.492-2.1 1.29 A1.71 1.71 0 0 0 6 5.48 c0 .393.203.64.545.64 .272 0 .455-.147.564-.51 .158-.592.525-.915 1.074-.915 .61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325 -.619.433-.926.914-.926 1.64v.111 c0 .428.208.745.585.745z"/><path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011 a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622 a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89 a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636 a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011 a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622 a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89 a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636 a2.89 2.89 0 0 1 4.134 0l-.715.698 a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016 a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921 a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32 a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944 a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016 a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921 a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32 a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z"/><path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/></svg></span> Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>

        {/* Khu vực nội dung chỉnh sửa theo ảnh mẫu */}
        <main className="gv-main gv-courses-main">
          <div className="gvc-editor">
            {/* Header */}
            <div className="gvc-editor-header">
              <Link href="/giangvien/khoahoc" className="gvc-back">Quay lại</Link>
              <div className="gvc-editor-title">
                <h2>Quản lý nội dung khóa học</h2>
                <span className="gvc-course-id">ID: 1</span>
              </div>

            </div>

            {/* Summary cards */}
            <div className="gvc-summary">
              {/* Tổng bài học */}
              <div className="gvc-summary-card blue">
                <div className="icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">

  <path
    d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z"
    fill="none"
    stroke="#000"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="24"
  />
  <polyline
    points="184 112 240 80 240 176 184 144"
    fill="none"
    stroke="#000"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke-width="24"
  />
</svg>

                  
                </div>
                <div>
                  <div className="value">4</div>
                  <div className="label">Tổng bài học</div>
                </div>
              </div>
              {/* Đã xuất bản */}
              <div className="gvc-summary-card green">
                <div className="icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="value">3</div>
                  <div className="label">Đã xuất bản</div>
                </div>
              </div>
              {/* Tổng thời lượng */}
              <div className="gvc-summary-card purple">
                <div className="icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l4 2" />
                  </svg>
                </div>
                <div>
                  <div className="value">69 phút</div>
                  <div className="label">Tổng thời lượng</div>
                </div>
              </div>
              {/* Tỷ lệ hoàn thành TB */}
              <div className="gvc-summary-card orange">
                <div className="icon" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
 
  <g>

   
    
    
    <path
      d="
        M2 22
        a8 8 0 1 1 16 0
        h-2
        a6 6 0 1 0-12 0
        H2
        z

        m8-9
        c-3.315 0-6-2.685-6-6
        s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6
        z

        m0-2
        c2.21 0 4-1.79 4-4
        s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4
        z

        m8.284 3.703
        A8.002 8.002 0 0 1 23 22
        h-2
        a6.001 6.001 0 0 0-3.537-5.473
        l.82-1.824
        z

        m-.688-11.29
        A5.5 5.5 0 0 1 21 8.5
        a5.499 5.499 0 0 1-5 5.478
        v-2.013
        a3.5 3.5 0 0 0 1.041-6.609
        l.555-1.943
        z
      "
    />
  </g>
</svg>

                </div>
                <div>
                  <div className="value">59%</div>
                  <div className="label">Tỷ lệ hoàn thành TB</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="gvc-tabbar">
              <button className="gvc-tab active">Nội dung</button>
              <Link href="/giangvien/khoahoc/caidat" className="gvc-tab">Cài đặt</Link>
            </div>

            {/* Chapters header */}
           

            {/* Chapter 1 */}
            <div className="gvc-chapter">
              <div className="gvc-chapter-head">
                <button className="gvc-expand" onClick={toggleChapter1}>{chapter1Expanded ? '▾' : '▸'}</button>
                <div className="gvc-chapter-name" onClick={toggleChapter1}>Giới thiệu về React ({chapter1Count} bài)</div>
                <button className="gvc-add-lesson" onClick={() => addLessonToStatic('chapter1')}>+ Thêm bài</button>
              </div>

              <div className="gvc-lessons" style={{ display: chapter1Expanded ? undefined : 'none' }}>
                {/* Lesson 1 */}
                <div className="gvc-lesson" style={{ display: staticState?.l1?.deleted ? 'none' : undefined }}>
                  <div className="gvc-lesson-row">
                    <div className="gvc-drag">⋮⋮</div>
                    <div className="gvc-lesson-desc"><textarea className="gvc-settings-textarea" rows={1} defaultValue="React là gì?" /></div>
                    <div className="gvc-lesson-actions">
                      <span className="gvc-pill published">Đã xuất bản</span>
                      {staticState?.l1?.fileName && (
                        <span className="gvc-pill">{staticState.l1.fileName}</span>
                      )}
                      <button className="gvc-icon-btn" title="Sửa" onClick={() => focusStaticTitle('l1')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1025 1023">
                          <path
                            fill="#000000"
                            d="
                              M896.428 1023h-768
                              q-53 0-90.5-37.5T.428 895V127
                              q0-53 37.5-90t90.5-37h576l-128 127h-384
                              q-27 0-45.5 19t-18.5 45v640
                              q0 27 19 45.5t45 18.5h640
                              q27 0 45.5-18.5t18.5-45.5V447l128-128v576
                              q0 53-37.5 90.5t-90.5 37.5zm-576-464l144 144l-208 64zm208 96
                              l-160-159l479-480
                              q17-16 40.5-16t40.5 16l79 80
                              q16 16 16.5 39.5t-16.5 40.5z
                            "
                          />
                        </svg>
                      </button>

                      <button className="gvc-icon-btn" title="Upload tệp" onClick={() => uploadStaticAsset('l1')}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M18.22 20.75H5.78
        A2.64 2.64 0 0 1 3.25 18v-3
        a.75.75 0 0 1 1.5 0v3
        a1.16 1.16 0 0 0 1 1.25h12.47
        a1.16 1.16 0 0 0 1-1.25v-3
        a.75.75 0 0 1 1.5 0v3
        a2.64 2.64 0 0 1-2.5 2.75Z
        M16 8.75
        a.74.74 0 0 1-.53-.22L12 5.06L8.53 8.53
        a.75.75 0 0 1-1.06-1.06l4-4
        a.75.75 0 0 1 1.06 0l4 4
        a.75.75 0 0 1 0 1.06
        a.74.74 0 0 1-.53.22Z
      "
    />
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M12 15.75
        a.76.76 0 0 1-.75-.75V4
        a.75.75 0 0 1 1.5 0v11
        a.76.76 0 0 1-.75.75Z
      "
    />
  </svg>
</button>
                      <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteStaticLesson('l1')}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 26 26"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="
        M11.5-.031
        c-1.958 0-3.531 1.627-3.531 3.594V4H4
        c-.551 0-1 .449-1 1v1H2v2h2v15
        c0 1.645 1.355 3 3 3h12
        c1.645 0 3-1.355 3-3V8h2V6h-1V5
        c0-.551-.449-1-1-1h-3.969v-.438
        c0-1.966-1.573-3.593-3.531-3.593h-3z

        m0 2.062h3
        c.804 0 1.469.656 1.469 1.531V4H10.03v-.438
        c0-.875.665-1.53 1.469-1.53z

        M6 8h5.125
        c.124.013.247.031.375.031h3
        c.128 0 .25-.018.375-.031H20v15
        c0 .563-.437 1-1 1H7
        c-.563 0-1-.437-1-1V8z

        m2 2v12h2V10H8z
        m4 0v12h2V10h-2z
        m4 0v12h2V10h-2z
      "
    />
  </svg>
</button>
                      <input id="static-l1-asset" type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={(e) => onStaticAssetChange('l1', e)} />
                    </div>
                  </div>
                  <div className="gvc-lesson-row">
                    <div className="gvc-drag"></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <div className="gvc-lesson-fields">
                        <div className="gvc-lesson-desc">
                          <textarea className="gvc-settings-textarea" rows={1} defaultValue="Giới thiệu tổng quan về React" />
                        </div>
                        <div className="gvc-lesson-meta">
                          <select defaultValue="Video" className="gvc-lesson-type" onChange={(e) => updateFileInputAccept('static-l1-asset', e.target.value)}>
                            <option>Video</option>
                            <option>Tài liệu</option>
                            <option>Bài kiểm tra</option>
                            <option>Bài tập</option>
                          </select>
                          <input defaultValue="15:30" className="gvc-lesson-time" />
                          <select defaultValue="Tài liệu hỗ trợ" className="gvc-lesson-select-support">
                            <option>Tài liệu hỗ trợ</option>
                            <option>Không</option>
                          </select>
                        </div>
                        
                      </div>
                      <div className="gvc-lesson-actions"></div>
                    </div>
                  </div>
                {staticState?.l1?.docs?.length > 0 && (
                  <div className="gvc-doc-list" style={{ marginTop: '8px' }}>
                    <div style={{ color: '#15803d', fontWeight: 600 }}>Danh sách tệp đã tải</div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {staticState.l1.docs.map((d, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                          <a href={d.url} target="_blank" rel="noreferrer" className="gvc-link">{d.name}</a>
                          <span style={{ color: '#6b7280' }}>({(d.size/1024).toFixed(1)} KB)</span>
                          <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteStaticDoc('l1', idx)}>✖</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {staticState?.l1?.fileUrl && (
                  <div className="gvc-lesson-preview">
                    <video src={staticState.l1.fileUrl} controls style={{ width: '100%', borderRadius: '10px' }} />
                  </div>
                )}
                </div>

                {/* Lesson 2 */}
                <div className="gvc-lesson" style={{ display: staticState?.l2?.deleted ? 'none' : undefined }}>
                  <div className="gvc-lesson-row">
                    <div className="gvc-drag">⋮⋮</div>
                    <div className="gvc-lesson-desc">
                      <textarea className="gvc-settings-textarea" rows={1} defaultValue="Môi trường phát triển" />
                    </div>
                    <div className="gvc-lesson-actions">
                      <span className="gvc-pill review">Chờ duyệt</span>
                      {staticState?.l2?.fileName && (
                        <span className="gvc-pill">{staticState.l2.fileName}</span>
                      )}
                      <button className="gvc-icon-btn" title="Sửa" onClick={() => focusStaticTitle('l2')}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1025 1023">
                          <path
                            fill="#000000"
                            d="
                              M896.428 1023h-768
                              q-53 0-90.5-37.5T.428 895V127
                              q0-53 37.5-90t90.5-37h576l-128 127h-384
                              q-27 0-45.5 19t-18.5 45v640
                              q0 27 19 45.5t45 18.5h640
                              q27 0 45.5-18.5t18.5-45.5V447l128-128v576
                              q0 53-37.5 90.5t-90.5 37.5zm-576-464l144 144l-208 64zm208 96
                              l-160-159l479-480
                              q17-16 40.5-16t40.5 16l79 80
                              q16 16 16.5 39.5t-16.5 40.5z
                            "
                          />
                        </svg>
                      </button>

                      <button className="gvc-icon-btn" title="Upload tệp" onClick={() => uploadStaticAsset('l2')}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M18.22 20.75H5.78
        A2.64 2.64 0 0 1 3.25 18v-3
        a.75.75 0 0 1 1.5 0v3
        a1.16 1.16 0 0 0 1 1.25h12.47
        a1.16 1.16 0 0 0 1-1.25v-3
        a.75.75 0 0 1 1.5 0v3
        a2.64 2.64 0 0 1-2.5 2.75Z
        M16 8.75
        a.74.74 0 0 1-.53-.22L12 5.06L8.53 8.53
        a.75.75 0 0 1-1.06-1.06l4-4
        a.75.75 0 0 1 1.06 0l4 4
        a.75.75 0 0 1 0 1.06
        a.74.74 0 0 1-.53.22Z
      "
    />
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M12 15.75
        a.76.76 0 0 1-.75-.75V4
        a.75.75 0 0 1 1.5 0v11
        a.76.76 0 0 1-.75.75Z
      "
    />
  </svg>
</button>
                      <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteStaticLesson('l2')}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 26 26"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="
        M11.5-.031
        c-1.958 0-3.531 1.627-3.531 3.594V4H4
        c-.551 0-1 .449-1 1v1H2v2h2v15
        c0 1.645 1.355 3 3 3h12
        c1.645 0 3-1.355 3-3V8h2V6h-1V5
        c0-.551-.449-1-1-1h-3.969v-.438
        c0-1.966-1.573-3.593-3.531-3.593h-3z

        m0 2.062h3
        c.804 0 1.469.656 1.469 1.531V4H10.03v-.438
        c0-.875.665-1.53 1.469-1.53z

        M6 8h5.125
        c.124.013.247.031.375.031h3
        c.128 0 .25-.018.375-.031H20v15
        c0 .563-.437 1-1 1H7
        c-.563 0-1-.437-1-1V8z

        m2 2v12h2V10H8z
        m4 0v12h2V10h-2z
        m4 0v12h2V10h-2z
      "
    />
  </svg>
</button>
                      <input id="static-l2-asset" type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={(e) => onStaticAssetChange('l2', e)} />
                    </div>
                  </div>
                  <div className="gvc-lesson-row">
                    <div className="gvc-drag"></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <div className="gvc-lesson-fields">
                        <div className="gvc-lesson-desc">
                          <textarea className="gvc-settings-textarea" defaultValue="Cài đặt và cấu hình" rows={1} />
                        </div>
                        <div className="gvc-lesson-meta">
                          <select defaultValue="Video" className="gvc-lesson-type" onChange={(e) => updateFileInputAccept('static-l2-asset', e.target.value)}>
                            <option>Video</option>
                            <option>Tài liệu</option>
                            <option>Bài kiểm tra</option>
                            <option>Bài tập</option>
                          </select>
                          <input defaultValue="10:00" className="gvc-lesson-time" />
                          <select defaultValue="Tài liệu hỗ trợ" className="gvc-lesson-select-support">
                            <option>Tài liệu hỗ trợ</option>
                            <option>Không</option>
                          </select>
                        </div>
                      </div>
                      <div className="gvc-lesson-actions"></div>
                    </div>
                  </div>
                {staticState?.l2?.docs?.length > 0 && (
                  <div className="gvc-doc-list" style={{ marginTop: '8px' }}>
                    <div style={{ color: '#15803d', fontWeight: 600 }}>Danh sách tệp đã tải</div>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {staticState.l2.docs.map((d, idx) => (
                        <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                          <a href={d.url} target="_blank" rel="noreferrer" className="gvc-link">{d.name}</a>
                          <span style={{ color: '#6b7280' }}>({(d.size/1024).toFixed(1)} KB)</span>
                          <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteStaticDoc('l2', idx)}>✖</button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {staticState?.l2?.fileUrl && (
                  <div className="gvc-lesson-preview">
                    <video src={staticState.l2.fileUrl} controls style={{ width: '100%', borderRadius: '10px' }} />
                  </div>
                )}
                </div>
                {/* Bài học thêm mới cho Chapter 1 */}
                {chapter1Expanded && extraLessons.chapter1.length > 0 && (
                  <div className="gvc-lessons">
                    {extraLessons.chapter1.map((lesson) => (
                      <div className="gvc-lesson" key={lesson.id}>
                        <div className="gvc-lesson-row">
                          <div className="gvc-drag">⋮⋮</div>
                          <div className="gvc-lesson-fields">
                            <input id={`extra-chapter1-${lesson.id}-title`} defaultValue={lesson.title} className="gvc-lesson-title-input" />
                            <div className="gvc-lesson-meta">
                              <select defaultValue={lesson.type} className="gvc-lesson-type" onChange={(e) => updateFileInputAccept(`extra-chapter1-${lesson.id}-asset`, e.target.value)}>
                                <option>Video</option>
                                <option>Tài liệu</option>
                                <option>Bài kiểm tra</option>
                                <option>Bài tập</option>
                              </select>
                              <input defaultValue={lesson.duration} className="gvc-lesson-time" />
                              <select defaultValue={lesson.support} className="gvc-lesson-select-support">
                                <option>Tài liệu hỗ trợ</option>
                                <option>Không</option>
                              </select>
                            </div>
                            <div className="gvc-lesson-desc">
                              <textarea className="gvc-settings-textarea" placeholder="Mô tả bài học" rows={3} defaultValue={lesson.description || ""} />
                            </div>
                          </div>
                          <div className="gvc-lesson-actions">
                            <span className={`gvc-pill ${lesson.status === 'draft' ? 'draft' : 'published'}`}>
                              {lesson.status === 'draft' ? 'Nháp' : 'Đã xuất bản'}
                            </span>
                            {lesson.fileName && <span className="gvc-pill">{lesson.fileName}</span>}
                            {lesson.docs?.length > 0 && (
                              <div className="gvc-doc-list" style={{ gridColumn: '1 / -1', width: '100%' }}>
                                <div style={{ color: '#15803d', fontWeight: 600 }}>Danh sách tệp đã tải</div>
                                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                  {lesson.docs.map((d, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                      <a href={d.url} target="_blank" rel="noreferrer" className="gvc-link">{d.name}</a>
                                      <span style={{ color: '#6b7280' }}>({(d.size/1024).toFixed(1)} KB)</span>
                                      <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteExtraDoc('chapter1', lesson.id, idx)}>✖</button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {lesson.docs?.length > 0 && (
                              <div className="gvc-doc-list" style={{ gridColumn: '1 / -1', width: '100%' }}>
                                <div style={{ color: '#15803d', fontWeight: 600 }}>Danh sách tệp đã tải</div>
                                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                  {lesson.docs.map((d, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                      <a href={d.url} target="_blank" rel="noreferrer" className="gvc-link">{d.name}</a>
                                      <span style={{ color: '#6b7280' }}>({(d.size/1024).toFixed(1)} KB)</span>
                                      <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteDynamicDoc(ch.id, lesson.id, idx)}>✖</button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {lesson.fileUrl && (
                              <div className="gvc-lesson-preview" style={{ gridColumn: '1 / -1', width: '100%' }}>
                                <video src={lesson.fileUrl} controls style={{ width: '100%', borderRadius: '10px' }} />
                              </div>
                            )}
                            <button className="gvc-icon-btn" title="Sửa" onClick={() => focusExtraTitle('chapter1', lesson.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1025 1023">
                                <path
                                  fill="#000000"
                                  d="
                                    M896.428 1023h-768
                                    q-53 0-90.5-37.5T.428 895V127
                                    q0-53 37.5-90t90.5-37h576l-128 127h-384
                                    q-27 0-45.5 19t-18.5 45v640
                                    q0 27 19 45.5t45 18.5h640
                                    q27 0 45.5-18.5t18.5-45.5V447l128-128v576
                                    q0 53-37.5 90.5t-90.5 37.5zm-576-464l144 144l-208 64zm208 96
                                    l-160-159l479-480
                                    q17-16 40.5-16t40.5 16l79 80
                                    q16 16 16.5 39.5t-16.5 40.5z
                                  "
                                />
                              </svg>
                            </button>
                            <button className="gvc-icon-btn" title="Upload tệp" onClick={() => uploadExtraAsset('chapter1', lesson.id)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M18.22 20.75H5.78
        A2.64 2.64 0 0 1 3.25 18v-3
        a.75.75 0 0 1 1.5 0v3
        a1.16 1.16 0 0 0 1 1.25h12.47
        a1.16 1.16 0 0 0 1-1.25v-3
        a.75.75 0 0 1 1.5 0v3
        a2.64 2.64 0 0 1-2.5 2.75Z
        M16 8.75
        a.74.74 0 0 1-.53-.22L12 5.06L8.53 8.53
        a.75.75 0 0 1-1.06-1.06l4-4
        a.75.75 0 0 1 1.06 0l4 4
        a.75.75 0 0 1 0 1.06
        a.74.74 0 0 1-.53.22Z
      "
    />
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M12 15.75
        a.76.76 0 0 1-.75-.75V4
        a.75.75 0 0 1 1.5 0v11
        a.76.76 0 0 1-.75.75Z
      "
    />
  </svg>
</button>
                            <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteExtraLesson('chapter1', lesson.id)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 26 26"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="
        M11.5-.031
        c-1.958 0-3.531 1.627-3.531 3.594V4H4
        c-.551 0-1 .449-1 1v1H2v2h2v15
        c0 1.645 1.355 3 3 3h12
        c1.645 0 3-1.355 3-3V8h2V6h-1V5
        c0-.551-.449-1-1-1h-3.969v-.438
        c0-1.966-1.573-3.593-3.531-3.593h-3z

        m0 2.062h3
        c.804 0 1.469.656 1.469 1.531V4H10.03v-.438
        c0-.875.665-1.53 1.469-1.53z

        M6 8h5.125
        c.124.013.247.031.375.031h3
        c.128 0 .25-.018.375-.031H20v15
        c0 .563-.437 1-1 1H7
        c-.563 0-1-.437-1-1V8z

        m2 2v12h2V10H8z
        m4 0v12h2V10h-2z
        m4 0v12h2V10h-2z
      "
    />
  </svg>
</button>
                            <input id={`extra-chapter1-${lesson.id}-asset`} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={(e) => onExtraAssetChange('chapter1', lesson.id, e)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chapter 2 (removed) */}
            <div className="gvc-chapter" style={{ display: 'none' }}>
              <div className="gvc-chapter-head">
                <button className="gvc-expand">▸</button>
                <div className="gvc-chapter-name">Components và Props (2 bài)</div>
                <button className="gvc-add-lesson" onClick={() => addLessonToStatic('chapter2')}>+ Thêm bài</button>
              </div>
              {/* Bài học thêm mới cho Chapter 2 */}
              {extraLessons.chapter2.length > 0 && (
                <div className="gvc-lessons">
                  {extraLessons.chapter2.map((lesson) => (
                    <div className="gvc-lesson" key={lesson.id}>
                      <div className="gvc-lesson-row">
                        <div className="gvc-drag">⋮⋮</div>
                        <div className="gvc-lesson-fields">
                          <input id={`extra-chapter2-${lesson.id}-title`} defaultValue={lesson.title} className="gvc-lesson-title-input" />
                          <div className="gvc-lesson-meta">
                            <select defaultValue={lesson.type} className="gvc-lesson-type" onChange={(e) => updateFileInputAccept(`extra-chapter2-${lesson.id}-asset`, e.target.value)}>
                              <option>Video</option>
                              <option>Tài liệu</option>
                              <option>Bài kiểm tra</option>
                              <option>Bài tập</option>
                            </select>
                            <input defaultValue={lesson.duration} className="gvc-lesson-time" />
                            <select defaultValue={lesson.support} className="gvc-lesson-select-support">
                              <option>Tài liệu hỗ trợ</option>
                              <option>Không</option>
                            </select>
                          </div>
                          <div className="gvc-lesson-desc">
                            <textarea className="gvc-settings-textarea" placeholder="Mô tả bài học" rows={3} defaultValue={lesson.description || ""} />
                          </div>
                        </div>
                        <div className="gvc-lesson-actions">
                            <span className={`gvc-pill ${lesson.status === 'draft' ? 'draft' : 'published'}`}>
                              {lesson.status === 'draft' ? 'Nháp' : 'Đã xuất bản'}
                            </span>
                            {lesson.fileName && <span className="gvc-pill">{lesson.fileName}</span>}
                            {lesson.docs?.length > 0 && (
                              <div className="gvc-doc-list" style={{ gridColumn: '1 / -1', width: '100%' }}>
                                <div style={{ color: '#15803d', fontWeight: 600 }}>Danh sách tệp đã tải</div>
                                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                                  {lesson.docs.map((d, idx) => (
                                    <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                                      <a href={d.url} target="_blank" rel="noreferrer" className="gvc-link">{d.name}</a>
                                      <span style={{ color: '#6b7280' }}>({(d.size/1024).toFixed(1)} KB)</span>
                                      <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteExtraDoc('chapter2', lesson.id, idx)}>✖</button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {lesson.fileUrl && (
                              <div className="gvc-lesson-preview" style={{ gridColumn: '1 / -1', width: '100%' }}>
                                <video src={lesson.fileUrl} controls style={{ width: '100%', borderRadius: '10px' }} />
                              </div>
                            )}
                            <button className="gvc-icon-btn" title="Sửa" onClick={() => focusExtraTitle('chapter2', lesson.id)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 1025 1023"
                              >
                                <path
                                  fill="#000000"
                                  d="
                                    M896.428 1023h-768
                                    q-53 0-90.5-37.5T.428 895V127
                                    q0-53 37.5-90t90.5-37h576l-128 127h-384
                                    q-27 0-45.5 19t-18.5 45v640
                                    q0 27 19 45.5t45 18.5h640
                                    q27 0 45.5-18.5t18.5-45.5V447l128-128v576
                                    q0 53-37.5 90.5t-90.5 37.5zm-576-464l144 144l-208 64zm208 96
                                    l-160-159l479-480
                                    q17-16 40.5-16t40.5 16l79 80
                                    q16 16 16.5 39.5t-16.5 40.5z
                                  "
                                />
                              </svg>
                            </button>
                            <button className="gvc-icon-btn" title="Upload tệp" onClick={() => uploadExtraAsset('chapter2', lesson.id)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M18.22 20.75H5.78
        A2.64 2.64 0 0 1 3.25 18v-3
        a.75.75 0 0 1 1.5 0v3
        a1.16 1.16 0 0 0 1 1.25h12.47
        a1.16 1.16 0 0 0 1-1.25v-3
        a.75.75 0 0 1 1.5 0v3
        a2.64 2.64 0 0 1-2.5 2.75Z
        M16 8.75
        a.74.74 0 0 1-.53-.22L12 5.06L8.53 8.53
        a.75.75 0 0 1-1.06-1.06l4-4
        a.75.75 0 0 1 1.06 0l4 4
        a.75.75 0 0 1 0 1.06
        a.74.74 0 0 1-.53.22Z
      "
    />
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M12 15.75
        a.76.76 0 0 1-.75-.75V4
        a.75.75 0 0 1 1.5 0v11
        a.76.76 0 0 1-.75.75Z
      "
    />
  </svg>
</button>
                            <button className="gvc-icon-btn danger" title="Xóa" onClick={() => deleteExtraLesson('chapter2', lesson.id)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 26 26"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="
        M11.5-.031
        c-1.958 0-3.531 1.627-3.531 3.594V4H4
        c-.551 0-1 .449-1 1v1H2v2h2v15
        c0 1.645 1.355 3 3 3h12
        c1.645 0 3-1.355 3-3V8h2V6h-1V5
        c0-.551-.449-1-1-1h-3.969v-.438
        c0-1.966-1.573-3.593-3.531-3.593h-3z

        m0 2.062h3
        c.804 0 1.469.656 1.469 1.531V4H10.03v-.438
        c0-.875.665-1.53 1.469-1.53z

        M6 8h5.125
        c.124.013.247.031.375.031h3
        c.128 0 .25-.018.375-.031H20v15
        c0 .563-.437 1-1 1H7
        c-.563 0-1-.437-1-1V8z

        m2 2v12h2V10H8z
        m4 0v12h2V10h-2z
        m4 0v12h2V10h-2z
      "
    />
  </svg>
</button>
                            <input id={`extra-chapter2-${lesson.id}-asset`} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={(e) => onExtraAssetChange('chapter2', lesson.id, e)} />
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Các chương được thêm mới */}
            {chapters.map((ch) => (
              <div className="gvc-chapter" key={ch.id}>
                <div className="gvc-chapter-head">
                  <button className="gvc-expand" onClick={() => toggleChapter(ch.id)}>
                    {ch.expanded ? "▾" : "▸"}
                  </button>
                  {ch.isEditing ? (
                    <input 
                      className="gvc-chapter-name-input"
                      defaultValue={ch.title}
                      onBlur={(e) => updateChapterTitle(ch.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateChapterTitle(ch.id, e.target.value)
                        }
                      }}
                      autoFocus
                    />
                  ) : (
                    <div 
                      className="gvc-chapter-name" 
                      onClick={() => startEditingChapter(ch.id)}
                    >
                      {ch.title} ({ch.lessons.length} bài)
                    </div>
                  )}
                  <div className="gvc-chapter-actions">
                    <button className="gvc-add-lesson" onClick={() => addLesson(ch.id)}>
                      + Thêm bài
                    </button>
                    <button className="gvc-icon-btn danger" onClick={() => deleteChapter(ch.id)} title="Xóa chương">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 26 26"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="
        M11.5-.031
        c-1.958 0-3.531 1.627-3.531 3.594V4H4
        c-.551 0-1 .449-1 1v1H2v2h2v15
        c0 1.645 1.355 3 3 3h12
        c1.645 0 3-1.355 3-3V8h2V6h-1V5
        c0-.551-.449-1-1-1h-3.969v-.438
        c0-1.966-1.573-3.593-3.531-3.593h-3z

        m0 2.062h3
        c.804 0 1.469.656 1.469 1.531V4H10.03v-.438
        c0-.875.665-1.53 1.469-1.53z

        M6 8h5.125
        c.124.013.247.031.375.031h3
        c.128 0 .25-.018.375-.031H20v15
        c0 .563-.437 1-1 1H7
        c-.563 0-1-.437-1-1V8z

        m2 2v12h2V10H8z
        m4 0v12h2V10h-2z
        m4 0v12h2V10h-2z
      "
    />
  </svg>
</button>
                  </div>
                </div>
                
                {ch.expanded && (
                  <div className="gvc-lessons">
                    {ch.lessons.map((lesson) => (
                      <div className="gvc-lesson" key={lesson.id}>
                        <div className="gvc-lesson-row">
                          <div className="gvc-drag">⋮⋮</div>
                          <div className="gvc-lesson-fields">
                            <input 
                              id={`dyn-${ch.id}-${lesson.id}-title`}
                              defaultValue={lesson.title} 
                              className="gvc-lesson-title-input"
                              onBlur={(e) => updateLessonTitle(ch.id, lesson.id, e.target.value)}
                            />
                            <div className="gvc-lesson-meta">
                              <select defaultValue={lesson.type} className="gvc-lesson-type" onChange={(e) => updateFileInputAccept(`dyn-${ch.id}-${lesson.id}-asset`, e.target.value)}>
                                <option>Video</option>
                                <option>Tài liệu</option>
                                <option>Bài kiểm tra</option>
                                <option>Bài tập</option>
                              </select>
                              <input defaultValue={lesson.duration} className="gvc-lesson-time" />
                              <select defaultValue={lesson.support} className="gvc-lesson-select-support">
                                <option>Tài liệu hỗ trợ</option>
                                <option>Không</option>
                              </select>
                            </div>
                            <div className="gvc-lesson-desc">
                              <textarea className="gvc-settings-textarea" placeholder="Mô tả bài học" rows={3} defaultValue={lesson.description || ""} />
                            </div>
                          </div>
                          <div className="gvc-lesson-actions">
                            <span className={`gvc-pill ${lesson.status === 'draft' ? 'draft' : 'published'}`}>
                              {lesson.status === 'draft' ? 'Nháp' : 'Đã xuất bản'}
                            </span>
                            {lesson.fileName && <span className="gvc-pill">{lesson.fileName}</span>}
                            {lesson.fileUrl && (
                              <div className="gvc-lesson-preview" style={{ gridColumn: '1 / -1', width: '100%' }}>
                                <video src={lesson.fileUrl} controls style={{ width: '100%', borderRadius: '10px' }} />
                              </div>
                            )}
                            <button className="gvc-icon-btn" title="Sửa" onClick={() => focusDynamicTitle(ch.id, lesson.id)}>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 1025 1023"
                              >
                                <path
                                  fill="#000000"
                                  d="
                                    M896.428 1023h-768
                                    q-53 0-90.5-37.5T.428 895V127
                                    q0-53 37.5-90t90.5-37h576l-128 127h-384
                                    q-27 0-45.5 19t-18.5 45v640
                                    q0 27 19 45.5t45 18.5h640
                                    q27 0 45.5-18.5t18.5-45.5V447l128-128v576
                                    q0 53-37.5 90.5t-90.5 37.5zm-576-464l144 144l-208 64zm208 96
                                    l-160-159l479-480
                                    q17-16 40.5-16t40.5 16l79 80
                                    q16 16 16.5 39.5t-16.5 40.5z
                                  "
                                />
                              </svg>
                            </button>
                            <button className="gvc-icon-btn" title="Upload file" onClick={() => uploadLessonFile(ch.id, lesson.id)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M18.22 20.75H5.78
        A2.64 2.64 0 0 1 3.25 18v-3
        a.75.75 0 0 1 1.5 0v3
        a1.16 1.16 0 0 0 1 1.25h12.47
        a1.16 1.16 0 0 0 1-1.25v-3
        a.75.75 0 0 1 1.5 0v3
        a2.64 2.64 0 0 1-2.5 2.75Z
        M16 8.75
        a.74.74 0 0 1-.53-.22L12 5.06L8.53 8.53
        a.75.75 0 0 1-1.06-1.06l4-4
        a.75.75 0 0 1 1.06 0l4 4
        a.75.75 0 0 1 0 1.06
        a.74.74 0 0 1-.53.22Z
      "
    />
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M12 15.75
        a.76.76 0 0 1-.75-.75V4
        a.75.75 0 0 1 1.5 0v11
        a.76.76 0 0 1-.75.75Z
      "
    />
  </svg>
</button>
                            <button className="gvc-icon-btn" title="Upload tệp" onClick={() => uploadDynamicAsset(ch.id, lesson.id)}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M18.22 20.75H5.78
        A2.64 2.64 0 0 1 3.25 18v-3
        a.75.75 0 0 1 1.5 0v3
        a1.16 1.16 0 0 0 1 1.25h12.47
        a1.16 1.16 0 0 0 1-1.25v-3
        a.75.75 0 0 1 1.5 0v3
        a2.64 2.64 0 0 1-2.5 2.75Z
        M16 8.75
        a.74.74 0 0 1-.53-.22L12 5.06L8.53 8.53
        a.75.75 0 0 1-1.06-1.06l4-4
        a.75.75 0 0 1 1.06 0l4 4
        a.75.75 0 0 1 0 1.06
        a.74.74 0 0 1-.53.22Z
      "
    />
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      d="
        M12 15.75
        a.76.76 0 0 1-.75-.75V4
        a.75.75 0 0 1 1.5 0v11
        a.76.76 0 0 1-.75.75Z
      "
    />
  </svg>
</button>
                            <button 
                              className="gvc-icon-btn danger" 
                              title="Xóa"
                              onClick={() => deleteLesson(ch.id, lesson.id)}
                            >
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 26 26"
  >
    <path
      fill="none"
      stroke="#111827"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="
        M11.5-.031
        c-1.958 0-3.531 1.627-3.531 3.594V4H4
        c-.551 0-1 .449-1 1v1H2v2h2v15
        c0 1.645 1.355 3 3 3h12
        c1.645 0 3-1.355 3-3V8h2V6h-1V5
        c0-.551-.449-1-1-1h-3.969v-.438
        c0-1.966-1.573-3.593-3.531-3.593h-3z

        m0 2.062h3
        c.804 0 1.469.656 1.469 1.531V4H10.03v-.438
        c0-.875.665-1.53 1.469-1.53z

        M6 8h5.125
        c.124.013.247.031.375.031h3
        c.128 0 .25-.018.375-.031H20v15
        c0 .563-.437 1-1 1H7
        c-.563 0-1-.437-1-1V8z

        m2 2v12h2V10H8z
        m4 0v12h2V10h-2z
        m4 0v12h2V10h-2z
      "
    />
  </svg>
                            </button>
                            <input id={`dyn-${ch.id}-${lesson.id}-asset`} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={(e) => onDynamicAssetChange(ch.id, lesson.id, e)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="gvc-settings-actions">
              <button className="gvc-save-btn" onClick={saveSettings}>Lưu cài đặt</button>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
