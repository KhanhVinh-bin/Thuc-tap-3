"use client"

import { useState, useEffect } from 'react'
import { getAllCourses, getCourseById } from '@/lib/api'

export default function ApiTest() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const testGetAllCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllCourses()
      setCourses(data)
      console.log('All courses:', data)
    } catch (err) {
      setError('Lỗi khi tải danh sách khóa học: ' + err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const testGetCourseById = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getCourseById(id)
      setSelectedCourse(data)
      console.log('Course detail:', data)
    } catch (err) {
      setError('Lỗi khi tải chi tiết khóa học: ' + err.message)
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Component</h1>
      
      <div className="space-y-4">
        <button
          onClick={testGetAllCourses}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang tải...' : 'Test Get All Courses'}
        </button>

        {error && (
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {courses.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Danh sách khóa học ({courses.length})</h2>
            <div className="grid gap-4">
              {courses.slice(0, 5).map((course) => (
                <div key={course.courseId} className="p-4 border rounded">
                  <h3 className="font-semibold">{course.title}</h3>
                  <p className="text-gray-600">{course.description}</p>
                  <p className="text-green-600 font-bold">
                    {course.price ? `${course.price.toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Danh mục: {course.category?.categoryName || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Giảng viên: {course.instructor?.expertise || 'N/A'}
                  </p>
                  <button
                    onClick={() => testGetCourseById(course.courseId)}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Xem chi tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCourse && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h2 className="text-xl font-semibold mb-4">Chi tiết khóa học</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(selectedCourse, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}