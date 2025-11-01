"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export default function DashboardPage() {
  const [courses, setCourses] = useState([])

  const myCourses = [
    {
      id: 1,
      title: "Khóa học phát triển React",
      instructor: "Nguyễn Hải Trường",
      progress: 65,
      thumbnail: "/react-course.png",
      totalLessons: 45,
      completedLessons: 29,
      lastAccessed: "2 giờ trước",
    },
    {
      id: 2,
      title: "Học C++",
      instructor: "Trần Văn An",
      progress: 30,
      thumbnail: "/cpp-course.jpg",
      totalLessons: 60,
      completedLessons: 18,
      lastAccessed: "1 ngày trước",
    },
    {
      id: 3,
      title: "Lập trình Web với Node.js",
      instructor: "Lê Thị Mai",
      progress: 85,
      thumbnail: "/nodejs-course.jpg",
      totalLessons: 40,
      completedLessons: 34,
      lastAccessed: "5 giờ trước",
    },
    {
      id: 4,
      title: "Database với MongoDB",
      instructor: "Phạm Minh Tuấn",
      progress: 50,
      thumbnail: "/mongodb-course.jpg",
      totalLessons: 35,
      completedLessons: 17,
      lastAccessed: "3 ngày trước",
    },
  ]

  useEffect(() => {
    // Fade in animation for course cards
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("visible")
            }, index * 150)
          }
        })
      },
      { threshold: 0.1 },
    )

    const cards = document.querySelectorAll(".dashboard-course-card")
    cards.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Dashboard của tôi</h1>
          <p className="text-white-600">Quản lý và tiếp tục học tập các khóa học của bạn</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">📚</span>
              <span className="text-sm text-white-500">Khóa học</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{myCourses.length}</p>
            <p className="text-sm text-white-600 mt-1">Đang học</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">✅</span>
              <span className="text-sm text-white-500">Hoàn thành</span>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {myCourses.reduce((acc, course) => acc + course.completedLessons, 0)}
            </p>
            <p className="text-sm text-white-600 mt-1">Bài học</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">⏱️</span>
              <span className="text-sm text-white-500">Thời gian</span>
            </div>
            <p className="text-3xl font-bold text-cyan-600">127</p>
            <p className="text-sm text-white-600 mt-1">Giờ học</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-3xl">🏆</span>
              <span className="text-sm text-white-500">Chứng chỉ</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">2</p>
            <p className="text-sm text-white-600 mt-1">Đã đạt được</p>
          </div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Học Tập</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course, index) => (
              <div
                key={course.id}
                className="dashboard-course-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8"
              >
                <div className="relative">
                  <img
                    src={course.thumbnail || "/placeholder.svg"}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {course.progress}%
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-white-600 mb-4">{course.instructor?.name || "Chưa có giảng viên"}</p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-white-600 mb-2">
                      <span>
                        {course.completedLessons}/{course.totalLessons} bài học
                      </span>
                      <span className="font-semibold">{course.progress}%</span>
                    </div>
                    <div className="h-2 bg-white-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 transition-all duration-1000 ease-out progress-bar"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-white-500 mb-4">
                    <span>Truy cập: {course.lastAccessed}</span>
                  </div>

                  <Link
                    href={`/learn/${course.id}`}
                    className="block w-full text-center bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Tiếp tục học
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Courses */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Khóa học đề xuất</h2>
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <span className="text-6xl mb-4 block">🎯</span>
            <h3 className="text-xl font-bold mb-2">Khám phá thêm khóa học mới</h3>
            <p className="text-white-600 mb-6">Mở rộng kiến thức của bạn với hàng trăm khóa học chất lượng cao</p>
            <Link
              href="/courses"
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Xem tất cả khóa học
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
