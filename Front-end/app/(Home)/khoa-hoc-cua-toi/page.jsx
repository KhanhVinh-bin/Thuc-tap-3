"use client"

import { BookOpen, TrendingUp, Award } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"

export default function MyCoursesPage() {
  const stats = [
    { icon: BookOpen, label: "Khóa học đã đăng ký", value: "3" },
    { icon: TrendingUp, label: "Tiến độ trung bình", value: "36%" },
    { icon: TrendingUp, label: "Giờ đã học", value: "63.3" },
    { icon: Award, label: "Chứng chỉ đạt được", value: "1" },
  ]

  const courses = [
    {
      id: 1,
      title: "Complete React Development Course",
      instructor: "Nguyễn Văn A",
      progress: 65,
      image: "/react-course.jpg",
      status: "Tiếp tục",
      daysLeft: "2 ngày trước",
    },
    {
      id: 2,
      title: "NodeJS Masterclass",
      instructor: "Trần Văn B",
      progress: 100,
      image: "/react-course.jpg",
      status: "Hoàn tất",
      daysLeft: "1 tuần trước",
    },
    {
      id: 3,
      title: "UI/UX Advanced",
      instructor: "Lê Văn C",
      progress: 25,
      image: "/react-course.jpg",
      status: "Tiếp tục",
      daysLeft: "5 ngày trước",
    },
  ]

  const menu = [
    { id: "khoa-hoc-cua-toi", label: "Khóa học của tôi", icon: BookOpen, href: "/khoa-hoc-cua-toi" },
    { id: "chung-chi", label: "Chứng chỉ", icon: Award, href: "/khoa-hoc-cua-toi/chung-chi" },
    { id: "cai-dat", label: "Cài đặt", icon: TrendingUp, href: "/khoa-hoc-cua-toi/cai-dat" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 sticky top-16 h-[calc(100vh-64px)] p-4">
          <nav className="space-y-2">
            {menu.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  item.id === "khoa-hoc-cua-toi"
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-bold mb-2">Khóa học của tôi</h1>
            <p className="text-gray-600 mb-8">
              Theo dõi tiến độ học tập và quản lý các khóa học của bạn
            </p>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-6 border hover:shadow transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <stat.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Courses */}
            <h2 className="text-xl font-semibold mb-4">Các khóa học của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg border hover:shadow transition-shadow overflow-hidden"
                >
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {course.instructor?.name || "Chưa có giảng viên"}
                    </p>
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-3">
                      <div
                        className="h-full bg-indigo-600"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">{course.daysLeft}</span>
                      <button className="bg-black text-white px-3 py-1 rounded hover:bg-gray-800">
                        {course.status}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
