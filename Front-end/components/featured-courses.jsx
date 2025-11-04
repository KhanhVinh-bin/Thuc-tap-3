"use client"

import { useState, useEffect } from "react"
import CourseCard from "@/components/course-card"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

const API_BASE_URL = "https://localhost:7025/api"

export default function FeaturedCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestCourses = async () => {
      try {
        setLoading(true)
        
        const response = await fetch(`${API_BASE_URL}/Courses`, {
          headers: { "Content-Type": "application/json" },
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        
        // Filter chỉ lấy các khóa học đã published
        const validCourses = Array.isArray(data) ? data.filter(c => {
          if (!c) return false
          const courseId = c.CourseId || c.courseId
          const title = c.Title || c.title
          const status = (c.Status || c.status || "").toLowerCase().trim()
          return courseId && title && status === "published"
        }) : []

        // Format course data
        const formatVND = (value) => (value ? `${value.toLocaleString("vi-VN")}đ` : "Miễn phí")
        
        const formattedCourses = validCourses.map((course) => {
          const thumbnailUrl = course.ThumbnailUrl || course.thumbnailUrl || null
          let imageUrl = "/placeholder-course.jpg"
          
          if (thumbnailUrl && thumbnailUrl.trim() !== "") {
            if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://')) {
              imageUrl = thumbnailUrl
            } else if (thumbnailUrl.includes('/uploads/')) {
              imageUrl = `https://localhost:3001${thumbnailUrl.startsWith('/') ? '' : '/'}${thumbnailUrl}`
            } else {
              imageUrl = thumbnailUrl.startsWith('/') ? thumbnailUrl : `/${thumbnailUrl}`
            }
          }

          const courseId = course.CourseId || course.courseId
          const title = course.Title || course.title || "Khóa học"
          const priceRaw = course.Price || course.price || 0
          const price = typeof priceRaw === 'number' ? priceRaw : parseFloat((priceRaw.toString().replace(/[^\d.]/g, ''))) || 0
          
          return {
            id: courseId,
            courseId: courseId,
            title: title,
            name: title,
            price: price,
            priceFormatted: formatVND(price),
            oldPrice: price ? formatVND(price * 1.5) : "",
            image: imageUrl,
            instructor: course.Instructor?.Expertise || course.Instructor?.expertise || course.instructor?.Expertise || course.instructor?.expertise || "Giảng viên",
            rating: course.Instructor?.RatingAverage || course.Instructor?.ratingAverage || course.instructor?.RatingAverage || course.instructor?.ratingAverage || 4.5,
            students: course.Instructor?.TotalStudents || course.Instructor?.totalStudents || course.instructor?.TotalStudents || course.instructor?.totalStudents || 0,
            duration: course.Duration || course.duration || "20 giờ",
            level: course.Level || course.level || "Cơ bản",
            createdAt: course.CreatedAt || course.createdAt || course.CourseId || 0, // Dùng CourseId làm fallback để sort
          }
        })

        // Sort theo CourseId (lớn nhất = mới nhất) và lấy 6 khóa học đầu tiên
        formattedCourses.sort((a, b) => {
          const aId = a.createdAt || a.id || 0
          const bId = b.createdAt || b.id || 0
          return bId - aId // Descending order (mới nhất trước)
        })

        setCourses(formattedCourses.slice(0, 6))
      } catch (err) {
        console.error("Error fetching featured courses:", err)
        setCourses([])
      } finally {
        setLoading(false)
      }
    }

    fetchLatestCourses()
  }, [])

  return (
    <section className="py-12 md:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Khóa học nổi bật
          </h2>
          <p className="text-gray-600 text-base md:text-lg lg:text-xl max-w-2xl mx-auto">
            Khám phá các khóa học mới nhất và chất lượng nhất
          </p>
        </div>

        <style jsx global>{`
          .featured-courses-swiper {
            padding: 20px 60px 60px 60px;
            position: relative;
          }
          
          .featured-courses-swiper .swiper-wrapper {
            align-items: stretch;
          }
          
          .featured-courses-swiper .swiper-slide {
            height: auto;
            display: flex;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .featured-courses-swiper .swiper-slide:hover {
            transform: translateY(-4px);
          }
          
          /* Navigation Buttons */
          .featured-courses-swiper .swiper-button-next,
          .featured-courses-swiper .swiper-button-prev {
            color: #6B5EDB;
            background: white;
            width: 48px;
            height: 48px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(107, 94, 219, 0.15);
            margin-top: 0;
            top: 50%;
            transform: translateY(-50%);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid rgba(107, 94, 219, 0.1);
          }
          
          .featured-courses-swiper .swiper-button-next {
            right: 0;
          }
          
          .featured-courses-swiper .swiper-button-prev {
            left: 0;
          }
          
          .featured-courses-swiper .swiper-button-next:after,
          .featured-courses-swiper .swiper-button-prev:after {
            font-size: 18px;
            font-weight: 700;
          }
          
          .featured-courses-swiper .swiper-button-next:hover,
          .featured-courses-swiper .swiper-button-prev:hover {
            background: #6B5EDB;
            color: white;
            box-shadow: 0 6px 20px rgba(107, 94, 219, 0.3);
            transform: translateY(-50%) scale(1.05);
            border-color: #6B5EDB;
          }
          
          .featured-courses-swiper .swiper-button-disabled {
            opacity: 0.2;
            pointer-events: none;
          }
          
          /* Pagination Dots */
          .featured-courses-swiper .swiper-pagination {
            bottom: 0;
            position: relative;
            width: 100%;
            margin-top: 24px;
          }
          
          .featured-courses-swiper .swiper-pagination-bullet {
            width: 12px;
            height: 12px;
            background: #E5E7EB;
            opacity: 1;
            transition: all 0.3s ease;
            margin: 0 6px;
          }
          
          .featured-courses-swiper .swiper-pagination-bullet-active {
            background: #6B5EDB;
            width: 32px;
            border-radius: 6px;
          }
          
          /* Responsive Design */
          @media (max-width: 1024px) {
            .featured-courses-swiper {
              padding: 20px 50px 50px 50px;
            }
            
            .featured-courses-swiper .swiper-button-next,
            .featured-courses-swiper .swiper-button-prev {
              width: 44px;
              height: 44px;
            }
            
            .featured-courses-swiper .swiper-button-next:after,
            .featured-courses-swiper .swiper-button-prev:after {
              font-size: 16px;
            }
          }
          
          @media (max-width: 768px) {
            .featured-courses-swiper {
              padding: 16px 40px 40px 40px;
            }
            
            .featured-courses-swiper .swiper-button-next,
            .featured-courses-swiper .swiper-button-prev {
              width: 40px;
              height: 40px;
            }
            
            .featured-courses-swiper .swiper-button-next:after,
            .featured-courses-swiper .swiper-button-prev:after {
              font-size: 14px;
            }
            
            .featured-courses-swiper .swiper-button-next {
              right: -10px;
            }
            
            .featured-courses-swiper .swiper-button-prev {
              left: -10px;
            }
          }
          
          @media (max-width: 640px) {
            .featured-courses-swiper {
              padding: 12px 32px 36px 32px;
            }
            
            .featured-courses-swiper .swiper-button-next,
            .featured-courses-swiper .swiper-button-prev {
              width: 36px;
              height: 36px;
            }
            
            .featured-courses-swiper .swiper-pagination-bullet {
              width: 10px;
              height: 10px;
              margin: 0 4px;
            }
            
            .featured-courses-swiper .swiper-pagination-bullet-active {
              width: 24px;
            }
          }
        `}</style>

        {loading ? (
          <div className="flex items-center justify-center py-16 md:py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="relative">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              slidesPerView={1}
              spaceBetween={24}
              navigation={true}
              pagination={{
                clickable: true,
                type: 'bullets',
              }}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                },
                1280: {
                  slidesPerView: 3,
                  spaceBetween: 32,
                },
              }}
              loop={courses.length > 3}
              className="featured-courses-swiper"
            >
              {courses.map((course) => (
                <SwiperSlide key={course.id}>
                  <div className="h-full w-full flex justify-center">
                    <CourseCard course={course} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="text-center py-16 md:py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">Chưa có khóa học nào</p>
          </div>
        )}
      </div>
    </section>
  )
}
