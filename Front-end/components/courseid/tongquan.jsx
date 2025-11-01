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

      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Preview Video */}
      {previewVideoUrl && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={previewVideoUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Course Info - Thumbnail images */}
      {thumbnailUrl && (
        <div className="flex gap-4 items-center">
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={thumbnailUrl}
                alt={title}
                width={96}
                height={96}
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-4 text-sm">
              {(priceValue > 0 || (typeof priceValue === 'string' && priceValue)) && (
                <div>
                  <span className="text-gray-600">Giá: </span>
                  <span className="font-bold text-indigo-600">{formatPrice(priceValue)}</span>
                </div>
              )}
              {duration && (
                <div>
                  <span className="text-gray-600">Thời lượng: </span>
                  <span className="font-semibold">{duration}</span>
                </div>
              )}
              {level && (
                <div>
                  <span className="text-gray-600">Cấp độ: </span>
                  <span className="font-semibold">{level}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
