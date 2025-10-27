"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/header"

export default function LearningPage() {
  const params = useParams()
  const [currentLesson, setCurrentLesson] = useState(0)
  const [completedLessons, setCompletedLessons] = useState([])
  const [showCheckmark, setShowCheckmark] = useState(false)
  const [progress, setProgress] = useState(0)

  const lessons = [
    { id: 1, title: "Giới thiệu về React", duration: "10:30", completed: false },
    { id: 2, title: "JSX và Components", duration: "15:45", completed: false },
    { id: 3, title: "Props và State", duration: "20:15", completed: false },
    { id: 4, title: "React Hooks cơ bản", duration: "25:30", completed: false },
    { id: 5, title: "useEffect và Side Effects", duration: "18:20", completed: false },
    { id: 6, title: "Context API", duration: "22:10", completed: false },
    { id: 7, title: "React Router", duration: "16:40", completed: false },
    { id: 8, title: "Form Handling", duration: "19:25", completed: false },
  ]

  useEffect(() => {
    // Calculate progress
    const completed = completedLessons.length
    const total = lessons.length
    const newProgress = (completed / total) * 100

    // Animate progress bar
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
    // Ripple effect
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
    <div className="min-h-screen bg-white-50">
      <Header />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-white-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2">Khóa học phát triển React</h2>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white-600 mb-2">
                <span>Tiến độ học tập</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-white-500 mt-2">
                {completedLessons.length} / {lessons.length} bài học hoàn thành
              </p>
            </div>

            {/* Lessons List */}
            <div className="space-y-2">
              <h3 className="font-semibold text-white-700 mb-3">Danh sách bài học</h3>
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => handleLessonClick(index)}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-300 lesson-item ${
                    currentLesson === index
                      ? "bg-purple-50 border-2 border-purple-600 shadow-md"
                      : "bg-white-50 border-2 border-transparent hover:bg-white-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          completedLessons.includes(index) ? "bg-green-500 text-white" : "bg-white-300 text-white-600"
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
                            currentLesson === index ? "text-purple-600" : "text-white-900"
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <p className="text-xs text-white-500">{lesson.duration}</p>
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
            {/* Video Player */}
            <div className="bg-black rounded-xl overflow-hidden mb-8 relative aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={handlePlayClick}
                  className="play-button relative w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <span className="text-4xl text-purple-600 ml-1">▶</span>
                </button>
              </div>
              <img src="/modern-video-player.png" alt="Video" className="w-full h-full object-cover opacity-50" />
            </div>

            {/* Lesson Info */}
            <div className="bg-white rounded-xl shadow-md p-8 mb-6">
              <h1 className="text-3xl font-bold mb-4">{lessons[currentLesson].title}</h1>
              <p className="text-white-600 mb-6">
                Trong bài học này, bạn sẽ tìm hiểu về {lessons[currentLesson].title.toLowerCase()}
                và cách áp dụng chúng trong các dự án React thực tế.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={handleCompleteLesson}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={completedLessons.includes(currentLesson)}
                >
                  {completedLessons.includes(currentLesson) ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}
                </button>

                {currentLesson < lessons.length - 1 && (
                  <button
                    onClick={() => handleLessonClick(currentLesson + 1)}
                    className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Bài tiếp theo →
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold mb-4">Nội dung bài học</h2>
              <div className="prose max-w-none">
                <p className="text-white-700 mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                  dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
                <h3 className="text-xl font-semibold mb-3 mt-6">Các khái niệm chính</h3>
                <ul className="list-disc list-inside space-y-2 text-white-700">
                  <li>Khái niệm cơ bản và cách sử dụng</li>
                  <li>Best practices và patterns phổ biến</li>
                  <li>Các lỗi thường gặp và cách khắc phục</li>
                  <li>Ví dụ thực tế và bài tập áp dụng</li>
                </ul>
              </div>
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
