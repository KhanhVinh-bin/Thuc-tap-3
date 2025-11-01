"use client"

import { useState, useEffect } from "react"
import { getAllCourses, getCourseById } from "@/lib/api"

export default function ApiConnectionTest() {
  const [status, setStatus] = useState("Đang kiểm tra...")
  const [courses, setCourses] = useState([])
  const [testResults, setTestResults] = useState([])

  useEffect(() => {
    testApiConnection()
  }, [])

  const addTestResult = (test, success, message, data = null) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const testApiConnection = async () => {
    setStatus("Đang kiểm tra kết nối API...")
    setTestResults([])

    try {
      // Test 1: Lấy danh sách khóa học
      addTestResult("Kết nối API", null, "Đang kiểm tra...")
      
      const coursesData = await getAllCourses()
      
      if (coursesData && Array.isArray(coursesData)) {
        addTestResult("Lấy danh sách khóa học", true, `Thành công! Tìm thấy ${coursesData.length} khóa học`, coursesData.slice(0, 3))
        setCourses(coursesData)

        // Test 2: Lấy chi tiết khóa học đầu tiên
        if (coursesData.length > 0) {
          const firstCourseId = coursesData[0].courseId
          try {
            const courseDetail = await getCourseById(firstCourseId)
            addTestResult("Lấy chi tiết khóa học", true, `Thành công! Lấy được chi tiết khóa học ID: ${firstCourseId}`, courseDetail)
          } catch (error) {
            addTestResult("Lấy chi tiết khóa học", false, `Lỗi: ${error.message}`)
          }
        }

        setStatus("✅ Kết nối API thành công!")
      } else {
        addTestResult("Lấy danh sách khóa học", false, "API trả về dữ liệu không hợp lệ")
        setStatus("❌ API trả về dữ liệu không hợp lệ")
      }
    } catch (error) {
      addTestResult("Kết nối API", false, `Lỗi kết nối: ${error.message}`)
      setStatus(`❌ Lỗi kết nối API: ${error.message}`)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Kiểm tra kết nối API</h2>
      
      <div className="mb-4">
        <p className="text-lg font-semibold">{status}</p>
      </div>

      <button 
        onClick={testApiConnection}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Kiểm tra lại
      </button>

      <div className="space-y-3">
        {testResults.map((result, index) => (
          <div key={index} className={`p-3 rounded border-l-4 ${
            result.success === true ? 'border-green-500 bg-green-50' :
            result.success === false ? 'border-red-500 bg-red-50' :
            'border-yellow-500 bg-yellow-50'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{result.test}</h3>
                <p className="text-sm text-gray-600">{result.message}</p>
              </div>
              <span className="text-xs text-gray-400">{result.timestamp}</span>
            </div>
            
            {result.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-blue-600">Xem dữ liệu</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>

      {courses.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Danh sách khóa học từ API:</h3>
          <div className="grid gap-3">
            {courses.slice(0, 5).map((course) => (
              <div key={course.courseId} className="p-3 border rounded">
                <h4 className="font-medium">{course.title}</h4>
                <p className="text-sm text-gray-600">ID: {course.courseId} | Giá: {course.price || 'Miễn phí'}</p>
                <p className="text-sm text-gray-600">Danh mục: {course.category?.categoryName || 'Chưa phân loại'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}