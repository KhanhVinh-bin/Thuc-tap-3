"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function MyCoursesPage() {
  const [student, setStudent] = useState(null)
  const [enrollments, setEnrollments] = useState([])
  const [progressData, setProgressData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = "https://localhost:7025/api"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const userString = localStorage.getItem("currentUser")
        if (!userString) throw new Error("Chưa đăng nhập")

        const user = JSON.parse(userString)
        const userId = user.userId || user.id
        const token = localStorage.getItem("authToken")

        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        }

        const [studentRes, enrollRes] = await Promise.all([
          fetch(`${API_URL}/Students/${userId}`, { headers }),
          fetch(`${API_URL}/Enrollments/ByUser/${userId}`, { headers }),
        ])

        setStudent(await studentRes.json())
        const enrollData = await enrollRes.json()
        
        // EnrollmentsController trả về dữ liệu có sẵn progress
        setEnrollments(enrollData)
        
        // Chuyển đổi dữ liệu progress từ enrollment để hiển thị
        const progressArray = enrollData.map(e => ({
          courseId: e.courseId,
          progressPercent: e.progressPercentage || 0,
          completedLessons: e.completedLessons || 0,
          totalLessons: e.totalLessons || 0
        }))
        setProgressData(progressArray)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>
  if (error) return <p className="text-red-500 p-6">Lỗi: {error}</p>

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">Khóa học của tôi</h1>
      <p className="text-gray-600 mb-6">
        Theo dõi tiến độ học tập và quản lý các khóa học của bạn
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {enrollments.length > 0 ? (
          enrollments.map((enrollment, idx) => {
            const progress = Math.round(enrollment.progressPercentage || 0)
            return (
              <div
                key={enrollment.enrollmentId || idx}
                className="bg-white rounded-lg border p-4 hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {enrollment.courseTitle}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {enrollment.completedLessons || 0} / {enrollment.totalLessons || 0} bài học
                </p>
                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Tiến độ:</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-indigo-600"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                <Link
                  href={`/bai-hoc/${enrollment.courseId}`}
                  className="block text-center mt-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Tiếp tục học
                </Link>
              </div>
            )
          })
        ) : (
          <p>Bạn chưa ghi danh khóa học nào.</p>
        )}
      </div>
    </>
  )
}
