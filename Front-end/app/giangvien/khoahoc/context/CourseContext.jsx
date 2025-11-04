"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CourseContext = createContext()

export function CourseProvider({ children }) {
  const [courseData, setCourseData] = useState({
    // Step 1
    title: "",
    description: "",
    categoryId: null,
    thumbnailUrl: "",
    // Step 2
    price: 0,
    duration: "",
    level: "",
    prerequisites: "",
    learningOutcomes: "",
    tagName: "",
    tagIds: [],
    // Step 3
    lessons: [],
    // Course ID sau khi tạo
    courseId: null,
  })

  // Load từ sessionStorage khi mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("courseDraftData")
      if (saved) {
        try {
          setCourseData(JSON.parse(saved))
        } catch (e) {
          console.error("Error loading course draft:", e)
        }
      }
    }
  }, [])

  // Save vào sessionStorage mỗi khi courseData thay đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("courseDraftData", JSON.stringify(courseData))
    }
  }, [courseData])

  const updateCourseData = (updates) => {
    setCourseData((prev) => ({ ...prev, ...updates }))
  }

  const resetCourseData = () => {
    setCourseData({
      title: "",
      description: "",
      categoryId: null,
      thumbnailUrl: "",
      price: 0,
      duration: "",
      level: "",
      prerequisites: "",
      learningOutcomes: "",
      tagName: "",
      tagIds: [],
      lessons: [],
      courseId: null,
    })
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("courseDraftData")
    }
  }

  return (
    <CourseContext.Provider value={{ courseData, updateCourseData, resetCourseData }}>
      {children}
    </CourseContext.Provider>
  )
}

export function useCourse() {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error("useCourse must be used within CourseProvider")
  }
  return context
}

