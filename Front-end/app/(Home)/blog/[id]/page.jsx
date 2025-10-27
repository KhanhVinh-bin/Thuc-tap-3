"use client"

import { useParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark } from "lucide-react"

const blogPost = {
  id: 1,
  title: "10 Xu hướng công nghệ sẽ thay đổi ngành giáo dục năm 2025",
  author: "Nguyễn Văn A",
  date: "15/01/2025",
  readTime: "5 phút đọc",
  category: "Công nghệ",
  image: "/blog-tech-trends.jpg",
  content: `
    <p>Ngành giáo dục đang trải qua một cuộc cách mạng công nghệ chưa từng có. Với sự phát triển nhanh chóng của trí tuệ nhân tạo, thực tế ảo và các công nghệ mới, cách chúng ta học tập và giảng dạy đang thay đổi hoàn toàn.</p>

    <h2>1. Trí tuệ nhân tạo (AI) trong giáo dục</h2>
    <p>AI đang trở thành trợ lý đắc lực cho cả giáo viên và học sinh. Từ việc cá nhân hóa trải nghiệm học tập đến tự động chấm bài và đưa ra phản hồi chi tiết, AI đang làm thay đổi cách chúng ta tiếp cận giáo dục.</p>

    <h2>2. Thực tế ảo (VR) và Thực tế tăng cường (AR)</h2>
    <p>VR và AR mang đến trải nghiệm học tập immersive, cho phép học sinh khám phá các khái niệm phức tạp một cách trực quan và sinh động hơn bao giờ hết.</p>

    <h2>3. Học tập cá nhân hóa</h2>
    <p>Công nghệ cho phép tạo ra lộ trình học tập riêng biệt cho từng học sinh, dựa trên khả năng, sở thích và tốc độ học của họ.</p>

    <h2>4. Gamification</h2>
    <p>Việc áp dụng các yếu tố game vào học tập giúp tăng động lực và sự hứng thú của học sinh, biến việc học thành một trải nghiệm thú vị.</p>

    <h2>5. Blockchain trong giáo dục</h2>
    <p>Blockchain đang được sử dụng để xác thực bằng cấp, chứng chỉ và tạo ra hệ thống quản lý hồ sơ học tập an toàn và minh bạch.</p>

    <h2>Kết luận</h2>
    <p>Những xu hướng công nghệ này không chỉ là tương lai mà đang dần trở thành hiện tại của ngành giáo dục. Việc nắm bắt và ứng dụng chúng một cách hiệu quả sẽ quyết định chất lượng giáo dục trong những năm tới.</p>
  `,
}

const relatedPosts = [
  {
    id: 2,
    title: "Làm thế nào để học lập trình hiệu quả",
    image: "/blog-programming.jpg",
  },
  {
    id: 3,
    title: "React vs Vue: Framework nào phù hợp?",
    image: "/blog-react-vue.jpg",
  },
  {
    id: 4,
    title: "Bí quyết quản lý thời gian học online",
    image: "/blog-time-management.jpg",
  },
]

export default function BlogDetailPage() {
  const params = useParams()

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Back Button */}
      <div className="bg-white border-b border-white-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog" className="flex items-center gap-2 text-white-600 hover:text-[#7c3aed] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Blog</span>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="px-3 py-1 bg-[#7c3aed] text-white text-sm rounded-full">{blogPost.category}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white-900 mb-6">{blogPost.title}</h1>

          <div className="flex items-center gap-6 text-white-600 mb-8">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{blogPost.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{blogPost.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{blogPost.readTime}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-white-300 rounded-lg hover:bg-white-50 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Chia sẻ</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-white-300 rounded-lg hover:bg-white-50 transition-colors">
              <Bookmark className="w-5 h-5" />
              <span>Lưu bài viết</span>
            </button>
          </div>

          {/* Featured Image */}
          <div className="relative h-96 rounded-xl overflow-hidden mb-12">
            <img
              src={blogPost.image || "/placeholder.svg"}
              alt={blogPost.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/blog-featured-image.jpg"
              }}
            />
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
            style={{
              fontSize: "18px",
              lineHeight: "1.8",
              color: "#374151",
            }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-white-200">
            <h3 className="text-lg font-semibold mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {["Công nghệ", "Giáo dục", "AI", "VR", "Blockchain"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white-100 text-white-700 rounded-full text-sm hover:bg-white-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white-900 mb-8">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 card-hover"
              >
                <div className="relative h-48 bg-white-200 overflow-hidden">
                  <img
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover image-zoom"
                    onError={(e) => {
                      e.target.src = "/related-blog-post.jpg"
                    }}
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-white-900 group-hover:text-[#7c3aed] transition-colors">
                    {post.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
