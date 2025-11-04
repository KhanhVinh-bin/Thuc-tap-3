"use client"

import Link from "next/link"
import { Star } from "lucide-react"
import { formatImageUrl } from "@/lib/utils"

export default function CourseCard({ course }) {
  if (!course) return null

  const imageUrl = formatImageUrl(course.image || course.thumbnailUrl, "/placeholder-course.jpg")

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full flex flex-col">
      {/* Ảnh khóa học */}
      <Link href={`/courses/${course.id}`}>
        <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={course.title || course.name || "Khóa học"}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Nếu ảnh không load được, thay bằng placeholder
              if (!e.target.src.includes("/placeholder")) {
                e.target.src = "/placeholder-course.jpg"
              }
            }}
            loading="lazy"
          />
        </div>
      </Link>

      {/* Nội dung */}
      <div className="p-4 space-y-2 flex-1">
        {/* Tên khóa học */}
        <Link href={`/courses/${course.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-[#06b6d4] line-clamp-2">
            {course.title}
          </h3>
        </Link>

        {/* Tên giảng viên */}
        <p className="text-sm text-gray-500">{course.instructor?.name || "Chưa có giảng viên"}</p>

        {/* Đánh giá + Số học viên */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span>{course.rating ? Number(course.rating).toFixed(1) : "4.5"}</span>
          <span>•</span>
          <span>{course.students || 0} học viên</span>
        </div>

        {/* Giá */}
        <div className="mt-2">
          {course.discountPrice ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900">{course.discountPrice.toLocaleString()}₫</span>
              <span className="text-sm text-gray-400 line-through">{course.price.toLocaleString()}₫</span>
            </div>
          ) : (
            <span className="text-lg font-bold text-gray-900">{course.price?.toLocaleString() || 0}₫</span>
          )}
        </div>
      </div>
    </div>
  )
}
