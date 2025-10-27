"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import "./page.css"

export default function ChiTietKhoaHocPage() {
  const router = useRouter()
  const [price, setPrice] = useState(0)
  const [duration, setDuration] = useState("")
  const [level, setLevel] = useState("")

  return (
    <div className="gvc-create-root">
      {/* Header steps: active step 2 */}
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
          <div className="gvc-step active">
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
          <div className="gvc-step">
            <div className="gvc-step-num">4</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Xem trước</div>
              <div className="gvc-step-sub">Kiểm tra và hoàn thành</div>
            </div>
          </div>
        </div>
        <div className="gvc-progress is-step2" />
      </div>

      {/* Body */}
      <div className="gvc-create-grid">
        {/* Giá & Thông tin */}
        <section className="gvc-card">
          <div className="gvc-card-header">
            <h1 className="gvc-card-title">Giá & Thông tin</h1>
          </div>

          <div className="gvc-row">
            <label className="gvc-field">
              <div className="gvc-label">Giá khóa học (VND) <span className="req">*</span></div>
              <input className="gvc-input" type="number" value={price} onChange={(e)=>setPrice(Number(e.target.value))} placeholder="0" />
              <div className="gvc-hint">💡 Giá đề xuất: 500.000đ - 2.000.000đ</div>
            </label>
            <label className="gvc-field">
              <div className="gvc-label">Thời lượng</div>
              <input className="gvc-input" value={duration} onChange={(e)=>setDuration(e.target.value)} placeholder="VD: 15 giờ" />
              <div className="gvc-hint">⏱️ Thời gian học của khóa học</div>
            </label>
          </div>

          <label className="gvc-field">
            <div className="gvc-label">Cấp độ <span className="req">*</span></div>
            <div className="gvc-select-wrap">
              <select className={`gvc-select ${level === "" ? "placeholder" : ""}`} value={level} onChange={(e)=>setLevel(e.target.value)}>
                <option value="">Chọn cấp độ phù hợp</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
          </label>
        </section>

        {/* Thẻ từ khóa */}
        <section className="gvc-card">
          <div className="gvc-card-header">
            <h1 className="gvc-card-title">Thẻ từ khóa</h1>
          </div>

          <label className="gvc-field">
            <input className="gvc-input placeholder" placeholder="Chưa có thẻ nào. Thêm thẻ để học viên dễ tìm thấy khóa học" disabled />
          </label>

          <div className="gvc-row two">
            <input className="gvc-input" placeholder="VD: React, JavaScript, Frontend..." />
            <button type="button" className="gvc-btn add">+</button>
          </div>
        </section>

        {/* Yêu cầu tiên quyết & Kết quả học tập */}
        <div className="gvc-row">
          <section className="gvc-card">
            <div className="gvc-card-header">
              <h1 className="gvc-card-title">Yêu cầu tiên quyết</h1>
            </div>
            <div className="gvc-hint" style={{textAlign:"center"}}>Chưa có yêu cầu nào</div>
            <div className="gvc-row two">
              <input className="gvc-input" placeholder="VD: Biết HTML/CSS cơ bản" />
              <button type="button" className="gvc-btn add">+</button>
            </div>
          </section>

          <section className="gvc-card">
            <div className="gvc-card-header">
              <h1 className="gvc-card-title">Kết quả học tập</h1>
            </div>
            <div className="gvc-hint" style={{textAlign:"center"}}>Chưa có kết quả nào</div>
            <div className="gvc-row two">
              <input className="gvc-input" placeholder="VD: Xây dựng ứng dụng React hoàn chỉnh" />
              <button type="button" className="gvc-btn add">+</button>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" onClick={() => router.push("/giangvien/khoahoc/tao")}>Quay lại</button>
          <div className="gvc-step-info">Bước 2 / 4</div>
          <button className="gvc-btn primary" onClick={() => router.push("/giangvien/khoahoc/noidung")}>Tiếp tục →</button>
        </div>
      </div>
    </div>
  )
}