"use client"
import React, { useState, useEffect } from "react"
import { Play, Lock, CheckCircle2 } from "lucide-react"

export default function NoiDung({ courseId }) {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = "https://localhost:7025/api"

  useEffect(() => {
    const fetchLessons = async () => {
      if (!courseId) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_URL}/Lessons/ByCourse/${courseId}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch lessons: ${response.status}`)
        }

        const data = await response.json()
        setLessons(data || [])
      } catch (err) {
        console.error("Error fetching lessons:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [courseId])

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Lỗi: {error}</p>
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có nội dung khóa học.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Nội dung khóa học</h2>
      
      <div className="space-y-2">
        {lessons.map((lesson, index) => (
          <div
            key={lesson.lessonId || lesson.LessonId || index}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex-shrink-0">
                  {lesson.isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <span className="text-xs font-semibold text-gray-600">{index + 1}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Play className="w-4 h-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">
                      {lesson.title || lesson.Title || `Bài ${index + 1}`}
                    </h3>
                  </div>
                  
                  <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                    <span>{formatDuration(lesson.durationSec || lesson.DurationSec)}</span>
                    {lesson.contentType && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {lesson.contentType || lesson.ContentType}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                {lesson.isCompleted ? (
                  <span className="text-green-600 text-sm font-medium">Đã hoàn thành</span>
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Tổng cộng: <span className="font-semibold">{lessons.length} bài học</span>
        </p>
      </div>
    </div>
  )
}
