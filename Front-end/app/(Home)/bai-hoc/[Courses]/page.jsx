"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import { getCourseById } from "@/lib/courseApi"
import { useAuth } from "@/lib/auth-context"

const API_BASE_URL = "https://localhost:7025/api"

export default function LearningPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  
  // ✅ Lấy courseId từ params - thử cả Courses (hoa) và courses (thường)
  const courseId = params?.Courses || params?.courses || params?.id
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([]) // Store lesson indices that are completed
  const [completedLessonIds, setCompletedLessonIds] = useState([]) // Store actual lesson IDs from API
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  
  // API data states
  const [lessons, setLessons] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [enrollmentId, setEnrollmentId] = useState(null)

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ✅ Fetch enrollmentId from userId and courseId
  useEffect(() => {
    const fetchEnrollment = async () => {
      // Cho phép xem video ngay cả khi chưa đăng nhập (chỉ không lưu progress)
      if (!courseId) return
      
      // Nếu chưa đăng nhập, skip (không lưu progress)
      if (!user) {
        console.log("⚠️ User not logged in, progress will not be saved")
        return
      }
      
      try {
        const userId = user.userId || user.id || user.UserId
        if (!userId) return
        
        const parsedCourseId = courseId ? (typeof courseId === 'string' ? parseInt(courseId, 10) : courseId) : null
        if (!parsedCourseId || isNaN(parsedCourseId)) return
        
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        }
        
        // Get all enrollments for user, then find the one matching this course
        const enrollmentsResponse = await fetch(`${API_BASE_URL}/Enrollments/ByUser/${userId}`, { headers })
        if (enrollmentsResponse.ok) {
          const enrollments = await enrollmentsResponse.json()
          const enrollment = enrollments.find(e => e.courseId === parsedCourseId || e.CourseId === parsedCourseId)
          if (enrollment) {
            setEnrollmentId(enrollment.enrollmentId || enrollment.EnrollmentId)
            console.log("✅ Found enrollment:", enrollment.enrollmentId || enrollment.EnrollmentId)
          } else {
            console.log("⚠️ No enrollment found for this course")
          }
        }
      } catch (err) {
        console.error("Error fetching enrollment:", err)
      }
    }
    
    fetchEnrollment()
  }, [user, courseId, token])

  // ✅ Load progress when enrollmentId and lessons are available
  useEffect(() => {
    const loadProgress = async () => {
      if (!enrollmentId || lessons.length === 0) return
      
      try {
        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        }
        
        const progressResponse = await fetch(`${API_BASE_URL}/Progress/ByEnrollment/${enrollmentId}`, { headers })
        if (progressResponse.ok) {
          const progressData = await progressResponse.json()
          
          // Map completed lesson IDs
          const completedIds = progressData
            .filter(p => p.isCompleted || p.IsCompleted)
            .map(p => p.lessonId || p.LessonId)
          
          setCompletedLessonIds(completedIds)
          
          // Map to lesson indices
          const completedIndices = lessons
            .map((lesson, index) => {
              const lessonId = lesson.lessonId || lesson.id
              return completedIds.includes(lessonId) ? index : null
            })
            .filter(index => index !== null)
          
          setCompletedLessons(completedIndices)
          console.log("✅ Loaded progress:", { completedIds, completedIndices })
        }
      } catch (err) {
        console.error("Error loading progress:", err)
      }
    }
    
    loadProgress()
  }, [enrollmentId, lessons, token])

  // Fetch lessons from API
  useEffect(() => {
    // Parse courseId thành số nếu là string
    const parsedCourseId = courseId ? (typeof courseId === 'string' ? parseInt(courseId, 10) : courseId) : null
    
    if (!parsedCourseId || isNaN(parsedCourseId)) {
      setError(`Course ID không hợp lệ: ${courseId}`)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch course info
        const courseData = await getCourseById(parsedCourseId)
        setCourse(courseData)

        // ✅ Fetch lessons từ API cũ: /api/Lessons/ByCourse/{courseId}
        const lessonsResponse = await fetch(`${API_BASE_URL}/Lessons/ByCourse/${parsedCourseId}`, {
          headers: { "Content-Type": "application/json" }
        })
        
        if (!lessonsResponse.ok) {
          throw new Error(`Không thể tải bài học (${lessonsResponse.status})`)
        }
        
        const lessonsData = await lessonsResponse.json()
        
        // Format lessons data từ LessonDTO
        const formattedLessons = Array.isArray(lessonsData) ? lessonsData.map((lesson, index) => {
          const formatted = {
            id: lesson.LessonId || lesson.lessonId,
            lessonId: lesson.LessonId || lesson.lessonId,
            title: lesson.Title || lesson.title || `Bài học ${index + 1}`,
            duration: formatDuration(lesson.DurationSec || lesson.durationSec || 0),
            durationSec: lesson.DurationSec || lesson.durationSec || 0,
            contentType: lesson.ContentType || lesson.contentType || "video",
            videoUrl: lesson.VideoUrl || lesson.videoUrl || null,
            file: lesson.File || lesson.file || null,
                completed: false,
            sortOrder: lesson.SortOrder || lesson.sortOrder || index + 1
              }
          return formatted
        }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : []

      setLessons(formattedLessons)
        
        // ✅ After lessons are loaded, trigger progress load (will be handled by progress useEffect)
    } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message || "Không thể tải dữ liệu khóa học")
    } finally {
      setLoading(false)
    }
  }

    fetchData()
  }, [courseId])

  // Get resources from current lesson's file
  const getResources = () => {
    if (!lessons[currentLesson] || !lessons[currentLesson].file) return []
    
    const file = lessons[currentLesson].file
    if (!file.filePath) return []
    
    return [{
      name: file.name || "Tài liệu",
      size: file.fileSizeBigint ? formatFileSize(file.fileSizeBigint) : "N/A",
      filePath: file.filePath,
      fileType: file.fileType || "pdf"
    }]
  }

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  // Get video URL or file URL for current lesson
  const getCurrentLessonMedia = () => {
    if (!lessons[currentLesson]) {
      console.log("⚠️ No lesson at index:", currentLesson)
      return null
    }
    
    const lesson = lessons[currentLesson]
    console.log("🎬 Getting media for lesson:", {
      title: lesson.title,
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl,
      file: lesson.file
    })
    
    // Helper function to build full URL from relative path
    const buildFullUrl = (url) => {
      if (!url) {
        console.log("⚠️ buildFullUrl: url is null/empty")
        return null
      }
      
      // If already absolute URL, return as is
      if (url.startsWith('http://') || url.startsWith('https://')) {
        console.log("✅ buildFullUrl: Already absolute:", url)
        return url
      }
      
      // If relative path from server, add backend base URL
      if (url.startsWith('/uploads/')) {
        // Backend instructor API chạy trên port 3001, student API chạy trên 7025
        // Video/file được upload bởi instructor nên dùng port 3001
        const fullUrl = `https://localhost:3001${url}`
        console.log("✅ buildFullUrl: Built URL:", fullUrl)
        return fullUrl
      }
      
      console.log("⚠️ buildFullUrl: Unknown URL format:", url)
      return url
    }
    
    // If video content type
    if (lesson.contentType === "video") {
      // Priority 1: Check videoUrl field (YouTube hoặc external URL)
      if (lesson.videoUrl) {
        console.log("🔍 Priority 1: Checking videoUrl:", lesson.videoUrl)
        // Check if it's YouTube URL
        if (lesson.videoUrl.includes('youtube.com') || lesson.videoUrl.includes('youtu.be')) {
          let videoId = lesson.videoUrl
          if (lesson.videoUrl.includes('/watch?v=')) {
            videoId = lesson.videoUrl.split('/watch?v=')[1].split('&')[0]
          } else if (lesson.videoUrl.includes('youtu.be/')) {
            videoId = lesson.videoUrl.split('youtu.be/')[1].split('?')[0]
          }
          console.log("✅ Found YouTube video:", videoId)
          return {
            type: 'youtube',
            url: `https://www.youtube.com/embed/${videoId}?autoplay=0`
          }
        }
        // Direct video URL (external hoặc đã có full URL)
        const fullVideoUrl = buildFullUrl(lesson.videoUrl)
        if (fullVideoUrl) {
          console.log("✅ Priority 1: Using videoUrl:", fullVideoUrl)
          return {
            type: 'video',
            url: fullVideoUrl
          }
        }
      }
      
      // Priority 2: Check file.filePath (video từ file upload)
      if (lesson.file && lesson.file.filePath) {
        console.log("🔍 Priority 2: Checking file.filePath:", lesson.file.filePath)
        const fullVideoUrl = buildFullUrl(lesson.file.filePath)
        if (fullVideoUrl) {
          // Kiểm tra file type hoặc extension
          const fileType = lesson.file.fileType?.toLowerCase() || ""
          const fileName = lesson.file.filePath?.toLowerCase() || ""
          const isVideoFile = fileType.includes('video') || 
                              fileName.match(/\.(mp4|webm|ogg|avi|mov|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)
          
          console.log("🔍 File info:", { fileType, fileName, isVideoFile, contentType: lesson.contentType })
          
          if (isVideoFile || lesson.contentType === "video") {
            if (!lesson.videoUrl || lesson.videoUrl === lesson.file.filePath) {
              console.log("✅ Priority 2: Using file.filePath:", fullVideoUrl)
              return {
                type: 'video',
                url: fullVideoUrl
              }
            }
          }
        }
      }
      
      console.log("❌ No video found for lesson:", lesson.title)
    }
    
    // If file/document content type
    if (lesson.file && lesson.file.filePath) {
      const fileUrl = buildFullUrl(lesson.file.filePath)
      if (fileUrl) {
        return {
          type: 'file',
          url: fileUrl,
          fileName: lesson.file.name || "Tài liệu"
        }
      }
    }
    
    return null
  }

  useEffect(() => {
    const completed = completedLessons.length
    const total = lessons.length
    const newProgress = total > 0 ? (completed / total) * 100 : 0

    setTimeout(() => {
      setProgress(newProgress)
    }, 300)
  }, [completedLessons, lessons.length])

  const handleLessonClick = (index) => {
    setCurrentLesson(index)
  }

  // ✅ Save progress to API when lesson is completed
  const handleCompleteLesson = async () => {
    if (!lessons[currentLesson] || completedLessons.includes(currentLesson)) {
      return
    }
    
    const lessonId = lessons[currentLesson].lessonId || lessons[currentLesson].id
    if (!lessonId) return
    
    // Update UI immediately (optimistic update)
    setCompletedLessons([...completedLessons, currentLesson])
    setCompletedLessonIds([...completedLessonIds, lessonId])
    setShowCheckmark(true)

    setTimeout(() => {
      setShowCheckmark(false)
    }, 2000)
    
    // Only save to API if user is logged in and has enrollment
    if (!enrollmentId || !user) {
      console.log("⚠️ Cannot save progress: User not logged in or no enrollment")
      return
    }
    
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      }
      
      // Save progress to API
      const progressResponse = await fetch(`${API_BASE_URL}/Progress`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          enrollmentId: enrollmentId,
          lessonId: lessonId,
          isCompleted: true
        })
      })
      
      if (progressResponse.ok || progressResponse.status === 201) {
        console.log("✅ Progress saved successfully to API")
      } else {
        const errorText = await progressResponse.text()
        console.error("Failed to save progress:", progressResponse.status, errorText)
        // Progress still updated in UI (optimistic update)
      }
    } catch (err) {
      console.error("Error saving progress:", err)
      // Progress already updated in UI (optimistic update)
    }
  }

  // Handle download resource
  const handleDownload = (filePath, fileName) => {
    let downloadUrl = filePath
    // If relative path, add backend base URL
    if (filePath.startsWith('/uploads/')) {
      downloadUrl = `https://localhost:3001${filePath}`
    }
    window.open(downloadUrl, '_blank')
  }

  const handlePlayClick = (e) => {
    const button = e.currentTarget
    const ripple = document.createElement("span")
    const rect = button.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.clientX - rect.left - size / 2
    const y = e.clientY - rect.top - size / 2

    ripple.style.width = ripple.style.height = size + "px"
    ripple.style.left = x + "px"
    ripple.style.top = y + "px"
    ripple.classList.add("ripple")

    button.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600">Đang tải khóa học...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Lỗi: {error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!lessons || lessons.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Khóa học này chưa có bài học nào.</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentLessonData = lessons[currentLesson]
  const mediaData = getCurrentLessonMedia()
  const resources = getResources()

  // Debug info

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">{course?.title || `Khóa học #${courseId}`}</h2>
            <p className="text-sm text-gray-600 mb-6">{course?.description || "Mô tả khóa học"}</p>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Tiến độ học tập</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {completedLessons.length} / {lessons.length} bài học hoàn thành
              </p>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 mb-3">Danh sách bài học</h3>
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.lessonId || lesson.id}
                  onClick={() => handleLessonClick(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 lesson-item ${
                    currentLesson === index
                      ? "bg-purple-50 border-2 border-purple-600 shadow-md"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          completedLessons.includes(index) ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {completedLessons.includes(index) ? (
                          <span className="checkmark-icon">✓</span>
                        ) : (
                          <span className="text-sm">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium truncate ${
                            currentLesson === index ? "text-purple-600" : "text-gray-900"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-gray-500">{lesson.duration}</p>
                      </div>
                    </div>
                    {currentLesson === index && <span className="text-purple-600 ml-2">▶</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {/* Debug Info - Remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <p className="font-semibold mb-2">🐛 Debug Info:</p>
                <p>Lesson: {currentLessonData?.title}</p>
                <p>ContentType: {currentLessonData?.contentType}</p>
                <p>VideoUrl: {currentLessonData?.videoUrl || 'null'}</p>
                <p>File: {currentLessonData?.file ? JSON.stringify(currentLessonData.file, null, 2) : 'null'}</p>
                <p>Media Type: {mediaData?.type || 'null'}</p>
                <p>Media URL: {mediaData?.url || 'null'}</p>
              </div>
            )}

            {/* Media Player */}
            <div className="bg-black rounded-xl overflow-hidden mb-8 aspect-video">
              {mediaData ? (
                mediaData.type === 'youtube' ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={mediaData.url}
                    title={currentLessonData.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : mediaData.type === 'video' ? (
                  <video
                    controls
                    className="w-full h-full"
                    src={mediaData.url}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error("❌ Video load error:", e)
                      console.error("Video URL:", mediaData.url)
                      const video = e.target
                      if (video.error) {
                        console.error("Error code:", video.error?.code, "Message:", video.error?.message)
                      }
                    }}
                    onLoadStart={() => {
                      console.log("🎬 Video started loading:", mediaData.url)
                    }}
                    onLoadedData={() => {
                      console.log("✅ Video data loaded:", mediaData.url)
                    }}
                  >
                    Trình duyệt của bạn không hỗ trợ video.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <div className="text-center">
                      <p className="text-lg mb-4">📄 {mediaData.fileName}</p>
                      <a
                        href={mediaData.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-block"
                      >
                        Mở tài liệu
                      </a>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                  <p>Không có nội dung để hiển thị</p>
                </div>
              )}
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{currentLessonData.title}</h1>
                <button
                  onClick={handleCompleteLesson}
                  disabled={completedLessons.includes(currentLesson)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {completedLessons.includes(currentLesson) ? "Đã hoàn thành" : "Hoàn thành"}
                </button>
              </div>

              <p className="text-gray-600 mb-6">Bài học {currentLesson + 1} - {course?.title || "Khóa học"}</p>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    activeTab === "overview"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tổng quan
                </button>
                <button
                  onClick={() => setActiveTab("qa")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    activeTab === "qa"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Q&A
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    activeTab === "resources"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tài liệu {resources.length > 0 ? `(${resources.length})` : ""}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Trong bài học này, bạn sẽ tìm hiểu về {currentLessonData.title.toLowerCase()} và cách áp dụng
                    chúng trong các dự án thực tế.
                  </p>
                  <h3 className="text-xl font-semibold mb-3 mt-6">Thông tin bài học</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Loại nội dung: {currentLessonData.contentType === "video" ? "Video" : currentLessonData.contentType === "pdf" ? "Tài liệu PDF" : currentLessonData.contentType === "text" ? "Tài liệu văn bản" : "Nội dung"}</li>
                    <li>Thời lượng: {currentLessonData.duration}</li>
                    {currentLessonData.file && (
                      <li>Tài liệu đính kèm: {currentLessonData.file.name || "Tài liệu"}</li>
                    )}
                  </ul>
                </div>
              )}

              {activeTab === "qa" && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Trần Văn B</p>
                    <p className="text-gray-700">Làm sao để sử dụng React Hooks trong class components?</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold text-gray-900 mb-2">Nguyễn Thị C</p>
                    <p className="text-gray-700">Có cách nào để tối ưu hóa performance trong React không?</p>
                  </div>
                </div>
              )}

              {activeTab === "resources" && (
                <div className="space-y-3">
                  {resources.length > 0 ? (
                    resources.map((resource, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">📄</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{resource.name}</p>
                            <p className="text-sm text-gray-600">{resource.size}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(resource.filePath, resource.name)}
                          className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                        >
                          Tải xuống
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Không có tài liệu đính kèm cho bài học này.</p>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                ← Quay lại
              </button>
              {currentLesson < lessons.length - 1 && (
                <button
                  onClick={() => handleLessonClick(currentLesson + 1)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Bài tiếp theo →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Checkmark Animation Overlay */}
      {showCheckmark && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="checkmark-animation">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
        </div>
      )}
    </div>
  )
}
