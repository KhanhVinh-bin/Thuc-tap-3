'use client'

import Footer from "@/components/footer"
import Link from "next/link"
import "../../tongquan/page.css"
import "../page.css"
import "./page.css"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/lib/auth-context"
import { getLessonsByCourse, updateLesson, patchLesson, deleteLesson, uploadLessonFile, createLesson, getLessonProgressSummary } from "../../lib/instructorApi"

export default function GiangVienKhoaHocChinhSuaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token } = useAuth()
  const { toast } = useToast()
  
  // Lấy courseId từ URL params hoặc từ localStorage như fallback
  const courseIdFromUrl = searchParams?.get('courseId') || searchParams?.get('id')
  const courseIdFromStorage = typeof window !== 'undefined' ? localStorage.getItem('currentCourseId') : null
  const courseId = courseIdFromUrl || courseIdFromStorage || null
  
  // Lưu courseId vào localStorage nếu có
  useEffect(() => {
    if (courseId && typeof window !== 'undefined') {
      localStorage.setItem('currentCourseId', courseId.toString())
    }
  }, [courseId])
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courseData, setCourseData] = useState(null)
  const [lessons, setLessons] = useState([]) // Lưu trực tiếp danh sách bài học, không cần chapters
  // State để theo dõi file đang upload và preview
  const [uploadingLessons, setUploadingLessons] = useState({}) // { lessonId: { uploading: boolean, file: File } }

  // Helper function để lấy accept attribute dựa trên loại bài học
  const getFileAcceptByType = (lessonType) => {
    switch (lessonType) {
      case 'Video':
        return 'video/*'
      case 'Tài liệu':
        return '.pdf,.txt' // ✅ Chỉ chấp nhận PDF và TXT
      case 'Bài kiểm tra':
        return '.pdf,.txt'
      case 'Bài tập':
        return '.pdf,.txt'
      default:
        return 'video/*,.pdf,.txt'
    }
  }

  // Function để cập nhật accept attribute của input file
  const updateFileInputAccept = (inputId, lessonType) => {
    const input = document.getElementById(inputId)
    if (input) {
      input.setAttribute('accept', getFileAcceptByType(lessonType))
    }
  }
  
  // Thêm bài học mới
  const addLesson = () => {
    setLessons(prev => [...prev, {
      id: Date.now(),
      title: "Bài học mới",
      type: "Video",
      duration: "10:00",
      durationSec: 600,
      support: "Tài liệu hỗ trợ",
      docs: []
    }])
  }

  const updateLessonTitle = async (lessonId, newTitle) => {
    // Update UI immediately
    setLessons(prev => prev.map(lesson =>
      lesson.id === lessonId ? { ...lesson, title: newTitle } : lesson
    ))

    // Update via API if lesson exists in DB
    const lesson = lessons.find(l => l.id === lessonId)
    
    if (lesson?.lessonId && courseId && token) {
      try {
        await patchLesson(courseId, lesson.lessonId, { title: newTitle }, token)
      } catch (err) {
        console.error("Error updating lesson title:", err)
      }
    }
  }

  const handleDeleteLesson = async (lessonId) => {
    const lesson = lessons.find(l => l.id === lessonId)
    
    if (!lesson || !lesson.lessonId || !courseId || !token) {
      // Nếu không có lessonId (chưa lưu vào DB), chỉ xóa khỏi UI
      setLessons(prev => prev.filter(l => l.id !== lessonId))
      return
    }

    // Confirm deletion
    if (!confirm(`Bạn có chắc muốn xóa bài học "${lesson.title}"?`)) {
      return
    }

    try {
      await deleteLesson(courseId, lesson.lessonId, token)
      setLessons(prev => prev.filter(l => l.id !== lessonId))
      toast({
        title: "Đã xóa",
        description: "Bài học đã được xóa thành công.",
      })
    } catch (err) {
      console.error("Error deleting lesson:", err)
      toast({
        title: "Lỗi",
        description: err.message || "Không thể xóa bài học",
        variant: "destructive",
      })
    }
  }

  // Load lessons từ API khi component mount
  useEffect(() => {
    const loadLessons = async () => {
      if (!courseId || !token) {
        setLoading(false)
        if (!courseId) {
          setError("Không có Course ID. Vui lòng quay lại trang khóa học.")
        }
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // ✅ Load lessons - getLessonsByCourse đã tự động xử lý fallback endpoints
        const lessonsData = await getLessonsByCourse(courseId, token)
        console.log("📦 Lessons data loaded:", lessonsData)

        // Set course data
        if (lessonsData) {
          setCourseData({
            courseId: lessonsData.CourseId || lessonsData.courseId,
            courseTitle: lessonsData.CourseTitle || lessonsData.courseTitle,
            courseDescription: lessonsData.CourseDescription || lessonsData.courseDescription,
            totalLessons: lessonsData.TotalLessons || lessonsData.totalLessons || 0,
            totalDurationSec: lessonsData.TotalDurationSec || lessonsData.totalDurationSec || 0
          })

          // Map lessons vào chapters
          const lessons = lessonsData.Lessons || lessonsData.lessons || []
          if (lessons.length > 0) {
            // Group lessons by chapter (giả sử tất cả lessons trong 1 chapter đầu tiên)
            const formattedLessons = lessons.map((lesson, index) => ({
              id: Date.now() + index,
              lessonId: lesson.LessonId || lesson.lessonId,
              title: lesson.Title || lesson.title || `Bài học ${index + 1}`,
              type: lesson.ContentType === "video" ? "Video" : lesson.ContentType === "file" ? "Tài liệu" : "Video",
              duration: lesson.DurationSec ? `${Math.floor(lesson.DurationSec / 60)}:${(lesson.DurationSec % 60).toString().padStart(2, '0')}` : "10:00",
              durationSec: lesson.DurationSec || 0,
              sortOrder: lesson.SortOrder || lesson.sortOrder || index + 1,
              videoUrl: lesson.VideoUrl || lesson.videoUrl || null,
              file: lesson.File || lesson.file || null,
              // Xử lý URL từ server - ưu tiên FilePath từ File object, nếu không có thì dùng VideoUrl
              fileUrl: (() => {
                const filePath = lesson.File?.FilePath || lesson.file?.filePath
                const vidUrl = lesson.VideoUrl || lesson.videoUrl
                if (filePath) {
                  return filePath.startsWith('http') 
                    ? filePath
                    : `https://localhost:3001${filePath.startsWith('/') ? '' : '/'}${filePath}`
                }
                if (vidUrl) {
                  return vidUrl.startsWith('http') 
                    ? vidUrl
                    : `https://localhost:3001${vidUrl.startsWith('/') ? '' : '/'}${vidUrl}`
                }
                return null
              })(),
              fileName: lesson.File?.Name || lesson.file?.name || null,
              // ✅ Thêm thông tin tài liệu từ File object
              docFile: null, // File object để upload
              docFileName: lesson.File?.Name || lesson.file?.name || null,
              docFilePath: lesson.File?.FilePath || lesson.file?.filePath || null,
              // ✅ Không set status vì backend không có field này, nhưng khóa học đã published nên hiển thị "Đã xuất bản"
              docs: []
            }))

            // Lưu trực tiếp danh sách bài học, không cần chapters
            setLessons(formattedLessons)
          } else {
            // Nếu không có bài học, danh sách rỗng
            setLessons([])
          }
        }
      } catch (err) {
        console.error("Error loading lessons:", err)
        // ✅ Xử lý lỗi một cách graceful - vẫn cho phép chỉnh sửa
        // Nếu có lỗi, để danh sách rỗng để vẫn có thể thêm bài học mới
        setLessons([])
        // Hiển thị cảnh báo nhẹ thay vì chặn hoàn toàn
        toast({
          title: "Cảnh báo",
          description: "Không thể tải dữ liệu bài học từ server. Bạn vẫn có thể thêm bài học mới.",
          variant: "default",
        })
      } finally {
        setLoading(false)
      }
    }

    loadLessons()
  }, [courseId, token])

  // Thêm handler lưu cài đặt
  const saveSettings = async () => {
    if (!courseId || !token) {
      toast({
        title: "Lỗi",
        description: "Không có Course ID hoặc token",
        variant: "destructive",
      })
      return
    }

    if (loading) {
      toast({
        title: "Đang tải",
        description: "Vui lòng đợi dữ liệu tải xong",
        variant: "destructive",
      })
      return
    }

    try {
      // Save all lessons
      const savePromises = []
      let savedCount = 0
      let errorCount = 0
      
      lessons.forEach((lesson) => {
        if (lesson.lessonId) {
          // Update existing lesson
          // ✅ Xác định contentType dựa trên type và file có sẵn
          let contentType = "video"
          if (lesson.type === "Tài liệu") {
            contentType = lesson.docFileName?.toLowerCase().endsWith('.pdf') ? "pdf" : "text"
          } else if (lesson.type !== "Video") {
            contentType = "text"
          }

          const lessonData = {
            title: lesson.title || "",
            contentType: contentType,
            videoUrl: lesson.videoUrl || null,
            filePath: lesson.type === "Tài liệu" && lesson.docFilePath && !lesson.docFilePath.startsWith('blob:') 
              ? lesson.docFilePath 
              : null,
            durationSec: lesson.durationSec || (lesson.duration ? 
              lesson.duration.split(':').reduce((acc, val) => acc * 60 + parseInt(val), 0) : 0),
            sortOrder: lesson.sortOrder || 0,
          }
          savePromises.push(
            patchLesson(courseId, lesson.lessonId, lessonData, token)
              .then(() => {
                savedCount++
              })
              .catch((err) => {
                console.error("Error saving lesson:", lesson.title, err)
                errorCount++
              })
          )
        } else {
          // Create new lesson if doesn't have lessonId
          // ✅ Nếu contentType là "video" nhưng chưa có videoUrl, không gửi videoUrl hoặc đổi contentType thành "text"
          const isVideoType = lesson.type === "Video"
          const hasVideoUrl = lesson.videoUrl && !lesson.videoUrl.startsWith('blob:')
          
          // ✅ Xác định contentType dựa trên type và file có sẵn
          let contentType = "video"
          if (lesson.type === "Tài liệu") {
            contentType = lesson.docFileName?.toLowerCase().endsWith('.pdf') ? "pdf" : "text"
          } else if (!isVideoType) {
            contentType = "text"
          } else if (isVideoType && !hasVideoUrl) {
            contentType = "text" // Tạm thời set text nếu chưa có videoUrl
          }

          const lessonData = {
            title: lesson.title || "Bài học mới",
            contentType: contentType,
            // ✅ Chỉ gửi videoUrl nếu có và không phải blob URL
            ...(hasVideoUrl ? { videoUrl: lesson.videoUrl } : {}),
            // ✅ Gửi filePath nếu là tài liệu và có filePath hợp lệ
            ...(lesson.type === "Tài liệu" && lesson.docFilePath && !lesson.docFilePath.startsWith('blob:') 
              ? { filePath: lesson.docFilePath } 
              : {}),
            durationSec: lesson.durationSec || (lesson.duration ? 
              lesson.duration.split(':').reduce((acc, val) => acc * 60 + parseInt(val), 0) : 600),
            sortOrder: lesson.sortOrder || 0,
          }
          savePromises.push(
            createLesson(courseId, lessonData, token)
              .then(async (createdLesson) => {
                // Update the lesson in state with the new lessonId
                const newLessonId = createdLesson.LessonId || createdLesson.lessonId
                if (newLessonId) {
                  setLessons(prev => prev.map(l => 
                    l.id === lesson.id ? { ...l, lessonId: newLessonId } : l
                  ))
                  
                  // ✅ Upload video nếu có videoFile
                  if (lesson.videoFile && lesson.videoFile instanceof File) {
                    try {
                      const uploadResult = await uploadLessonFile(courseId, newLessonId, lesson.videoFile, token)
                      const filePath = uploadResult.file?.FilePath || uploadResult.file?.filePath || uploadResult.filePath
                      if (filePath) {
                        const fullVideoUrl = filePath.startsWith('/') 
                          ? `https://localhost:3001${filePath}`
                          : `https://localhost:3001/${filePath}`
                        
                        // Update lesson với videoUrl từ server
                        setLessons(prev => prev.map(l => {
                          if (l.id === lesson.id) {
                            // Cleanup blob URL
                            if (l.fileUrl && l.fileUrl.startsWith('blob:')) {
                              URL.revokeObjectURL(l.fileUrl)
                            }
                            return { ...l, fileUrl: fullVideoUrl, videoUrl: filePath, videoFile: null }
                          }
                          return l
                        }))
                        
                        // Update lesson qua API với videoUrl
                        await patchLesson(courseId, newLessonId, { 
                          videoUrl: filePath,
                          contentType: "video"
                        }, token)
                      }
                    } catch (uploadErr) {
                      console.error("Error uploading video for new lesson:", uploadErr)
                      // Không throw để không làm fail việc tạo lesson
                    }
                  }

                  // ✅ Upload tài liệu nếu có docFile
                  if (lesson.docFile && lesson.docFile instanceof File && (lesson.type === "Tài liệu" || lesson.type === "Bài kiểm tra")) {
                    try {
                      const uploadResult = await uploadLessonFile(courseId, newLessonId, lesson.docFile, token)
                      const filePath = uploadResult.file?.FilePath || uploadResult.file?.filePath || uploadResult.filePath
                      if (filePath) {
                        // Update lesson với filePath từ server
                        setLessons(prev => prev.map(l => {
                          if (l.id === lesson.id) {
                            // Cleanup blob URL
                            if (l.docFilePath && l.docFilePath.startsWith('blob:')) {
                              URL.revokeObjectURL(l.docFilePath)
                            }
                            return { 
                              ...l, 
                              docFilePath: filePath, 
                              docFileName: lesson.docFile.name,
                              docFile: null 
                            }
                          }
                          return l
                        }))
                        
                        // Update lesson qua API với filePath
                        await patchLesson(courseId, newLessonId, { 
                          filePath: filePath,
                          contentType: lesson.docFile.name.toLowerCase().endsWith('.pdf') ? "pdf" : "text"
                        }, token)
                      }
                    } catch (uploadErr) {
                      console.error("Error uploading document for new lesson:", uploadErr)
                      // Không throw để không làm fail việc tạo lesson
                    }
                  }
                }
                savedCount++
              })
              .catch((err) => {
                console.error("Error creating lesson:", lesson.title, err)
                errorCount++
              })
          )
        }
      })

      await Promise.all(savePromises)
      
      if (errorCount === 0) {
        toast({
          title: "Đã lưu thành công",
          description: `Đã lưu ${savedCount} bài học.`,
        })
        // ✅ Redirect về trang danh sách khóa học sau 1 giây
        setTimeout(() => {
          router.push("/giangvien/khoahoc")
        }, 1000)
      } else {
        toast({
          title: "Lưu không hoàn toàn",
          description: `Đã lưu ${savedCount} bài học, ${errorCount} bài lỗi.`,
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error saving lessons:", err)
      toast({
        title: "Lỗi",
        description: err.message || "Không thể lưu cài đặt",
        variant: "destructive",
      })
    }
  }


  // Handlers cho bài học
  const focusDynamicTitle = (lessonId) => {
    const el = document.getElementById(`lesson-${lessonId}-title`)
    el?.focus()
  }
  const handleUploadLessonFile = (lessonId) => {
    document.getElementById(`lesson-${lessonId}-file`)?.click()
  }
  const onDynamicFileChange = (lessonId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fileUrl = URL.createObjectURL(file)
    setLessons(prev => prev.map(lesson =>
      lesson.id === lessonId ? { ...lesson, fileName: file.name, fileUrl } : lesson
    ))
  }

  // Upload/Xóa tài liệu PDF/TXT cho bài học
  const uploadDynamicDoc = (lessonId) => {
    document.getElementById(`lesson-${lessonId}-doc`)?.click()
  }
  const onDynamicDocChange = async (lessonId, e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ✅ Kiểm tra file type: chỉ chấp nhận PDF và TXT
    const fileName = file.name.toLowerCase()
    const isValidFile = fileName.endsWith('.pdf') || fileName.endsWith('.txt')
    
    if (!isValidFile) {
      toast({
        title: "Lỗi",
        description: "Chỉ chấp nhận file PDF (.pdf) hoặc TXT (.txt)",
        variant: "destructive",
      })
      e.target.value = ''
      return
    }

    const lesson = lessons.find(l => l.id === lessonId)
    const previewUrl = URL.createObjectURL(file)

    // ✅ Update UI immediately với preview
    setLessons(prev => prev.map(l => {
      if (l.id !== lessonId) return l
      // Cleanup old blob URL nếu có
      if (l.docFilePath && l.docFilePath.startsWith('blob:')) {
        URL.revokeObjectURL(l.docFilePath)
      }
      return {
        ...l,
        docFileName: file.name,
        docFilePath: previewUrl,
        docFile: file,
        uploading: l.lessonId ? true : false // Chỉ upload nếu có lessonId
      }
    }))

    // Upload tài liệu nếu có lessonId (đã lưu vào DB)
    if (lesson?.lessonId && courseId && token) {
      try {
        setUploadingLessons(prev => ({ ...prev, [lesson.lessonId]: { uploading: true, file: file } }))
        
        const uploadResult = await uploadLessonFile(courseId, lesson.lessonId, file, token)
        console.log("✅ Document uploaded:", uploadResult)
        
        // Update lesson với filePath từ server
        const filePath = uploadResult.file?.FilePath || uploadResult.file?.filePath || uploadResult.filePath
        if (filePath) {
          const fullDocUrl = filePath.startsWith('/') 
            ? `https://localhost:3001${filePath}`
            : `https://localhost:3001/${filePath}`
          
          setLessons(prev => prev.map(l => {
            if (l.id !== lessonId) return l
            // Cleanup blob URL
            if (l.docFilePath && l.docFilePath.startsWith('blob:')) {
              URL.revokeObjectURL(l.docFilePath)
            }
            return { 
              ...l, 
              docFilePath: filePath, 
              docFileName: file.name,
              uploading: false, 
              docFile: null 
            }
          }))
          
          // Update lesson qua API
          await patchLesson(courseId, lesson.lessonId, { 
            filePath: filePath,
            contentType: fileName.endsWith('.pdf') ? "pdf" : "text"
          }, token)
        }
        
        toast({
          title: "Upload thành công",
          description: "Tài liệu đã được tải lên.",
        })
      } catch (err) {
        console.error("Error uploading document:", err)
        toast({
          title: "Lỗi upload",
          description: err.message || "Không thể tải tài liệu lên. Tài liệu sẽ được lưu khi bạn lưu bài học.",
          variant: "destructive",
        })
        // Giữ preview nhưng đánh dấu chưa upload
        setLessons(prev => prev.map(l =>
          l.id === lessonId ? { ...l, uploading: false } : l
        ))
      } finally {
        setUploadingLessons(prev => {
          const updated = { ...prev }
          delete updated[lesson.lessonId]
          return updated
        })
      }
    } else {
      // Nếu chưa có lessonId, hiển thị toast thông báo sẽ upload khi lưu
      toast({
        title: "Đã chọn tài liệu",
        description: "Tài liệu sẽ được tải lên khi bạn lưu bài học.",
      })
    }

    e.target.value = ''
  }
  const deleteDynamicDoc = (lessonId) => {
    setLessons(prev => prev.map(lesson => {
      if (lesson.id !== lessonId) return lesson
      // Cleanup blob URL
      if (lesson.docFilePath && lesson.docFilePath.startsWith('blob:')) {
        URL.revokeObjectURL(lesson.docFilePath)
      }
      return { 
        ...lesson, 
        docFileName: null, 
        docFilePath: null, 
        docFile: null 
      }
    }))
  }

  // Upload hợp nhất cho bài học (video + tài liệu)
  const uploadDynamicAsset = (lessonId) => {
    document.getElementById(`lesson-${lessonId}-asset`)?.click()
  }
  const onDynamicAssetChange = async (lessonId, e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    
    const videoFile = files.find(f => f.type?.startsWith('video'))
    const docFiles = files.filter(f => !f.type?.startsWith('video'))
    
    // ✅ Update UI immediately với preview - LUÔN hiển thị preview ngay cả khi chưa có lessonId
    if (videoFile) {
      const previewUrl = URL.createObjectURL(videoFile)
      setLessons(prev => prev.map(lesson => {
        if (lesson.id !== lessonId) return lesson
        // Cleanup old blob URL nếu có
        if (lesson.fileUrl && lesson.fileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(lesson.fileUrl)
        }
        return {
          ...lesson,
          fileName: videoFile.name,
          fileUrl: previewUrl, // ✅ Luôn hiển thị preview ngay
          videoFile: videoFile, // Lưu file để upload sau
          uploading: lesson.lessonId ? true : false // Chỉ upload nếu có lessonId
        }
      }))
      
      // Upload video nếu có lessonId (đã lưu vào DB)
      const lesson = lessons.find(l => l.id === lessonId)
      
      if (lesson?.lessonId && courseId && token) {
        try {
          setUploadingLessons(prev => ({ ...prev, [lesson.lessonId]: { uploading: true, file: videoFile } }))
          
          const uploadResult = await uploadLessonFile(courseId, lesson.lessonId, videoFile, token)
          console.log("✅ Video uploaded:", uploadResult)
          
          // Update lesson với videoUrl từ server
          const filePath = uploadResult.file?.FilePath || uploadResult.file?.filePath || uploadResult.filePath
          if (filePath) {
            const fullVideoUrl = filePath.startsWith('/') 
              ? `https://localhost:3001${filePath}`
              : `https://localhost:3001/${filePath}`
            
            setLessons(prev => prev.map(l => {
              if (l.id !== lessonId) return l
              // Cleanup blob URL
              if (l.fileUrl && l.fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(l.fileUrl)
              }
              return { ...l, fileUrl: fullVideoUrl, videoUrl: filePath, uploading: false, videoFile: null }
            }))
            
            // Update lesson qua API
            await patchLesson(courseId, lesson.lessonId, { 
              videoUrl: filePath,
              contentType: "video"
            }, token)
          }
          
          toast({
            title: "Upload thành công",
            description: "Video đã được tải lên.",
          })
        } catch (err) {
          console.error("Error uploading video:", err)
          toast({
            title: "Lỗi upload",
            description: err.message || "Không thể tải video lên. Video sẽ được lưu khi bạn lưu bài học.",
            variant: "destructive",
          })
          // Giữ preview nhưng đánh dấu chưa upload
          setLessons(prev => prev.map(l =>
            l.id === lessonId ? { ...l, uploading: false } : l
          ))
        } finally {
          setUploadingLessons(prev => {
            const updated = { ...prev }
            delete updated[lesson.lessonId]
            return updated
          })
        }
      } else {
        // Nếu chưa có lessonId, hiển thị toast thông báo sẽ upload khi lưu
        toast({
          title: "Đã chọn video",
          description: "Video sẽ được tải lên khi bạn lưu bài học.",
        })
      }
    }
    
    // Xử lý tài liệu
    if (docFiles.length > 0) {
      setLessons(prev => prev.map(lesson => {
        if (lesson.id !== lessonId) return lesson
        return {
          ...lesson,
          docs: [
            ...(lesson.docs || []),
            ...docFiles.map(f => ({ name: f.name, size: f.size, url: URL.createObjectURL(f), file: f }))
          ]
        }
      }))
    }
    
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
                {courseId && <span className="gvc-course-id">ID: {courseId}</span>}
                {!courseId && (
                  <span className="gvc-course-id" style={{color: 'red'}}>Không có Course ID</span>
                )}
              </div>

            </div>

            {/* Loading state */}
            {loading && (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', color: '#666' }}>Đang tải dữ liệu...</div>
              </div>
            )}

            {/* Summary cards */}
            {!loading && (
              <div className="gvc-summary">
                {/* Tổng bài học */}
                <div className="gvc-summary-card blue">
                  <div className="icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
                      <path
                        d="M24,60H152a32,32,0,0,1,32,32v96a8,8,0,0,1-8,8H48a32,32,0,0,1-32-32V68A8,8,0,0,1,24,60Z"
                        fill="none"
                        stroke="#000"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="24"
                      />
                      <polyline
                        points="184 112 240 80 240 176 184 144"
                        fill="none"
                        stroke="#000"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="24"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="value">{courseData?.totalLessons || lessons.length}</div>
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
                    <div className="value">{lessons.length}</div>
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
                    <div className="value">
                      {courseData?.totalDurationSec 
                        ? `${Math.floor(courseData.totalDurationSec / 60)} phút`
                        : lessons.reduce((sum, l) => sum + (l.durationSec || 0), 0) 
                        ? `${Math.floor(lessons.reduce((sum, l) => sum + (l.durationSec || 0), 0) / 60)} phút`
                        : '0 phút'}
                    </div>
                    <div className="label">Tổng thời lượng</div>
                  </div>
                </div>
                {/* Tỷ lệ hoàn thành TB - Fake data removed, showing placeholder */}
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
                    <div className="value">-</div>
                    <div className="label">Tỷ lệ hoàn thành TB</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="gvc-tabbar">
              <button className="gvc-tab active">Nội dung</button>
              <Link href={`/giangvien/khoahoc/caidat${courseId ? `?courseId=${courseId}` : ''}`} className="gvc-tab">Cài đặt</Link>
            </div>

            {/* Danh sách bài học */}
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <button className="gvc-add-lesson" onClick={addLesson} style={{ marginBottom: '20px' }}>
                + Thêm bài học
              </button>
            </div>

            {/* Hiển thị bài học trực tiếp, không có chapter wrapper */}
            <div className="gvc-lessons">
              {lessons.map((lesson) => (
                <div className="gvc-lesson" key={lesson.id}>
                  <div className="gvc-lesson-row">
                    <div className="gvc-drag">⋮⋮</div>
                    <div className="gvc-lesson-fields">
                      <input 
                        id={`lesson-${lesson.id}-title`}
                        defaultValue={lesson.title} 
                        className="gvc-lesson-title-input"
                        onBlur={(e) => updateLessonTitle(lesson.id, e.target.value)}
                      />
                      <div className="gvc-lesson-meta">
                        <select defaultValue={lesson.type} className="gvc-lesson-type" onChange={(e) => updateFileInputAccept(`lesson-${lesson.id}-asset`, e.target.value)}>
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
                      
                      {/* ✅ Hiển thị video preview ở dưới phần mô tả */}
                      {lesson.fileUrl && lesson.type === "Video" && (
                        <div className="gvc-lesson-preview" style={{ 
                          marginTop: '16px', 
                          width: '100%', 
                          maxWidth: '600px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#000'
                        }}>
                          <video 
                            src={lesson.fileUrl} 
                            controls 
                            style={{ 
                              width: '100%', 
                              borderRadius: '8px',
                              maxHeight: '400px',
                              display: 'block'
                            }} 
                          />
                          {lesson.uploading && (
                            <div style={{ marginTop: '8px', color: '#6366f1', fontSize: '12px' }}>Đang tải lên...</div>
                          )}
                        </div>
                      )}
                      
                      {/* ✅ Hiển thị tài liệu đã upload */}
                      {lesson.docFileName && (lesson.type === "Tài liệu" || lesson.type === "Bài kiểm tra") && (
                        <div className="gvc-lesson-doc" style={{ 
                          marginTop: '16px', 
                          padding: '12px',
                          backgroundColor: '#f9fafb',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                            <div style={{ 
                              width: '48px', 
                              height: '48px', 
                              backgroundColor: '#3b82f6', 
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px', marginBottom: '4px' }}>
                                {lesson.docFileName}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {lesson.docFilePath && lesson.docFilePath.startsWith('blob:') 
                                  ? 'Chưa tải lên' 
                                  : 'Đã tải lên'}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {lesson.docFilePath && !lesson.docFilePath.startsWith('blob:') && (
                              <a
                                href={lesson.docFilePath.startsWith('http') 
                                  ? lesson.docFilePath 
                                  : `https://localhost:3001${lesson.docFilePath.startsWith('/') ? '' : '/'}${lesson.docFilePath}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: '#111827',
                                  color: 'white',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  textDecoration: 'none',
                                  display: 'inline-block'
                                }}
                              >
                                Tải xuống
                              </a>
                            )}
                            <button
                              onClick={() => deleteDynamicDoc(lesson.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                              title="Xóa tài liệu"
                            >
                              Xóa
                            </button>
                          </div>
                          {lesson.uploading && (
                            <div style={{ fontSize: '12px', color: '#6366f1' }}>Đang tải lên...</div>
                          )}
                        </div>
                      )}
                      
                      {/* ✅ Nút upload tài liệu cho bài học loại "Tài liệu" */}
                      {(lesson.type === "Tài liệu" || lesson.type === "Bài kiểm tra") && !lesson.docFileName && (
                        <div style={{ marginTop: '16px' }}>
                          <button
                            onClick={() => uploadDynamicDoc(lesson.id)}
                            style={{
                              padding: '10px 16px',
                              backgroundColor: '#f9fafb',
                              border: '2px dashed #d1d5db',
                              borderRadius: '8px',
                              color: '#374151',
                              fontSize: '14px',
                              fontWeight: '500',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              width: '100%',
                              maxWidth: '400px'
                            }}
                          >
                            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Tải tài liệu (PDF, TXT)
                          </button>
                          <input 
                            id={`lesson-${lesson.id}-doc`} 
                            type="file" 
                            accept=".pdf,.txt"
                            style={{ display: 'none' }} 
                            onChange={(e) => onDynamicDocChange(lesson.id, e)} 
                          />
                        </div>
                      )}
                    </div>
                    <div className="gvc-lesson-actions">
                      <span className="gvc-pill published">
                        Đã xuất bản
                      </span>
                      {lesson.fileName && <span className="gvc-pill">{lesson.fileName}</span>}
                      <button className="gvc-icon-btn" title="Sửa" onClick={() => focusDynamicTitle(lesson.id)}>
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
                
                      {/* ✅ Nút upload tài liệu riêng cho loại "Tài liệu" */}
                      {(lesson.type === "Tài liệu" || lesson.type === "Bài kiểm tra") && (
                        <button className="gvc-icon-btn" title="Upload tài liệu PDF/TXT" onClick={() => uploadDynamicDoc(lesson.id)}>
                          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      )}
                      {/* ✅ Nút upload video/asset cho loại "Video" */}
                      {lesson.type === "Video" && (
                        <button className="gvc-icon-btn" title="Upload tệp" onClick={() => uploadDynamicAsset(lesson.id)}>
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
                      )}
                      <button 
                        className="gvc-icon-btn danger" 
                        title="Xóa"
                        onClick={() => handleDeleteLesson(lesson.id)}
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
                      <input id={`lesson-${lesson.id}-asset`} type="file" multiple accept="video/*" style={{ display: 'none' }} onChange={(e) => onDynamicAssetChange(lesson.id, e)} />
                      <input id={`lesson-${lesson.id}-doc`} type="file" accept=".pdf,.txt" style={{ display: 'none' }} onChange={(e) => onDynamicDocChange(lesson.id, e)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!loading && (
              <div className="gvc-settings-actions">
                <button 
                  className="gvc-save-btn" 
                  onClick={saveSettings}
                  disabled={loading || lessons.length === 0}
                  style={{
                    opacity: (loading || lessons.length === 0) ? 0.6 : 1,
                    cursor: (loading || lessons.length === 0) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
