"use client"

import { useEffect, useState, useRef } from "react"
import { Monitor, Smartphone, Brain, Cloud, Database } from "lucide-react"

export default function PopularCategories() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const categories = [
    { icon: Monitor, name: "Lập trình web", courses: "125 khóa học", color: "bg-blue-100 text-blue-600" },
    { icon: Smartphone, name: "Lập trình Mobile", courses: "125 khóa học", color: "bg-purple-100 text-purple-600" },
    { icon: Brain, name: "AI & Data", courses: "125 khóa học", color: "bg-pink-100 text-pink-600" },
    { icon: Cloud, name: "Cloud & DevOps", courses: "125 khóa học", color: "bg-cyan-100 text-cyan-600" },
    { icon: Database, name: "Database", courses: "125 khóa học", color: "bg-green-100 text-green-600" },
  ]

  return (
    <section ref={sectionRef} className="py-16 bg-white-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white-900 mb-4">Danh mục phổ biến</h2>
          <p className="text-white-600 text-lg">Tìm kiếm theo lĩnh vực mà bạn quan tâm</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl p-6 text-center cursor-pointer card-hover ${
                isVisible ? "fade-in-up" : "opacity-0"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <category.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-white-900 mb-2">{category.name}</h3>
              <p className="text-sm text-white-600">{category.courses}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="px-8 py-3 border-2 border-white-900 text-white-900 rounded-lg font-semibold hover:bg-white-900 hover:text-white transition-all">
            Xem tất cả danh mục
          </button>
        </div>
      </div>
    </section>
  )
}
