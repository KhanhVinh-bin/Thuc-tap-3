"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Header from "@/components/header"

export default function LearningPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.Courses // Lấy course ID từ URL parameter
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [progress, setProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("overview")

  const videoIds = [
    "R6plN3FvzFY", // Video 1
    "Da1tpV9TMU0", // Video 2
    "u1DlQQxWgyo", // Video 3
    "qpIautEyv2s", // Video 4
  ]

  const lessons = [
    { id: 1, title: "React là gì?", duration: "10:30", completed: false },
    { id: 2, title: "Cài đặt môi trường", duration: "15:45", completed: false },
    { id: 3, title: "JSX và Bài Dé Soltuné Montepré", duration: "20:15", completed: false },
    { id: 4, title: "Bài tập thực hành", duration: "25:30", completed: false },
  ]

  const resources = [
    { name: "React Components Cheat Sheet.pdf", size: "2.3 MB" },
    { name: "Source Code - Lesson 1-3.zip", size: "5.1 MB" },
    { name: "React Hooks Reference.pdf", size: "1.8 MB" },
  ]

  useEffect(() => {
    const completed = completedLessons.length
    const total = lessons.length
    const newProgress = (completed / total) * 100

    setTimeout(() => {
      setProgress(newProgress)
    }, 300)
  }, [completedLessons])

  const handleLessonClick = (index) => {
    setCurrentLesson(index)
  }

  const handleCompleteLesson = () => {
    if (!completedLessons.includes(currentLesson)) {
      setCompletedLessons([...completedLessons, currentLesson])
      setShowCheckmark(true)

      setTimeout(() => {
        setShowCheckmark(false)
      }, 2000)
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Khóa học #{courseId}</h2>
            <p className="text-sm text-gray-600 mb-6">Giới thiệu React</p>

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
                  key={lesson.id}
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
            <div className="bg-black rounded-xl overflow-hidden mb-8 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoIds[currentLesson % videoIds.length]}?autoplay=0`}
                title={lessons[currentLesson].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{lessons[currentLesson].title}</h1>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors">
                  Hoàn thành
                </button>
              </div>

              <p className="text-gray-600 mb-6">Bài học 1 - Giới thiệu React</p>

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
                  Q&A (2)
                </button>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`px-4 py-3 font-semibold transition-colors ${
                    activeTab === "resources"
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tài liệu (3)
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === "overview" && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Trong bài học này, bạn sẽ tìm hiểu về {lessons[currentLesson].title.toLowerCase()} và cách áp dụng
                    chúng trong các dự án React thực tế.
                  </p>
                  <h3 className="text-xl font-semibold mb-3 mt-6">Các khái niệm chính</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Khái niệm cơ bản và cách sử dụng</li>
                    <li>Best practices và patterns phổ biến</li>
                    <li>Các lỗi thường gặp và cách khắc phục</li>
                    <li>Ví dụ thực tế và bài tập áp dụng</li>
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
                  {resources.map((resource, index) => (
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
                      <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                        Tải xuống
                      </button>
                    </div>
                  ))}
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
