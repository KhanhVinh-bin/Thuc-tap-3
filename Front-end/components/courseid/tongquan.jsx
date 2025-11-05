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
  
  // ✅ Lấy prerequisites và learningOutcomes từ API
  const prerequisitesRaw = course.prerequisites || course.Prerequisites || ""
  const learningOutcomesRaw = course.learningOutcomes || course.LearningOutcomes || ""
  
  // ✅ Parse string thành array (hỗ trợ nhiều format: newline, comma, semicolon)
  const parseToList = (text) => {
    if (!text || typeof text !== 'string') return []
    
    // Tách theo nhiều dòng (\n)
    let items = text.split('\n').map(item => item.trim()).filter(item => item.length > 0)
    
    // Nếu chỉ có 1 dòng, thử tách theo dấu phẩy hoặc chấm phẩy
    if (items.length === 1) {
      items = items[0].split(/[,;]/).map(item => item.trim()).filter(item => item.length > 0)
    }
    
    // Nếu vẫn chỉ có 1 item và có dấu gạch đầu dòng (-), tách theo đó
    if (items.length === 1 && items[0].includes('-')) {
      items = items[0].split('-').map(item => item.trim()).filter(item => item.length > 0)
    }
    
    return items.length > 0 ? items : []
  }
  
  const prerequisitesList = parseToList(prerequisitesRaw)
  const learningOutcomesList = parseToList(learningOutcomesRaw)

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
        {learningOutcomesList.length > 0 ? (
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {learningOutcomesList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Chưa có thông tin về kết quả học tập</p>
        )}
      </div>

      {/* Requirements */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Yêu cầu</h3>
        {prerequisitesList.length > 0 ? (
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            {prerequisitesList.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">Chưa có yêu cầu cụ thể</p>
        )}
      </div>
    </div>
  )
}
