"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Mail, Phone, MapPin, Send } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    }, 3000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-white-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-[#6A5BF6] py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin để được tư vấn
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-[#7c3aed]/10 rounded-lg flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-[#7c3aed]" />
                </div>
                <h3 className="text-lg font-semibold text-white-900 mb-2">Email</h3>
                <p className="text-white-600">Scambankhoahoc@gmail.com</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-[#06b6d4]/10 rounded-lg flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-[#06b6d4]" />
                </div>
                <h3 className="text-lg font-semibold text-white-900 mb-2">Điện thoại</h3>
                <p className="text-white-600">+84343822367</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-[#10b981]/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-[#10b981]" />
                </div>
                <h3 className="text-lg font-semibold text-white-900 mb-2">Địa chỉ</h3>
                <p className="text-white-600">19đ D. số 7, Khu dân cư Trung Sơn, Bình Chánh, Hồ Chí Minh, Việt Nam</p>
              </div>

              {/* Map */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-white-900 mb-4">Bản đồ</h3>
                <div className="relative h-64 bg-white-200 rounded-lg overflow-hidden">
                  <img src="/map-location.png" alt="Map" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-xl shadow-sm">
                <h2 className="text-2xl font-bold text-white-900 mb-6">Gửi tin nhắn cho chúng tôi</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg zoom-in">
                    <p className="text-green-800 font-semibold">Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-white-700 mb-2">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-white-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-white-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-white-700 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-white-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                        placeholder="0123456789"
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-white-700 mb-2">
                        Chủ đề *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-white-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent"
                        placeholder="Tư vấn khóa học"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-white-700 mb-2">
                      Nội dung *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-white-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-transparent resize-none"
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white font-semibold rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Gửi tin nhắn</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white-900 mb-8 text-center">Câu hỏi thường gặp</h2>
          <div className="space-y-4">
            {[
              {
                q: "Làm thế nào để đăng ký khóa học?",
                a: "Bạn có thể đăng ký khóa học bằng cách tạo tài khoản, chọn khóa học mong muốn và thanh toán trực tuyến.",
              },
              {
                q: "Tôi có thể học mọi lúc mọi nơi không?",
                a: "Có, tất cả khóa học đều có thể truy cập 24/7 trên mọi thiết bị có kết nối internet.",
              },
              {
                q: "Có chứng chỉ sau khi hoàn thành khóa học không?",
                a: "Có, bạn sẽ nhận được chứng chỉ hoàn thành sau khi hoàn thành tất cả bài học và bài kiểm tra.",
              },
              {
                q: "Chính sách hoàn tiền như thế nào?",
                a: "Chúng tôi có chính sách hoàn tiền trong vòng 7 ngày nếu bạn không hài lòng với khóa học.",
              },
            ].map((faq, index) => (
              <details key={index} className="bg-white-50 rounded-lg p-6 group">
                <summary className="font-semibold text-white-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <span className="text-[#7c3aed] group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="mt-4 text-white-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
