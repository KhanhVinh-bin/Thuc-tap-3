'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import './page.css'
import Header from '@/components/header'
import Footer from '@/components/footer'
const faqs = [
  {
    question: 'Làm thế nào để tạo khóa học mới?',
    answer: 'Để tạo khóa học mới, bạn cần đăng nhập vào tài khoản giảng viên, sau đó chọn "Tạo khóa học mới" trong dashboard. Điền đầy đủ thông tin về khóa học, tải lên video bài giảng và thiết lập giá cả.'
  },
  {
    question: 'Làm thế nào để rút tiền?',
    answer: 'Bạn có thể rút tiền thông qua mục "Quản lý thu nhập" trong dashboard. Chúng tôi hỗ trợ rút tiền qua ngân hàng hoặc ví điện tử. Thời gian xử lý từ 1-3 ngày làm việc.'
  },
  {
    question: 'Tôi có thể thêm bao nhiêu bài học vào một khóa học?',
    answer: 'Không có giới hạn về số lượng bài học trong một khóa học. Tuy nhiên, chúng tôi khuyến nghị cấu trúc khóa học rõ ràng với 10-50 bài học để đảm bảo chất lượng học tập tốt nhất.'
  },
  {
    question: 'Làm thế nào để tương tác với học viên?',
    answer: 'Bạn có thể tương tác với học viên thông qua hệ thống Q&A trong từng bài học, diễn đàn thảo luận của khóa học, và tin nhắn trực tiếp. Việc phản hồi nhanh chóng sẽ giúp tăng đánh giá khóa học.'
  },
  {
    question: 'Tỷ lệ chia sẻ doanh thu là bao nhiêu?',
    answer: 'Giảng viên nhận 70% doanh thu từ khóa học, nền tảng giữ lại 30% để duy trì và phát triển hệ thống. Đây là tỷ lệ cạnh tranh trong ngành giáo dục trực tuyến.'
  },
  {
    question: 'Làm thế nào để tăng lượt đăng ký khóa học?',
    answer: 'Để tăng lượt đăng ký, hãy tối ưu tiêu đề và mô tả khóa học, tạo video giới thiệu hấp dẫn, thiết lập giá cả hợp lý, và tích cực tương tác với học viên để nhận được đánh giá tích cực.'
  }
]

export default function HotroPage() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <>
      <Header />
      <div className="gv-dashboard">
        <aside className="gv-sidebar">
          <nav className="gv-nav">
            <ul>
              <li><Link href="/giangvien/tongquan">📊 Tổng quan</Link></li>
              <li><Link href="/giangvien/khoahoc">📚 Khóa học</Link></li>
              <li><Link href="/giangvien/hocvien">👥 Học viên</Link></li>
              <li><Link href="/giangvien/doanhthu">💰 Doanh thu</Link></li>
              <li><Link href="/giangvien/hoso">🗂️ Hồ sơ</Link></li>
              <li><Link href="/giangvien/caidat">⚙️ Cài đặt</Link></li>
              <li><Link href="/giangvien/hotro" className="active">🆘 Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>
        
        <main className="gv-main">
          <div className="hotro-container">
            <h1 className="hotro-title">Trung tâm hỗ trợ</h1>

      <section className="faq-card">
        <h2>Câu hỏi thường gặp</h2>
        <div className="accordion">
          {faqs.map((faq, i) => (
            <div key={i} className={`accordion-item ${openIndex === i ? 'open' : ''}`}>
              <button
                className="accordion-toggle"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}
              >
                <span>{faq.question}</span>
                <span className="chev">{openIndex === i ? '▴' : '▾'}</span>
              </button>
              <div className="accordion-panel">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="contact-card">
        <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert('Gửi tin nhắn (demo)') }}>
          <div className="row">
            <div className="field">
              <label>Họ và tên*</label>
              <input type="text" placeholder="Nhập họ và tên" required />
            </div>
            <div className="field">
              <label>Email*</label>
              <input type="email" placeholder="Nhập địa chỉ email của bạn" required />
            </div>
          </div>

          <div className="field">
            <label>Tiêu đề*</label>
            <input type="text" placeholder="Nhập tiêu đề tin nhắn..." required />
          </div>

          <div className="field">
            <label>Nội dung*</label>
            <textarea placeholder="Mô tả chi tiết câu hỏi hoặc vấn đề của bạn..." rows={6} required />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">✈ Gửi tin nhắn</button>
          </div>
        </form>
      </section>
          </div>
        </main>
      </div>
      <Footer />
    </>
  )
}
