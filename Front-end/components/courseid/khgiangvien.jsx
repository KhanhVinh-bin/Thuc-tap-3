"use client"
import React from "react"
import Image from "next/image"
import { Award, Users, BookOpen, Linkedin, Facebook, Youtube } from "lucide-react"

export default function KhGiangVien({ course }) {
  if (!course) return null

  // Lấy dữ liệu từ course.instructor object (từ API /api/Courses/{id})
  const instructorInfo = course.instructor || course.Instructor || {}
  
  // Lấy thông tin giảng viên từ instructor object
  // Note: InstructorDTO không có fullName, chỉ có InstructorId
  const instructorName = instructorInfo.fullName || 
                        course.instructorName || 
                        `Giảng viên #${instructorInfo.instructorId || instructorInfo.InstructorId || ''}`
  
  const expertise = instructorInfo.expertise || instructorInfo.Expertise || ""
  const biography = instructorInfo.biography || instructorInfo.Biography || ""
  const experienceYears = instructorInfo.experienceYears || instructorInfo.ExperienceYears || 0
  const education = instructorInfo.education || instructorInfo.Education || ""
  const ratingAverage = instructorInfo.ratingAverage || instructorInfo.RatingAverage || 0
  const totalStudents = instructorInfo.totalStudents || instructorInfo.TotalStudents || 0
  const totalCourses = instructorInfo.totalCourses || instructorInfo.TotalCourses || 0
  
  // Social links
  const linkedInUrl = instructorInfo.linkedInUrl || instructorInfo.LinkedInUrl || ""
  const facebookUrl = instructorInfo.facebookUrl || instructorInfo.FacebookUrl || ""
  const youTubeUrl = instructorInfo.youTubeUrl || instructorInfo.YouTubeUrl || ""
  const xUrl = instructorInfo.xUrl || instructorInfo.XUrl || ""
  
  // Avatar - sử dụng placeholder nếu không có
  const avatarUrl = "/placeholder-user.jpg"

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Giảng viên</h2>

      {/* Instructor Profile Card */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={avatarUrl}
                alt={instructorName}
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{instructorName}</h3>
            
            {expertise && (
              <p className="text-indigo-600 font-medium mb-3">{expertise}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">Đánh giá</p>
                  <p className="font-semibold">{ratingAverage.toFixed(1)} ⭐</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Học viên</p>
                  <p className="font-semibold">{totalStudents.toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Khóa học</p>
                  <p className="font-semibold">{totalCourses}</p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            {(linkedInUrl || facebookUrl || youTubeUrl || xUrl) && (
              <div className="flex items-center gap-3 mt-4">
                {linkedInUrl && (
                  <a
                    href={linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {youTubeUrl && (
                  <a
                    href={youTubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Youtube className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Biography */}
      {biography && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Giới thiệu</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{biography}</p>
        </div>
      )}

      {/* Experience & Education */}
      <div className="grid md:grid-cols-2 gap-6">
        {experienceYears > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Kinh nghiệm</h3>
            <p className="text-gray-700">{experienceYears} năm kinh nghiệm</p>
          </div>
        )}
        
        {education && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Học vấn</h3>
            <p className="text-gray-700">{education}</p>
          </div>
        )}
      </div>
    </div>
  )
}
