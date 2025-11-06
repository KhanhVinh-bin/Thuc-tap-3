"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Users, Target, Award, TrendingUp } from "lucide-react"

const stats = [
  { icon: Users, label: "Học viên", value: "1000+", color: "text-[#7c3aed]" },
  { icon: Target, label: "Khóa học", value: "100+", color: "text-[#06b6d4]" },
  { icon: Award, label: "Giảng viên", value: "4", color: "text-[#10b981]" },
  { icon: TrendingUp, label: "Tỷ lệ hoàn thành", value: "36%", color: "text-[#fbbf24]" },
]

const team = [
  {
    name: "Nguyễn Hải Trường",
    role: "CEO & Founder",
    image: "/haitruong.jpg",
    bio: "Senior Frontend Developer với 800+ năm kinh nghiệm",
  },
  {
    name: "Trần Văn Hoàng",
    role: "CTO",
    image: "/team-2.jpg",
    bio: "Chuyên gia về TRAE AI và Machine Learning",
  },
  {
    name: "Nguyễn Hữu Tài",
    role: "Head of Education",
    image: "/team-4.jpg",
    bio: "15 năm kinh nghiệm trong lĩnh vực C++",
  },
  {
    name: "Trần Công Hoàng Phúc",
    role: "Lead Instructor",
    image: "/team-4.jpg",
    bio: "Full-stack Developer và giảng viên hàng đầu",
  },
]

const values = [
  {
    title: "Chất lượng",
    description: "Cam kết mang đến nội dung học tập chất lượng cao nhất",
    icon: "🎯",
  },
  {
    title: "Đổi mới",
    description: "Luôn cập nhật công nghệ và phương pháp giảng dạy mới nhất",
    icon: "💡",
  },
  {
    title: "Cộng đồng",
    description: "Xây dựng cộng đồng học tập năng động và hỗ trợ lẫn nhau",
    icon: "🤝",
  },
  {
    title: "Tiếp cận",
    description: "Giáo dục chất lượng cao cho mọi người, mọi nơi",
    icon: "🌍",
  },
]

export default function AboutPage() {
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".fade-in-element")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Đóng lightbox khi nhấn phím ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setLightboxImage(null)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg--50">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#6A5BF6] py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Về EduLearn</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Nền tảng học trực tuyến hàng đầu Việt Nam, mang đến giáo dục chất lượng cao và cơ hội phát triển cho mọi
              người.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center fade-in-element" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  <div
                    className={`w-16 h-16 ${stat.color} bg-opacity-10 rounded-full flex items-center justify-center`}
                  >
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white-900 mb-2">{stat.value}</div>
                <div className="text-white-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="fade-in-element">
              <h2 className="text-3xl font-bold text-white-900 mb-6">Sứ mệnh của chúng tôi</h2>
              <p className="text-lg text-white-600 mb-4 leading-relaxed">
                EduLearn được thành lập với sứ mệnh dân chủ hóa giáo dục, mang kiến thức chất lượng cao đến với mọi
                người, mọi nơi. Chúng tôi tin rằng giáo dục là chìa khóa để mở ra cơ hội và thay đổi cuộc sống.
              </p>
              <p className="text-lg text-white-600 leading-relaxed">
                Với đội ngũ giảng viên giàu kinh nghiệm và nền tảng công nghệ hiện đại, chúng tôi cam kết mang đến trải
                nghiệm học tập tốt nhất, giúp học viên đạt được mục tiêu nghề nghiệp và phát triển bản thân.
              </p>
            </div>
            <div className="fade-in-element">
              <img src="/collaborative-teamwork.png" alt="Mission" className="rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white-900 mb-12 text-center">Giá trị cốt lõi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="fade-in-element bg-white-50 p-6 rounded-xl hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-white-900 mb-3">{value.title}</h3>
                <p className="text-white-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white-900 mb-12 text-center">Đội ngũ của chúng tôi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div
                key={index}
                className="fade-in-element bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative h-64 bg-white-200">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 hover:scale-105"
                    onClick={() =>
                      setLightboxImage(member.image || "/professional-portrait.png")
                    }
                    onError={(e) => {
                      e.target.src = "/professional-portrait.png"
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white-900 mb-1">{member.name}</h3>
                  <p className="text-[#7c3aed] font-semibold mb-3">{member.role}</p>
                  <p className="text-white-600 text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Overlay */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Xem ảnh lớn"
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 bg-white/90 text-black px-4 py-2 rounded-lg hover:bg-white"
            onClick={() => setLightboxImage(null)}
          >
            Đóng
          </button>
        </div>
      )}

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bắt đầu hành trình học tập ngay hôm nay</h2>
          <p className="text-white/90 mb-8 text-lg">
            Tham gia cùng hàng nghìn học viên đã thay đổi cuộc sống với EduLearn
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/courses"
              className="px-8 py-3 bg-white text-[#7c3aed] font-semibold rounded-lg hover:bg-white-100 transition-colors"
            >
              Khám phá khóa học
            </a>
            <a
              href="/register"
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#7c3aed] transition-colors"
            >
              Đăng ký ngay
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
