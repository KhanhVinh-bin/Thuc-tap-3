"use client"

import { useParams } from "next/navigation"
import { getCourseById } from "../../Data/mockCourses"
import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  CheckCircle,
  Star,
  Users,
  Clock,
  BarChart,
  Award,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Globe,
  Info,
  FileText,
  HelpCircle
} from "lucide-react"
import { useState, useEffect } from "react"

export default function CourseDetailPage() {
  const params = useParams()
  const course = getCourseById(params.id)
  const [activeAccordion, setActiveAccordion] = useState(null)
  const [isSticky, setIsSticky] = useState(false)

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById("hero-section")
      if (heroSection) {
        // Start being sticky after scrolling past the hero section
        setIsSticky(window.scrollY > heroSection.offsetHeight)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

<<<<<<< HEAD
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      const redirectUrl = `/thanhtoan?courseId=${course.id}`
      router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
      return
    }

    try {
      // Add course to cart via API before redirecting to payment
      const cartItem = {
        id: course.id,
        title: course.title,
        instructor: course.instructor.name,
        price: parseFloat(course.price.replace(/[^\d]/g, '')),
        image: course.image
      }
      
      // Add to cart using the cart context which will call the API
      await addToCart(cartItem)
      
      // Redirect to payment page with course ID for immediate purchase
      router.push(`/thanhtoan?courseId=${course.id}&buyNow=true`)
    } catch (error) {
      console.error("Error adding course to cart:", error)
      alert("Có lỗi xảy ra khi thêm khóa học vào giỏ hàng. Vui lòng thử lại!")
    }
  }


  const handleAddToCart = () => {
    if (course) {
      const cartItem = {
        id: course.id,
        title: course.title,
        instructor: course.instructor.name,
        price: parseFloat(course.price.replace(/[^\d]/g, '')), // Convert price string to number
        image: course.image
      }
      addToCart(cartItem)
      
      // Show success message or redirect to cart
      alert("Đã thêm khóa học vào giỏ hàng!")
    }
  }

  // Hiển thị error nếu có lỗi
  if (error) {
=======
  if (!course) {
>>>>>>> 8bb5e83 (Them Frontend_admin)
    return (
      <div>
        <Header />
        <div className="text-center py-20">Không tìm thấy khóa học.</div>
        <Footer />
      </div>
    )
  }

  const totalLessons = course.curriculum.reduce((acc, chapter) => acc + chapter.items.length, 0)

  return (
    <div className="bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section id="hero-section" className="bg-gray-800 text-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">{course.title}</h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-6">{course.description}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    <span className="text-amber-400 font-bold">{course.rating}</span>
                    <Star className="w-5 h-5 text-amber-400 fill-current ml-1" />
                  </div>
                  <span className="text-gray-400">({course.reviews} đánh giá)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">{course.students} học viên</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Info className="w-5 h-5 text-gray-400" />
                  <span>Cập nhật lần cuối 12/2023</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <span>Tiếng Việt</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-10 h-10 rounded-full" />
                <div>
                  <p className="font-semibold">{course.instructor.name}</p>
                  <p className="text-sm text-gray-400">{course.instructor.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Learning Outcomes */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Bạn sẽ học được gì?</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <div className="mb-8" id="course-content">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Nội dung khóa học</h2>
              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span>
                  {course.curriculum.length} chương • {totalLessons} bài học • Thời lượng {course.duration}
                </span>
                <button className="font-semibold text-indigo-600 hover:text-indigo-500">Mở rộng tất cả</button>
              </div>
              <div className="space-y-3">
                {course.curriculum.map((chapter, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <button
                      onClick={() => toggleAccordion(index)}
                      className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        {activeAccordion === index ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                        <span className="font-bold text-base">Chương {index + 1}: {chapter.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-normal text-gray-500">
                        <span className="text-sm font-normal text-gray-500">{chapter.meta.lessons}</span>
                      </div>
                    </button>
                    {activeAccordion === index && (
                      <div className="border-t border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {chapter.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex justify-between items-center p-4 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <BookOpen className="w-5 h-5 text-gray-400" />
                                <span className="text-gray-700">{item.title}</span>
                              </div>
                              <span className="text-sm text-gray-500">{item.time}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

<<<<<<< HEAD
          
=======
            {/* Requirements */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Yêu cầu</h2>
              <ul className="space-y-3">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></div>
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructor Info */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin giảng viên</h2>
              <div className="flex items-start gap-6">
                <img
                  src={course.instructor.avatar}
                  alt={course.instructor.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{course.instructor.name}</h3>
                  <p className="text-indigo-600 font-semibold mb-2">{course.instructor.title}</p>
                  <p className="text-gray-600 mb-4">{course.instructor.fullBio}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold">{course.instructor.rating}</span>
                      <span className="text-gray-500">Đánh giá</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{course.instructor.totalStudents}</span>
                      <span className="text-gray-500">Học viên</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">{course.instructor.totalCourses}</span>
                      <span className="text-gray-500">Khóa học</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
>>>>>>> 8bb5e83 (Them Frontend_admin)

          {/* Right Column (Sticky Card) */}
          <div className="lg:col-span-1">
            <div className={`lg:sticky ${isSticky ? "top-24" : "top-8"}`}>
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="relative">
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <button className="text-white flex items-center gap-2">
                      <PlayCircle className="w-16 h-16 opacity-80 hover:opacity-100 transition" />
                    </button>
                  </div>
                   <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                    -{course.discount}%
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900">{course.price}</span>
                    <span className="text-lg text-gray-500 line-through">{course.oldPrice}</span>
                  </div>

                  <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors mb-4">
                    Thêm vào giỏ hàng
                  </button>
                  <button className="w-full bg-gray-100 text-gray-800 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300">
                    Mua ngay
                  </button>

                  <div className="text-center text-sm text-gray-500 my-4">
                    Đảm bảo hoàn tiền trong 30 ngày
                  </div>

                  <hr className="my-4" />

                  <h3 className="font-bold text-gray-800 mb-3">Khóa học này bao gồm:</h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>Thời lượng {course.duration}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-gray-500" />
                      <span>{totalLessons} bài học</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <BarChart className="w-5 h-5 text-gray-500" />
                      <span>Trình độ Mọi cấp độ</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Award className="w-5 h-5 text-gray-500" />
                      <span>Chứng chỉ hoàn thành</span>
                    </li>
                  </ul>

                  <hr className="my-4" />

                  <div className="flex justify-around">
                    <button className="font-semibold text-gray-700 hover:text-indigo-600 text-sm">Chia sẻ</button>
                    <button className="font-semibold text-gray-700 hover:text-indigo-600 text-sm">Tặng khóa học</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
<<<<<<< HEAD
  
}
=======
}
>>>>>>> 8bb5e83 (Them Frontend_admin)
