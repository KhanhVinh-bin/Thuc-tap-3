"use client"

import { useRouter } from "next/navigation"
import "./page.css"

export default function XemTruocKhoaHocPage(){
  const router = useRouter()

  return (
    <div className="gvc-create-root">
      {/* Header steps: active step 4 */}
      <div className="gvc-steps">
        <div className="gvc-steps-heading">
          <div className="gvc-steps-title">Tạo khóa học mới</div>
          <div className="gvc-steps-desc">Hoàn thành các bước bên dưới để tạo khóa học mới của bạn</div>
        </div>
        <div className="gvc-steps-line">
          <div className="gvc-step">
            <div className="gvc-step-num">1</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Thông tin cơ bản</div>
              <div className="gvc-step-sub">Tiêu đề, mô tả & danh mục</div>
            </div>
          </div>
          <div className="gvc-step">
            <div className="gvc-step-num">2</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Chi tiết khóa học</div>
              <div className="gvc-step-sub">Giá, thời lượng và yêu cầu</div>
            </div>
          </div>
          <div className="gvc-step">
            <div className="gvc-step-num">3</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Nội dung chương</div>
              <div className="gvc-step-sub">Thêm chương và bài học</div>
            </div>
          </div>
          <div className="gvc-step active">
            <div className="gvc-step-num">4</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Xem trước</div>
              <div className="gvc-step-sub">Kiểm tra và hoàn thành</div>
            </div>
          </div>
        </div>
        <div className="gvc-progress is-step4" />
      </div>

      {/* Body */}
      <div className="gvc-create-grid">
        <section className="gvc-card">
          {/* Heading centered + logo */}
          <div className="gvc-preview-header">
            <div className="gvc-preview-heading">
              
              <div className="gvc-preview-title">Xem trước khóa học</div>
            </div>
            <div className="gvc-preview-desc">Kiểm tra lại thông tin trước khi xuất bản khóa học</div>
          </div>

          {/* Thẻ preview chính */}
          <div className="gvc-preview-main">
            <div className="gvc-thumb-large" aria-label="Thumbnail">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#6b7280">
                <rect x="4" y="5" width="16" height="14" rx="2" strokeWidth="2" />
                <circle cx="9.5" cy="10" r="2.2" strokeWidth="2" />
                <path d="M6 16l4-4 3 3 4-4 3 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="gvc-thumb-label">Chưa có ảnh</div>
            </div>
            <div className="gvc-preview-info">
              <div className="gvc-course-title">d</div>
              <div className="gvc-course-desc">d</div>
              <div className="gvc-pillbar">
                <span className="gvc-pill gray">
                  {/* Icon sách mở (design) */}
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#3b82f6">
                    <path d="M12 7c-3-1.3-6-.8-8 .6v8.8c2-1 4-1.2 8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7c3-1.3 6-.8 8 .6v8.8c-2-1-4-1.2-8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 7v10" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span>design</span>
                </span>
                <span className="gvc-pill purple">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff">
                    <circle cx="12" cy="8" r="3" />
                    <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>intermediate</span>
                </span>
                <span className="gvc-pill green">
                  
                  <span>$ 12đ</span>
                </span>
              </div>
            </div>
          </div>

          {/* Hàng thẻ nhỏ */}
          <div className="gvc-mini-cards">
            <div className="gvc-mini">
              <div className="gvc-mini-title">
                <span className="gvc-mini-icon tag" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                    <circle cx="5.5" cy="6" r="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                    <path d="M5 8a2 2 0 012-2h6l5 5-6 6-5-5V8z" fill="#f59e0b" />
                    <circle cx="9" cy="10" r="1.4" fill="#fff" stroke="#d1d5db" strokeWidth="1" />
                  </svg>
                </span>
                Thẻ từ khóa
              </div>
              <div className="gvc-mini-empty">Chưa có thẻ</div>
            </div>
            <div className="gvc-mini">
              <div className="gvc-mini-title">
                <span className="gvc-mini-icon content" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="none">
                    <rect x="6" y="6" width="9" height="9" rx="2" fill="#3b82f6" opacity="0.9" />
                    <rect x="3" y="8" width="9" height="9" rx="2" fill="#22c55e" opacity="0.85" />
                    <rect x="9" y="3" width="9" height="9" rx="2" fill="#ef4444" opacity="0.85" />
                  </svg>
                </span>
                Nội dung
              </div>
              <div className="gvc-mini-list">
                <div className="gvc-mini-item">
                  <span className="gvc-num-badge blue">1</span>
                  <div className="gvc-mini-text">
                    <div className="gvc-mini-label">Chương</div>
                    <div className="gvc-mini-sub">Tổng số chương</div>
                  </div>
                </div>
                <div className="gvc-mini-item">
                  <span className="gvc-num-badge purple">1</span>
                  <div className="gvc-mini-text">
                    <div className="gvc-mini-label">Bài học</div>
                    <div className="gvc-mini-sub">Tổng số bài</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="gvc-mini">
              <div className="gvc-mini-title">
                <span className="gvc-mini-icon info" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#9ca3af">
                    <circle cx="12" cy="12" r="3" fill="#f8fafc" stroke="#9ca3af" />
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.5 5.5l2.1 2.1M16.4 16.4l2.1 2.1M16.4 7.6l2.1-2.1M5.5 18.5l2.1-2.1" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                Thông tin
              </div>
              <div className="gvc-mini-list">
                <div className="gvc-mini-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b">
                    <path d="M4 4h16v6H4z" strokeWidth="2" />
                    <path d="M4 14h16v6H4z" strokeWidth="2" />
                  </svg>
                  Ngôn ngữ: Tiếng Việt  </div>
                <div className="gvc-mini-item">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#64748b">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    <path d="M12 7v5l4 2" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Thời lượng: 12
                </div>
              </div>
            </div>
          </div>

          {/* Cấu trúc khóa học */}
          <div className="gvc-structure">
            <div className="gvc-structure-title">
              <span className="gvc-struct-icon" aria-hidden="true">
                {/* Icon sách trong ô tím */}
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#ffffff">
                  <path d="M12 7c-3-1.3-6-.8-8 .6v8.8c2-1 4-1.2 8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7c3-1.3 6-.8 8 .6v8.8c-2-1-4-1.2-8 .2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 7v10" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              Cấu trúc khóa học
            </div>
            <div className="gvc-struct-card">
              <div className="gvc-struct-head">
                <div className="gvc-struct-num">1</div>
                <div className="gvc-struct-main">
                  <div className="gvc-struct-title">Chương 1</div>
                  <div className="gvc-struct-desc">Không có mô tả</div>
                </div>
              </div>
              <div className="gvc-lesson-chip">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#374151">
                  <rect x="4" y="5" width="16" height="12" rx="2" />
                  <path d="M8 9h8M9 12h6" />
                </svg>
                <span style={{marginLeft:6}}>Bài học mới</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" onClick={() => router.push("/giangvien/khoahoc/noidung")}>Quay lại</button>
          <div className="gvc-step-info">Bước 4 / 4</div>
          <button className="gvc-btn primary" onClick={() => router.push("/giangvien/khoahoc?created=1")}>Tạo khóa học</button>
        </div>
      </div>
    </div>
  )
}