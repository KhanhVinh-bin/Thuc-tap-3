"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCourse } from "../context/CourseContext"
import { createOrUpdateCourseStep } from "../../lib/instructorApi"
import { generateSlug } from "@/lib/slug-helper"
import "./page.css"

export default function ChiTietKhoaHocPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { courseData, updateCourseData } = useCourse()
  const [price, setPrice] = useState(courseData.price || 0)
  const [duration, setDuration] = useState(courseData.duration || "")
  const [level, setLevel] = useState(courseData.level || "")
  const [prerequisites, setPrerequisites] = useState(courseData.prerequisites || "")
  const [learningOutcomes, setLearningOutcomes] = useState(courseData.learningOutcomes || "")
  const [tagName, setTagName] = useState(courseData.tagName || "")
  const [tags, setTags] = useState(courseData.tagIds || [])
  const [attempted, setAttempted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (courseData.price) setPrice(courseData.price)
    if (courseData.duration) setDuration(courseData.duration)
    if (courseData.level) setLevel(courseData.level)
    if (courseData.prerequisites) setPrerequisites(courseData.prerequisites)
    if (courseData.learningOutcomes) setLearningOutcomes(courseData.learningOutcomes)
    if (courseData.tagName) setTagName(courseData.tagName)
  }, [])

  // Validation logic
  const isValid = useMemo(() => {
    return price > 0 && level !== ""
  }, [price, level])

  const addTag = () => {
    if (tagName.trim()) {
      const newTags = [...tags, tagName.trim()]
      setTags(newTags)
      updateCourseData({ tagName: tagName.trim(), tagIds: newTags })
      setTagName("")
    }
  }

  const removeTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index)
    setTags(newTags)
    updateCourseData({ tagIds: newTags })
  }

  const handleContinue = async () => {
    setAttempted(true)
    if (!isValid) return

    if (!token) {
      setError("Vui lòng đăng nhập lại")
      return
    }

    // Kiểm tra token có hợp lệ không (không phải demo token)
    if (typeof token === 'string' && token.startsWith('demo_token_')) {
      setError("Vui lòng đăng nhập qua trang login chính thức để lấy token hợp lệ")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      const coursePayload = {
        courseId: courseData.courseId || 0,
        title: courseData.title || "",
        description: courseData.description || "",
        categoryId: courseData.categoryId || null,
        thumbnailUrl: courseData.thumbnailUrl || "",
        price: price,
        duration: duration.trim(),
        level: level,
        prerequisites: prerequisites.trim(),
        learningOutcomes: learningOutcomes.trim(),
        tagName: tags.length > 0 ? tags[0] : "",
        tagIds: tags,
        slug: courseData.slug || generateSlug(courseData.title || "") || "untitled-course", // ✅ Thêm slug
        lessons: courseData.lessons || [],
        status: "published", // ✅ Tự động publish, không cần duyệt
      }

      const result = await createOrUpdateCourseStep(coursePayload, token)

      updateCourseData({
        price: result.Price || result.price || price,
        duration: result.Duration || result.duration || duration,
        level: result.Level || result.level || level,
        prerequisites: result.Prerequisites || result.prerequisites || prerequisites,
        learningOutcomes: result.LearningOutcomes || result.learningOutcomes || learningOutcomes,
        thumbnailUrl: result.ThumbnailUrl || result.thumbnailUrl || courseData.thumbnailUrl || "", // ✅ Giữ thumbnailUrl từ step trước
        tagName: tags.length > 0 ? tags[0] : "",
        tagIds: tags,
        courseId: result.courseId || courseData.courseId,
      })

      router.push("/giangvien/khoahoc/noidung")
    } catch (err) {
      console.error("Error saving course step 2:", err)
      setError(err.message || "Có lỗi xảy ra khi lưu khóa học")
    } finally {
      setIsSaving(false)
    }
  }

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
              <input 
                className={`gvc-input ${attempted && price <= 0 ? "is-invalid" : ""}`} 
                type="number" 
                value={price} 
                onChange={(e)=>setPrice(Number(e.target.value))} 
                placeholder="0" 
              />
              {attempted && price <= 0 && <div className="gvc-error">Vui lòng nhập giá khóa học</div>}
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
              <select className={`gvc-select ${level === "" ? "placeholder" : ""} ${attempted && level === "" ? "is-invalid" : ""}`} value={level} onChange={(e)=>setLevel(e.target.value)}>
                <option value="">Chọn cấp độ phù hợp</option>
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>
            {attempted && level === "" && <div className="gvc-error">Vui lòng chọn cấp độ khóa học</div>}
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
            <input className="gvc-input" value={tagName} onChange={(e) => setTagName(e.target.value)} onKeyPress={(e) => e.key === "Enter" && addTag()} placeholder="VD: React, JavaScript, Frontend..." />
            <button type="button" className="gvc-btn add" onClick={addTag}>+</button>
          </div>
          {tags.length > 0 && (
            <div style={{display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px"}}>
              {tags.map((tag, idx) => (
                <span key={idx} style={{background: "#e0e7ff", color: "#4338ca", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px"}}>
                  {tag}
                  <button type="button" onClick={() => removeTag(idx)} style={{background: "none", border: "none", color: "#4338ca", cursor: "pointer", fontSize: "16px", padding: 0}}>×</button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Yêu cầu tiên quyết & Kết quả học tập */}
        <div className="gvc-row">
          <section className="gvc-card">
            <div className="gvc-card-header">
              <h1 className="gvc-card-title">Yêu cầu tiên quyết</h1>
            </div>
            <textarea className="gvc-textarea" value={prerequisites} onChange={(e)=>{setPrerequisites(e.target.value); updateCourseData({prerequisites: e.target.value})}} placeholder="VD: Biết HTML/CSS cơ bản, Có kiến thức JavaScript..." rows="3" />
          </section>

          <section className="gvc-card">
            <div className="gvc-card-header">
              <h1 className="gvc-card-title">Kết quả học tập</h1>
            </div>
            <textarea className="gvc-textarea" value={learningOutcomes} onChange={(e)=>{setLearningOutcomes(e.target.value); updateCourseData({learningOutcomes: e.target.value})}} placeholder="VD: Xây dựng ứng dụng React hoàn chỉnh, Hiểu về hooks và state management..." rows="3" />
          </section>
        </div>
      </div>

      {/* Footer */}
      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" onClick={() => router.push("/giangvien/khoahoc/tao")}>Quay lại</button>
          <div className="gvc-step-info">Bước 2 / 4</div>
          {error && (
            <div className="gvc-error" style={{marginBottom: "8px", textAlign: "center", padding: "8px", background: "#fee2e2", borderRadius: "8px"}}>
              {error}
            </div>
          )}
          <button 
            className={`gvc-btn primary ${!isValid || isSaving ? "disabled" : ""}`} 
            onClick={handleContinue}
            disabled={!isValid || isSaving}
          >
            {isSaving ? "Đang lưu..." : "Tiếp tục →"}
          </button>
        </div>
      </div>
    </div>
  )
}