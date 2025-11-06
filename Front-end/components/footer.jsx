import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#000033] text-white">
      <div className="w-full px-8 sm:px-10 lg:px-16 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold">EduLearn</span>
            </div>
            <p className="text-white-300 mb-4 leading-relaxed">
              Nền tảng học trực tuyến hàng đầu Việt Nam, mang đến giáo dục chất lượng cao và cơ hội phát triển cho mọi
              người.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/courses" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Khóa học
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Blog & Tin tức
                </Link>
              </li>
              <li>  
                <Link href="/contact" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/account" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Điều khoản dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Chính sách hoàn tiền
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-white-300 hover:text-[#06b6d4] transition-colors">
                  Hỗ trợ kỹ thuật
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Thông tin liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#06b6d4] flex-shrink-0 mt-1" />
                <span className="text-white-300">
                  194 Đ. số 7, Khu dân cư Trung Sơn, Bình Chánh, Hồ Chí Minh, Việt Nam
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#06b6d4]" />
                <span className="text-white-300">+84343822367</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#06b6d4]" />
                <span className="text-white-300">Scambankhoahoc@gmail.com</span>
              </li>
            </ul>

            <div className="mt-6">
              <h4 className="font-semibold mb-3">Đăng ký nhận tin tức</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn..."
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06b6d4] text-white placeholder-white-400"
                />
                <button className="px-4 py-2 bg-[#06b6d4] text-white rounded-lg font-semibold hover:bg-[#0891b2] transition-colors">
                  Gửi
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white-400">© 2025 EduLearn</p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-white-400 hover:text-white transition-colors">
              Điều khoản
            </Link>
            <Link href="/privacy" className="text-white-400 hover:text-white transition-colors">
              Bảo mật
            </Link>
            <Link href="/refund" className="text-white-400 hover:text-white transition-colors">
              Hoàn tiền
            </Link>
            <span className="text-white-400">Made with ❤️ in Vietnam</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
