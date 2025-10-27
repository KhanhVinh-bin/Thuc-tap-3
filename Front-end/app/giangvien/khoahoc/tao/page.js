"use client"

"use client"

import "../tao/page.css"       // import global CSS từ trang “tạo”
import "./page.css"            // import CSS hiện tại

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"


export default function TaoKhoaHocPage() {
  const router = useRouter()
  const fileRef = useRef(null)
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [category, setCategory] = useState("")
  const [lang, setLang] = useState("vi")
  const [thumbPreview, setThumbPreview] = useState("")

  const handleChooseFile = () => fileRef.current?.click()
  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const url = URL.createObjectURL(f)
    setThumbPreview(url)
  }

  return (
    <div className="gvc-create-root">
      <div className="gvc-steps">
        <div className="gvc-steps-heading">
          <div className="gvc-steps-title">Tạo khóa học mới</div>
          <div className="gvc-steps-desc">Hoàn thành các bước bên dưới để tạo khóa học mới của bạn</div>
        </div>
        <div className="gvc-steps-line">
          <div className="gvc-step active">
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
          <div className="gvc-step">
            <div className="gvc-step-num">4</div>
            <div className="gvc-step-box">
              <div className="gvc-step-title">Xem trước</div>
              <div className="gvc-step-sub">Kiểm tra và hoàn thành</div>
            </div>
          </div>
        </div>
        <div className="gvc-progress" />
      </div>

      <div className="gvc-create-grid">
        <section className="gvc-card">
          <div className="gvc-card-header">
            <h1 className="gvc-card-title">Thông tin cơ bản</h1>
          </div>

          <label className="gvc-field">
            <div className="gvc-label">Tiêu đề khóa học <span className="req">*</span></div>
            <input className="gvc-input" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="VD: Lập trình React cơ bản đến nâng cao" />
            <div className="gvc-hint"><span className="gvc-hint-icon">💡</span><span>Tiêu đề hấp dẫn sẽ thu hút nhiều học viên hơn</span></div>
          </label>

          <label className="gvc-field">
            <div className="gvc-label">Mô tả khóa học <span className="req">*</span></div>
            <textarea className="gvc-textarea" value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="Mô tả ngắn gọn về nội dung và lợi ích của khóa học..." />
            <div className="gvc-hint"><span className="gvc-hint-icon">💡</span><span>Mô tả chi tiết giúp học viên hiểu rõ hơn về khóa học</span></div>
          </label>

          <div className="gvc-row">
            <label className="gvc-field">
              <div className="gvc-label">Danh mục <span className="req">*</span></div>
              <div className="gvc-select-wrap">
                <select className={`gvc-select ${category === "" ? "placeholder" : ""}`} value={category} onChange={(e)=>setCategory(e.target.value)}>
                  <option value="">Chọn danh mục</option>
                  <option value="dev">Lập trình</option>
                  <option value="design">Thiết kế</option>
                  <option value="marketing">Marketing</option>
                </select>
              </div>
            </label>
           
          </div>
        </section>

        {/* Thumbnail card */}
        <section className="gvc-card">
          <div className="gvc-card-header">
            <div className="gvc-card-icon">🖼️</div>
            <div className="gvc-card-title">Ảnh thumbnail</div>
          </div>

          <div className="gvc-dropzone">
            {thumbPreview ? (
              <img src={thumbPreview} alt="thumbnail preview" className="gvc-thumb-preview" />
            ) : (
              <div className="gvc-drop-hint">
                <div className="gvc-drop-icon">📷</div>
                <div className="gvc-drop-title">Chọn ảnh thumbnail</div>
                <div className="gvc-drop-desc">PNG, JPG, GIF ≤ 5MB — Kích thước khuyến nghị 1280×720px</div>
                <button type="button" className="gvc-btn" onClick={handleChooseFile}>Tải ảnh lên</button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} hidden />
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" type="button" onClick={() => router.push('/giangvien/khoahoc')}>Quay lại</button>
          <div className="gvc-step-info">Bước 1 / 4</div>
          <button className="gvc-btn primary" onClick={() => router.push("/giangvien/khoahoc/chitiet")}>Tiếp tục →</button>
        </div>
      </div>
    </div>
  )
}