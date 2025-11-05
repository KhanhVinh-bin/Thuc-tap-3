"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getCourseById } from "@/lib/courseApi"
import { useAuth } from "@/lib/auth-context"
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, ChevronDown, Check } from "lucide-react"

const API_BASE_URL = "https://localhost:7025/api"

export default function LearningPage() {
  const params = useParams()
  const router = useRouter()
  const { user, token } = useAuth()
  const videoRef = useRef(null)
  
  const courseId = params?.Courses || params?.courses || params?.id
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [completedLessonIds, setCompletedLessonIds] = useState([])
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [videoDuration, setVideoDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showPlayButton, setShowPlayButton] = useState(true)
  const [expandedSections, setExpandedSections] = useState({ "section-0": true })
  
  const [lessons, setLessons] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [enrollmentId, setEnrollmentId] = useState(null)

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // ✅ Fetch enrollmentId from userId and courseId
  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!courseId) return
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
        
        const enrollmentsResponse = await fetch(`${API_BASE_URL}/Enrollments/ByUser/${userId}`, { headers })
        if (enrollmentsResponse.ok) {
          const enrollments = await enrollmentsResponse.json()
          const enrollment = enrollments.find(e => e.courseId === parsedCourseId || e.CourseId === parsedCourseId)
          if (enrollment) {
            setEnrollmentId(enrollment.enrollmentId || enrollment.EnrollmentId)
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
          
          const completedIds = progressData
            .filter(p => p.isCompleted || p.IsCompleted)
            .map(p => p.lessonId || p.LessonId)
          
          setCompletedLessonIds(completedIds)
          
          const completedIndices = lessons
            .map((lesson, index) => {
              const lessonId = lesson.lessonId || lesson.id
              return completedIds.includes(lessonId) ? index : null
            })
            .filter(index => index !== null)
          
          setCompletedLessons(completedIndices)
        }
      } catch (err) {
        console.error("Error loading progress:", err)
      }
    }
    
    loadProgress()
  }, [enrollmentId, lessons, token])

  // Fetch lessons from API
  useEffect(() => {
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

        const courseData = await getCourseById(parsedCourseId)
        setCourse(courseData)

        const lessonsResponse = await fetch(`${API_BASE_URL}/Lessons/ByCourse/${parsedCourseId}`, {
          headers: { "Content-Type": "application/json" }
        })
        
        if (!lessonsResponse.ok) {
          throw new Error(`Không thể tải bài học (${lessonsResponse.status})`)
        }
        
        const lessonsData = await lessonsResponse.json()
        
        // ✅ Log raw data để debug
        console.log("📦 Raw lessons data:", lessonsData)
        
        const formattedLessons = Array.isArray(lessonsData) ? lessonsData.map((lesson, index) => {
          // ✅ Lấy đầy đủ thông tin từ nhiều nguồn khác nhau
          const fileObj = lesson.File || lesson.file || null
          
          // ✅ Thu thập TẤT CẢ các URL có thể từ nhiều nguồn
          const videoUrlFromLesson = lesson.VideoUrl || lesson.videoUrl || null
          const filePathFromFile = fileObj?.FilePath || fileObj?.filePath || null
          const filePathFromLesson = lesson.FilePath || lesson.filePath || null
          const fileUrlFromFile = fileObj?.FileUrl || fileObj?.fileUrl || null
          const fileUrlFromLesson = lesson.FileUrl || lesson.fileUrl || null
          
          // ✅ Ưu tiên: videoUrl > filePath từ file > filePath từ lesson > fileUrl từ file > fileUrl từ lesson
          const finalVideoUrl = videoUrlFromLesson || filePathFromFile || filePathFromLesson || fileUrlFromFile || fileUrlFromLesson || null
          const finalFilePath = filePathFromFile || filePathFromLesson || fileUrlFromFile || fileUrlFromLesson || finalVideoUrl || null
          
          // ✅ Tạo formatted object với spread trước, sau đó ghi đè các giá trị đã format
          const formatted = {
            // ✅ Spread trước để giữ tất cả thuộc tính gốc
            ...lesson,
            // ✅ Sau đó ghi đè với các giá trị đã format
            id: lesson.LessonId || lesson.lessonId || lesson.id,
            lessonId: lesson.LessonId || lesson.lessonId || lesson.id,
            title: lesson.Title || lesson.title || `Bài học ${index + 1}`,
            duration: formatDuration(lesson.DurationSec || lesson.durationSec || lesson.durationSec || 0),
            durationSec: lesson.DurationSec || lesson.durationSec || 0,
            contentType: lesson.ContentType || lesson.contentType || "video",
            // ✅ Lưu tất cả các URL có thể - ĐẢM BẢO không bị ghi đè
            videoUrl: finalVideoUrl,
            filePath: finalFilePath,
            // ✅ Giữ nguyên file object để fallback
            file: fileObj || lesson.File || lesson.file,
            fileType: (fileObj?.FileType || fileObj?.fileType || lesson.FileType || lesson.fileType || "").toLowerCase(),
            completed: false,
            sortOrder: lesson.SortOrder || lesson.sortOrder || index + 1,
            // ✅ Đảm bảo các thuộc tính gốc được giữ lại
            VideoUrl: videoUrlFromLesson || lesson.VideoUrl || lesson.videoUrl,
            FilePath: filePathFromLesson || lesson.FilePath || lesson.filePath,
            FileUrl: fileUrlFromLesson || lesson.FileUrl || lesson.fileUrl
          }
          
          // ✅ Log từng lesson để debug
          console.log(`📝 Lesson ${index + 1} formatted:`, {
            title: formatted.title,
            videoUrl: formatted.videoUrl,
            filePath: formatted.filePath,
            VideoUrl: formatted.VideoUrl,
            FilePath: formatted.FilePath,
            FileUrl: formatted.FileUrl,
            contentType: formatted.contentType,
            hasFile: !!formatted.file,
            lessonId: formatted.lessonId,
            rawLesson: lesson
          })
          
          return formatted
        }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : []
        
        console.log("✅ Formatted lessons:", formattedLessons)

        setLessons(formattedLessons)
    } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message || "Không thể tải dữ liệu khóa học")
    } finally {
      setLoading(false)
    }
  }

    fetchData()
  }, [courseId])

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

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B"
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const getCurrentLessonMedia = () => {
    if (!lessons[currentLesson]) {
      console.log("⚠️ No lesson at index:", currentLesson)
      return null
    }
    
    const lesson = lessons[currentLesson]
    
    console.log("🎬 Getting media for lesson:", {
      lessonIndex: currentLesson,
      title: lesson.title,
      fullLesson: lesson
    })
    
    const buildFullUrl = (url) => {
      if (!url || url === null || url === undefined || url === '') {
        return null
      }
      
      const urlStr = String(url).trim()
      if (!urlStr) return null
      
      if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        return urlStr
      }
      
      const baseUrl = `https://localhost:3001`
      let normalizedPath = urlStr
      
      // Nếu bắt đầu bằng uploads hoặc lessons, giữ nguyên
      if (urlStr.startsWith('/uploads/') || urlStr.startsWith('uploads/')) {
        normalizedPath = urlStr.startsWith('/') ? urlStr : `/${urlStr}`
      } else if (!urlStr.startsWith('/') && !urlStr.startsWith('http')) {
        // Nếu không có prefix, thêm /uploads/
        normalizedPath = `/uploads/${urlStr}`
      } else {
        normalizedPath = urlStr.startsWith('/') ? urlStr : `/${urlStr}`
      }
      
      // Encode URL parts
      const parts = normalizedPath.split('/').filter(p => p)
      const encodedParts = parts.map((part) => {
        if (part === 'uploads' || part === 'lessons') {
          return part
        }
        return encodeURIComponent(part)
      })
      const encodedPath = '/' + encodedParts.join('/')
      return `${baseUrl}${encodedPath}`
    }
    
    // ✅ Thu thập TẤT CẢ các URL có thể từ lesson - kiểm tra cả camelCase và PascalCase
    const allPossibleUrls = []
    
    // Helper function để thêm URL không trùng lặp
    const addUrlIfNotExists = (url, source) => {
      if (url && url !== null && url !== undefined && url !== '') {
        const urlStr = String(url).trim()
        if (urlStr && !allPossibleUrls.find(u => String(u.url).trim() === urlStr)) {
          allPossibleUrls.push({ url: urlStr, source })
        }
      }
    }
    
    // 1. Từ lesson.videoUrl (camelCase)
    addUrlIfNotExists(lesson.videoUrl, 'videoUrl')
    
    // 2. Từ lesson.VideoUrl (PascalCase)
    addUrlIfNotExists(lesson.VideoUrl, 'VideoUrl')
    
    // 3. Từ lesson.filePath (camelCase)
    addUrlIfNotExists(lesson.filePath, 'filePath')
    
    // 4. Từ lesson.FilePath (PascalCase)
    addUrlIfNotExists(lesson.FilePath, 'FilePath')
    
    // 5. Từ lesson.fileUrl (camelCase)
    addUrlIfNotExists(lesson.fileUrl, 'fileUrl')
    
    // 6. Từ lesson.FileUrl (PascalCase)
    addUrlIfNotExists(lesson.FileUrl, 'FileUrl')
    
    // 7. Từ lesson.file object - tất cả các thuộc tính có thể
    if (lesson.file) {
      const file = lesson.file
      addUrlIfNotExists(file.FilePath, 'file.FilePath')
      addUrlIfNotExists(file.filePath, 'file.filePath')
      addUrlIfNotExists(file.Path, 'file.Path')
      addUrlIfNotExists(file.path, 'file.path')
      addUrlIfNotExists(file.Url, 'file.Url')
      addUrlIfNotExists(file.url, 'file.url')
      addUrlIfNotExists(file.FileUrl, 'file.FileUrl')
      addUrlIfNotExists(file.fileUrl, 'file.fileUrl')
      addUrlIfNotExists(file.VideoUrl, 'file.VideoUrl')
      addUrlIfNotExists(file.videoUrl, 'file.videoUrl')
    }
    
    // 8. Từ lesson object - tất cả các thuộc tính có thể chứa URL (PascalCase)
    addUrlIfNotExists(lesson.Url, 'lesson.Url')
    addUrlIfNotExists(lesson.Path, 'lesson.Path')
    
    // 9. Kiểm tra tất cả các keys trong lesson object để tìm URL
    Object.keys(lesson).forEach(key => {
      const value = lesson[key]
      if (value && typeof value === 'string') {
        // Nếu key chứa "url", "path", "video" và value có vẻ là URL
        const lowerKey = key.toLowerCase()
        if ((lowerKey.includes('url') || lowerKey.includes('path') || lowerKey.includes('video')) && 
            (value.includes('/') || value.includes('http'))) {
          addUrlIfNotExists(value, `lesson.${key}`)
        }
      }
    })
    
    console.log("📋 All possible URLs found:", allPossibleUrls)
    console.log("🔍 Full lesson object keys:", Object.keys(lesson))
    console.log("🔍 Lesson values:", {
      videoUrl: lesson.videoUrl,
      VideoUrl: lesson.VideoUrl,
      filePath: lesson.filePath,
      FilePath: lesson.FilePath,
      file: lesson.file
    })
    
    // ✅ Kiểm tra YouTube URLs trước
    for (const item of allPossibleUrls) {
      const url = item.url
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = url
        if (url.includes('/watch?v=')) {
          videoId = url.split('/watch?v=')[1].split('&')[0]
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0]
        }
        console.log("✅ Found YouTube video:", videoId)
        return {
          type: 'youtube',
          url: `https://www.youtube.com/embed/${videoId}?autoplay=0`
        }
      }
    }
    
    // ✅ Kiểm tra tất cả các URL khác - nếu có URL nào thì dùng luôn (không cần kiểm tra video extension)
    for (const item of allPossibleUrls) {
      const url = item.url
      const fullUrl = buildFullUrl(url)
      if (fullUrl) {
        console.log(`✅ Using video URL from ${item.source}:`, fullUrl)
        return {
          type: 'video',
          url: fullUrl
        }
      }
    }
    
    console.log("❌ No media found for lesson:", lesson.title)
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

  // Video controls handlers
  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play()
        setIsPlaying(true)
        setShowPlayButton(false)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
      setVideoDuration(videoRef.current.duration)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const pos = (e.clientX - rect.left) / rect.width
      videoRef.current.currentTime = pos * videoRef.current.duration
    }
  }

  const handleSkipBack = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10)
    }
  }

  const handleSkipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 10)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen()
      } else if (videoRef.current.mozRequestFullScreen) {
        videoRef.current.mozRequestFullScreen()
      }
    }
  }

  const handleLessonClick = (index) => {
    setCurrentLesson(index)
    setShowPlayButton(true)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const handleCompleteLesson = async () => {
    if (!lessons[currentLesson] || completedLessons.includes(currentLesson)) {
      return
    }
    
    const lessonId = lessons[currentLesson].lessonId || lessons[currentLesson].id
    if (!lessonId) return
    
    setCompletedLessons([...completedLessons, currentLesson])
    setCompletedLessonIds([...completedLessonIds, lessonId])
    setShowCheckmark(true)

    setTimeout(() => {
      setShowCheckmark(false)
    }, 2000)
    
    if (!enrollmentId || !user) {
      return
    }
    
    try {
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      }
      
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
      }
    } catch (err) {
      console.error("Error saving progress:", err)
    }
  }

  const handleDownload = (filePath, fileName) => {
    let downloadUrl = filePath
    if (filePath.startsWith('/uploads/')) {
      downloadUrl = `https://localhost:3001${filePath}`
    }
    window.open(downloadUrl, '_blank')
  }

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
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
  
  // Group lessons by section (for now, all in one section)
  const sections = [{ id: "section-0", title: course?.title || "Nội dung khóa học", lessons: lessons }]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="bg-white text-gray-900 py-6">
        <div className="w-full">
          <div className="grid lg:grid-cols-3 gap-0">
            {/* Main Content - Left */}
            <div className="lg:col-span-2">
              {/* Video Player - Full width sát bên trái, không có khoảng trống */}
              <div className="relative bg-black w-full overflow-hidden mb-6 aspect-video group">
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
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full"
                        src={mediaData.url}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onEnded={() => {
                          setIsPlaying(false)
                          setShowPlayButton(true)
                        }}
                        onClick={handlePlayPause}
                        crossOrigin="anonymous"
                      >
                        Trình duyệt của bạn không hỗ trợ video.
                      </video>
                      
                      {/* Custom Play Button Overlay */}
                      {showPlayButton && !isPlaying && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center bg-black/50 cursor-pointer z-10"
                          onClick={handlePlayPause}
                        >
                          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                            <Play className="w-10 h-10 text-white ml-1" fill="white" />
                          </div>
                        </div>
                      )}
                      
                      {/* Video Info Overlay */}
                      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
                        <h3 className="text-xl font-bold mb-1">{currentLessonData.title}</h3>
                        <p className="text-sm text-white/80">Bài học {currentLesson + 1} - {course?.title || "Khóa học"}</p>
                      </div>
                      
                      {/* Custom Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {/* Progress Bar */}
                        <div 
                          className="w-full h-1 bg-white/30 rounded-full mb-3 cursor-pointer"
                          onClick={handleSeek}
                        >
                          <div 
                            className="h-full bg-[#06b6d4] rounded-full transition-all"
                            style={{ width: `${videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0}%` }}
                          />
                        </div>
                        
                        {/* Controls */}
                        <div className="flex items-center gap-4">
                          <button onClick={handlePlayPause} className="text-white hover:text-[#06b6d4] transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                          </button>
                          <button onClick={handleSkipBack} className="text-white hover:text-[#06b6d4] transition-colors">
                            <SkipBack className="w-5 h-5" />
                          </button>
                          <button onClick={handleSkipForward} className="text-white hover:text-[#06b6d4] transition-colors">
                            <SkipForward className="w-5 h-5" />
                          </button>
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5 text-white" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-20"
                            />
                          </div>
                          <div className="flex-1 text-white text-sm">
                            {formatTime(currentTime)} / {formatTime(videoDuration)}
                          </div>
                          <button onClick={handleFullscreen} className="text-white hover:text-[#06b6d4] transition-colors">
                            <Maximize className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </>
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

              {/* Course Title and Instructor */}
              <div className="px-6">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">{course?.title || `Khóa học #${courseId}`}</h1>
                <p className="text-gray-600 mb-6">Giảng viên: {course?.instructor?.fullName || course?.instructor?.name || "Giảng viên"}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6 px-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Tiến độ: {completedLessons.length}/{lessons.length} bài</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(progress)}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#06b6d4] transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <button
                    onClick={handleCompleteLesson}
                    disabled={completedLessons.includes(currentLesson)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {completedLessons.includes(currentLesson) ? (
                      <>
                        <Check className="w-4 h-4" />
                        Hoàn thành
                      </>
                    ) : (
                      "Hoàn thành"
                    )}
                  </button>
                </div>
              </div>

              {/* Lesson Content Tabs */}
              <div className="bg-white rounded-lg p-6 px-6">
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
                    Q&A {false ? `(2)` : ""}
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
                  <div>
                    <p className="text-gray-700 mb-4">
                      Trong bài học này, chúng ta sẽ tìm hiểu về {currentLessonData.title.toLowerCase()} - một phần quan trọng của khóa học. Bạn sẽ học được:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      <li>Kiến thức cơ bản về {currentLessonData.title.toLowerCase()}</li>
                      <li>Các khái niệm và ứng dụng thực tế</li>
                      <li>Best practices và tips hữu ích</li>
                      <li>Cách áp dụng vào các dự án thực tế</li>
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
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-1 px-6">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-2">Nội dung khóa học</h2>
                <p className="text-sm text-gray-600 mb-6">{completedLessons.length}/{lessons.length} bài học đã hoàn thành</p>

                {sections.map((section) => (
                  <div key={section.id} className="mb-4">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between text-left font-semibold text-gray-900 mb-3 hover:text-[#06b6d4] transition-colors"
                    >
                      <span>{section.title}</span>
                      <ChevronDown 
                        className={`w-5 h-5 transition-transform ${expandedSections[section.id] ? 'rotate-180' : ''}`}
                      />
                    </button>
                    
                    {expandedSections[section.id] && (
                      <div className="space-y-2">
                        {section.lessons.map((lesson, index) => {
                          const isCompleted = completedLessons.includes(index)
                          const isCurrent = currentLesson === index
                          return (
                            <button
                              key={lesson.lessonId || lesson.id}
                              onClick={() => handleLessonClick(index)}
                              className={`w-full text-left p-3 rounded-lg transition-all ${
                                isCurrent
                                  ? "bg-[#06b6d4]/10 border border-[#06b6d4]"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {isCompleted ? (
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 text-white" />
                                  </div>
                                ) : (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isCurrent ? "bg-[#06b6d4] text-white" : "bg-gray-300 text-gray-600"
                                  }`}>
                                    {isCurrent ? (
                                      <Play className="w-3 h-3 ml-0.5" fill="white" />
                                    ) : (
                                      <span className="text-xs">{index + 1}</span>
                                    )}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm truncate ${
                                    isCurrent ? "text-[#06b6d4]" : "text-gray-900"
                                  }`}>
                                    {lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500">{lesson.duration}</p>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

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

      <style jsx>{`
        .checkmark-animation {
          animation: scaleIn 0.3s ease-out;
        }
        .checkmark-circle {
          stroke: #4ade80;
          stroke-width: 2;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark-check {
          stroke: #4ade80;
          stroke-width: 2;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
