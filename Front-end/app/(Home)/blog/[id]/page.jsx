"use client"

import { useParams } from "next/navigation"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark, ThumbsUp, MessageSquare, CornerUpRight } from "lucide-react"

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

const comments = [
  {
    id: 1,
    author: {
      name: "Đặng Quang Thành",
      avatar: "/thanh.jpg",
    },
    date: "2 giờ trước",
    text: "Bài viết rất hay và chi tiết! Cảm ơn tác giả đã chia sẻ những kiến thức bổ ích về các xu hướng công nghệ mới trong giáo dục.",
    likes: 15,
    replies: [
      {
        id: 2,
        author: {
          name: "Nguyễn Văn A", // Tác giả bài viết
          avatar: "/nguyenvana.jpg",
          isAuthor: true,
        },
        date: "1 giờ trước",
        text: "Cảm ơn bạn đã đọc! Rất vui vì bài viết hữu ích cho bạn.",
        likes: 7,
        replies: [],
      },
    ],
  },
  {
    id: 3,
    author: {
      name: "Phạm Ngọc Beast Như",
      avatar: "/nhu.jpg",
    },
    date: "5 giờ trước",
    text: "Mình có một câu hỏi: Liệu việc áp dụng AI có thể thay thế hoàn toàn vai trò của giáo viên trong tương lai không?",
    likes: 3,
    replies: [],
  },
];

export default function BlogDetailPage() {
  const params = useParams()

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/blog" className="flex items-center gap-2 text-white-600 hover:text-[#7c3aed] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại Blog</span>
          </Link>
        </div>
      </div>

      {/* Article Header */}
      <article className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <span className="px-3 py-1 bg-[#7c3aed] text-white text-sm rounded-full">{blogPost.category}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{blogPost.title}</h1>

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
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              <Share2 className="w-5 h-5" />
              <span>Chia sẻ</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
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
            className="prose prose-lg max-w-none prose-h2:text-2xl prose-h2:font-semibold prose-p:text-gray-700 prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
            style={{
              fontSize: "18px",
              lineHeight: "1.8",
              color: "#374151",
            }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {["Công nghệ", "Giáo dục", "AI", "VR", "Blockchain"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Comments Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{comments.length} Bình luận</h2>

          {/* New Comment Form */}
          <div className="flex items-start gap-4 mb-8">
            <img src="/user-avatar.png" alt="Your avatar" className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <textarea
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                rows="3"
                placeholder="Viết bình luận của bạn..."
              ></textarea>
              <button className="mt-2 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                Gửi bình luận
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-8">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Bài viết liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 card-hover border border-gray-100"
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
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#7c3aed] transition-colors">
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

function CommentItem({ comment, isReply = false }) {
  return (
    <div className={`flex items-start gap-4 ${isReply ? 'ml-8 sm:ml-14' : ''}`}>
      <img 
        src={comment.author.avatar || '/user-avatar.png'} 
        alt={comment.author.name} 
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
        onError={(e) => { e.target.src = '/user-avatar.png' }}
      />
      <div className="flex-1">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{comment.author.name}</p>
              {comment.author.isAuthor && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">Tác giả</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{comment.date}</p>
          </div>
          <p className="text-gray-700">{comment.text}</p>
        </div>
        <div className="flex items-center gap-4 mt-2 px-2 text-sm text-gray-600">
          <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
            <ThumbsUp className="w-4 h-4" />
            <span>{comment.likes} Thích</span>
          </button>
          <button className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
            <MessageSquare className="w-4 h-4" />
            <span>Trả lời</span>
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-6 space-y-6">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
