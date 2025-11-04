"use client"
import React from "react"
import Image from "next/image"

export default function TongQuan({ course }) {
  if (!course) return null

  // Lấy dữ liệu từ course object (từ API /api/Courses/{id})
  const title = course.title || course.Title || ""
  const description = course.description || course.Description || ""
  const priceValue = course.priceValue || course.price || course.Price || 0
  const duration = course.duration || course.Duration || ""
  const level = course.level || course.Level || ""
  const thumbnailUrl = course.thumbnailUrl || course.ThumbnailUrl || course.image || "/placeholder.jpg"
  const previewVideoUrl = course.previewVideoUrl || course.PreviewVideoUrl || ""

  const formatPrice = (price) => {
    // Nếu price là string đã format thì trả về luôn
    if (typeof price === 'string' && price.includes('đ')) {
      return price
    }
    return new Intl.NumberFormat("vi-VN").format(price || 0) + " đ"
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      </div>
      {/* Preview Video */}
     

      {/* Course Info - Thumbnail images */}
     

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Mô tả khóa học</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
      </div>

      {/* What you'll learn */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Bạn sẽ học được gì</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Nắm vững kiến thức cơ bản và nâng cao</li>
          <li>Thực hành với dự án thực tế</li>
          <li>Phát triển kỹ năng chuyên môn</li>
          <li>Chuẩn bị cho công việc thực tế</li>
        </ul>
      </div>

      {/* Requirements */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Yêu cầu</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>Kiến thức cơ bản về máy tính</li>
          <li>Đam mê học hỏi và khám phá</li>
          <li>Máy tính có kết nối Internet</li>
        </ul>
      </div>
    </div>
  )
}
