"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Calendar, User, Clock, ArrowRight } from "lucide-react"

const blogPosts = [
  {
    id: 1,
    title: "10 Xu hướng công nghệ sẽ thay đổi ngành giáo dục năm 2025",
    excerpt:
      "Khám phá những công nghệ mới nhất đang định hình lại cách chúng ta học tập và giảng dạy trong kỷ nguyên số.",
    author: "Nguyễn Hải Trường",
    date: "15/01/2025",
    readTime: "5 phút đọc",
    category: "Công nghệ",
    image: "/blog-tech-trends.jpg",
  },
  {
    id: 2,
    title: "Làm thế nào để học lập trình hiệu quả cho người mới bắt đầu",
    excerpt: "Hướng dẫn chi tiết và lộ trình học tập khoa học giúp bạn trở thành lập trình viên chuyên nghiệp.",
    author: "Đặng Quang Thành",
    date: "12/01/2025",
    readTime: "8 phút đọc",
    category: "Lập trình",
    image: "/blog-programming.jpg",
  },
  {
    id: 3,
    title: "React vs Vue: Framework nào phù hợp với dự án của bạn?",
    excerpt: "So sánh chi tiết hai framework phổ biến nhất để giúp bạn đưa ra quyết định đúng đắn.",
    author: "Trần Văn Hoàng",
    date: "10/01/2025",
    readTime: "6 phút đọc",
    category: "Web Development",
    image: "/blog-react-vue.jpg",
  },
  {
    id: 4,
    title: "Bí quyết quản lý thời gian hiệu quả khi học online",
    excerpt: "Những mẹo và chiến lược giúp bạn tối ưu hóa thời gian học tập và đạt kết quả cao nhất.",
    author: "Phạm Ngọc Beast Như",
    date: "08/01/2025",
    readTime: "4 phút đọc",
    category: "Học tập",
    image: "/blog-time-management.jpg",
  },
  {
    id: 5,
    title: "AI và Machine Learning: Cơ hội nghề nghiệp trong tương lai",
    excerpt: "Tìm hiểu về những cơ hội việc làm hấp dẫn trong lĩnh vực trí tuệ nhân tạo.",
    author: "Hoàng Văn E",
    date: "05/01/2025",
    readTime: "7 phút đọc",
    category: "AI & ML",
    image: "/blog-ai-ml.jpg",
  },
  {
    id: 6,
    title: "Xây dựng Portfolio ấn tượng cho Developer",
    excerpt: "Hướng dẫn tạo portfolio chuyên nghiệp để thu hút nhà tuyển dụng và khách hàng.",
    author: "Đỗ Thị F",
    date: "03/01/2025",
    readTime: "5 phút đọc",
    category: "Career",
    image: "/blog-portfolio.jpg",
  },
]

const categories = ["Tất cả", "Công nghệ", "Lập trình", "Web Development", "Học tập", "AI & ML", "Career"]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả")
  const [visiblePosts, setVisiblePosts] = useState([])

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
  }, [selectedCategory])

  const filteredPosts =
    selectedCategory === "Tất cả" ? blogPosts : blogPosts.filter((post) => post.category === selectedCategory)

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

       {/* Hero Section */}
      <section className="bg-[#6A5BF6] py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Blog & Tin tức</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Cập nhật kiến thức mới nhất về công nghệ, lập trình và xu hướng học tập
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white border-b border-white-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  selectedCategory === category
                    ? "bg-[#7c3aed] text-white"
                    : "bg-white-100 text-white-700 hover:bg-white-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article
                key={post.id}
                className="fade-in-element bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Link href={`/blog/${post.id}`}>
                  <div className="relative h-48 bg-white-200 overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover image-zoom"
                      onError={(e) => {
                        e.target.src = "/blog-post-concept.png"
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#7c3aed] text-white text-sm rounded-full">{post.category}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white-900 mb-3 hover:text-[#7c3aed] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-white-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-white-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm text-white-500">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#7c3aed] font-semibold">
                        <span>Đọc thêm</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Đăng ký nhận tin tức mới nhất</h2>
          <p className="text-white/90 mb-8">Nhận thông báo về các bài viết mới và ưu đãi đặc biệt</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-3 bg-white text-[#7c3aed] font-semibold rounded-lg hover:bg-white-100 transition-colors">
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
