import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#7c3aed] via-[#6d28d9] to-[#5b21b6] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-5xl font-bold mb-6">Bắt đầu hành trình học tập ngay hôm nay</h2>
        <p className="text-xl text-purple-100 mb-8">Tham gia ngay để chúng tôi còn hút máu bạn</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="px-8 py-4 bg-[#fbbf24] text-white-900 rounded-lg font-bold text-lg hover:bg-[#f59e0b] transition-all hover:scale-105 hover:shadow-xl"
          >
            Đăng ký ngay
          </Link>
          <Link
            href="/courses"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-bold text-lg hover:bg-white/20 transition-all"
          >
            Học thử miễn phí
          </Link>
        </div>
      </div>
    </section>
  )
}
