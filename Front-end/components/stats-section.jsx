"use client"

import { useEffect, useState, useRef } from "react"
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react"

export default function StatsSection() {
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

  const stats = [
    { icon: Users, value: "2000+", label: "Học viên", color: "text-[#06b6d4]" },
    { icon: BookOpen, value: "100+", label: "Khóa học", color: "text-[#7c3aed]" },
    { icon: GraduationCap, value: "2", label: "Giảng viên", color: "text-[#10b981]" },
    { icon: TrendingUp, value: "36%", label: "Tỉ lệ hoàn thành", color: "text-[#f59e0b]" },
  ]

  return (
    <section ref={sectionRef} className="py-16 bg-white-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`text-center ${isVisible ? "fade-in-up" : "opacity-0"}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-center mb-4">
                <div className={`p-4 rounded-full bg-white shadow-md ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-white-900 mb-2">{stat.value}</div>
              <div className="text-white-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
