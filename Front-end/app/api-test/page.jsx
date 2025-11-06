"use client"

import { useState } from "react"
import { getAllCourses, getCourseById } from "@/lib/api"

export default function ApiTestPage() {
  const [courses, setCourses] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [courseId, setCourseId] = useState("")

  const testGetAllCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllCourses()
      setCourses(data)
      console.log("All courses:", data)
    } catch (err) {
      setError("Lỗi khi lấy danh sách khóa học: " + err.message)
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const testGetCourseById = async () => {
    if (!courseId) {
      setError("Vui lòng nhập ID khóa học")
      return
    }
    
    setLoading(true)
    setError(null)
    try {
      const data = await getCourseById(courseId)
      setCourse(data)
      console.log("Course detail:", data)
    } catch (err) {
      setError("Lỗi khi lấy chi tiết khóa học: " + err.message)
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Test Get All Courses */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Test Get All Courses</h2>
          <button 
            onClick={testGetAllCourses}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Get All Courses"}
          </button>
          
          {courses.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Kết quả ({courses.length} khóa học):</h3>
              <div className="max-h-60 overflow-y-auto">
                {courses.map((course, index) => (
                  <div key={index} className="border-b py-2">
                    <p><strong>ID:</strong> {course.courseId}</p>
                    <p><strong>Title:</strong> {course.title}</p>
                    <p><strong>Price:</strong> {course.price}</p>
                    <p><strong>Category:</strong> {course.category?.categoryName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Test Get Course By ID */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Test Get Course By ID</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Nhập Course ID"
              className="border px-3 py-2 rounded flex-1"
            />
            <button 
              onClick={testGetCourseById}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Get Course"}
            </button>
          </div>
          
          {course && (
            <div className="mt-4">
              <h3 className="font-semibold">Chi tiết khóa học:</h3>
              <div className="bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(course, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}