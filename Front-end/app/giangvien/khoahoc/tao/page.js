"use client"

import "../tao/page.css"       // import global CSS từ trang "tạo"
import "./page.css"            // import CSS hiện tại

import { useState, useRef, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useCourse } from "../context/CourseContext"
import { createOrUpdateCourseStep, uploadCourseThumbnail } from "../../lib/instructorApi"
import { generateSlug } from "@/lib/slug-helper"


export default function TaoKhoaHocPage() {
  const router = useRouter()
  const { token } = useAuth()
  const { courseData, updateCourseData } = useCourse()
  const fileRef = useRef(null)
  const [title, setTitle] = useState(courseData.title || "")
  const [desc, setDesc] = useState(courseData.description || "")
  const [category, setCategory] = useState(courseData.categoryId?.toString() || "")
  const [thumbPreview, setThumbPreview] = useState(courseData.thumbnailUrl || "")
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [thumbError, setThumbError] = useState(false) // ✅ Thêm state để handle error image
  const [attempted, setAttempted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [categories, setCategories] = useState([]) // ✅ State để lưu danh mục từ API
  const [loadingCategories, setLoadingCategories] = useState(true)

  
  const generateSlug = (title) => {
  if (!title) return ""
  return title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
}

  // Generate slug from title
 const slug = useMemo(() => generateSlug(title), [title])
  const previewUrl = useMemo(() => {
    if (!slug) return ""
    const base = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    return `${base}/courses/${slug}`
  }, [slug])

  // ✅ Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true)
        const API_BASE_URL = "https://localhost:7025/api"
        const response = await fetch(`${API_BASE_URL}/Categories`, {
          headers: { "Content-Type": "application/json" },
        })
        
        if (response.ok) {
          const categoriesData = await response.json()
          console.log("📦 Raw categories data from API:", categoriesData)
          
          if (Array.isArray(categoriesData)) {
            // ✅ Normalize dữ liệu để đảm bảo format nhất quán
            const normalizedCategories = categoriesData.map(cat => ({
              categoryId: cat.categoryId || cat.CategoryId || cat.categoryID || cat.CategoryID,
              categoryName: cat.categoryName || cat.CategoryName,
              parentId: cat.parentId === undefined || cat.parentId === null 
                ? (cat.ParentId === undefined || cat.ParentId === null 
                  ? (cat.parentID === undefined || cat.parentID === null ? cat.ParentID : cat.parentID)
                  : cat.ParentId)
                : cat.parentId
            }))
            
            console.log("✅ Normalized categories:", normalizedCategories)
            setCategories(normalizedCategories)
          }
        } else {
          console.warn("⚠️ Could not fetch categories from API, status:", response.status)
          // Fallback: sử dụng danh mục mặc định theo đúng cấu trúc
          setCategories([
            { categoryId: 1, categoryName: "Lập trình", parentId: null },
            { categoryId: 2, categoryName: "Data Science", parentId: null },
            { categoryId: 3, categoryName: "Thiết kế", parentId: null },
            { categoryId: 4, categoryName: "Kinh doanh", parentId: null },
            { categoryId: 5, categoryName: "Công nghệ thông tin", parentId: null },
            { categoryId: 6, categoryName: "Kinh doanh", parentId: null },
            { categoryId: 8, categoryName: "Marketing", parentId: null },
            { categoryId: 9, categoryName: "Ngôn ngữ", parentId: null },
            { categoryId: 10, categoryName: "Lập trình Web", parentId: 1 },
            { categoryId: 11, categoryName: "Lập trình Mobile", parentId: 1 },
            { categoryId: 14, categoryName: "Kế toán", parentId: 2 },
            { categoryId: 15, categoryName: "Photoshop", parentId: 3 },
            { categoryId: 16, categoryName: "UI/UX Design", parentId: 3 },
            { categoryId: 17, categoryName: "Digital Marketing", parentId: 4 },
            { categoryId: 18, categoryName: "SEO", parentId: 4 },
            { categoryId: 19, categoryName: "Tiếng Anh", parentId: 5 },
          ])
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        // Fallback: sử dụng danh mục mặc định theo đúng cấu trúc
        setCategories([
          { categoryId: 1, categoryName: "Lập trình", parentId: null },
          { categoryId: 2, categoryName: "Data Science", parentId: null },
          { categoryId: 3, categoryName: "Thiết kế", parentId: null },
          { categoryId: 4, categoryName: "Kinh doanh", parentId: null },
          { categoryId: 5, categoryName: "Công nghệ thông tin", parentId: null },
          { categoryId: 6, categoryName: "Kinh doanh", parentId: null },
          { categoryId: 8, categoryName: "Marketing", parentId: null },
          { categoryId: 9, categoryName: "Ngôn ngữ", parentId: null },
          { categoryId: 10, categoryName: "Lập trình Web", parentId: 1 },
          { categoryId: 11, categoryName: "Lập trình Mobile", parentId: 1 },
          { categoryId: 14, categoryName: "Kế toán", parentId: 2 },
          { categoryId: 15, categoryName: "Photoshop", parentId: 3 },
          { categoryId: 16, categoryName: "UI/UX Design", parentId: 3 },
          { categoryId: 17, categoryName: "Digital Marketing", parentId: 4 },
          { categoryId: 18, categoryName: "SEO", parentId: 4 },
          { categoryId: 19, categoryName: "Tiếng Anh", parentId: 5 },
        ])
      } finally {
        setLoadingCategories(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Load existing data
  useEffect(() => {
    if (courseData.title) setTitle(courseData.title)
    if (courseData.description) setDesc(courseData.description)
    if (courseData.categoryId) setCategory(courseData.categoryId.toString())
    // Chỉ load thumbnail nếu là URL hợp lệ (từ server), không load từ Blob URL cũ
    if (courseData.thumbnailUrl && (
      courseData.thumbnailUrl.startsWith('http://') || 
      courseData.thumbnailUrl.startsWith('https://') ||
      courseData.thumbnailUrl.startsWith('/')
    )) {
      setThumbPreview(courseData.thumbnailUrl)
    }
  }, [])

  const isValidBasic = useMemo(() => {
    return title.trim() !== "" && desc.trim() !== "" && category !== ""
  }, [title, desc, category])

  const handleChooseFile = () => fileRef.current?.click()
  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    
    // ✅ Reset error state
    setThumbError(false)
    
    // ✅ Revoke old URL nếu có (blob URL)
    if (thumbPreview && thumbPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbPreview)
    }
    
    // Accept any file extension for images
    const url = URL.createObjectURL(f)
    setThumbPreview(url)
    setThumbnailFile(f)
    
    // For now, we'll use the file name as URL (in real app, upload to server first)
    updateCourseData({ thumbnailUrl: f.name })
  }
  
  // ✅ Cleanup blob URLs khi component unmount
  useEffect(() => {
    return () => {
      if (thumbPreview && thumbPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbPreview)
      }
    }
  }, [thumbPreview])

  const handleContinue = async () => {
    if (!isValidBasic) {
      setAttempted(true)
      return
    }

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
      let thumbnailUrl = courseData.thumbnailUrl || ""
      let currentCourseId = courseData.courseId || 0

      // ✅ Upload thumbnail nếu có file mới
      if (thumbnailFile && thumbnailFile instanceof File) {
        // Nếu chưa có courseId, tạo course trước để lấy courseId
        if (currentCourseId === 0) {
          const tempPayload = {
            courseId: 0,
            title: title.trim(),
            description: desc.trim(),
            categoryId: parseInt(category) || null,
            thumbnailUrl: "",
            price: courseData.price || 0,
            duration: courseData.duration || "",
            level: courseData.level || "",
            prerequisites: courseData.prerequisites || "",
            learningOutcomes: courseData.learningOutcomes || "",
            tagName: courseData.tagName || "",
            tagIds: null, // ✅ Backend chỉ dùng TagName, không dùng TagIds. Gửi null để tránh lỗi validation
            slug: slug || generateSlug(title.trim()) || "untitled-course",
            lessons: courseData.lessons || [],
            status: "published",
          }
          const tempResult = await createOrUpdateCourseStep(tempPayload, token)
          currentCourseId = tempResult.CourseId || tempResult.courseId
          console.log("✅ Course created with ID:", currentCourseId)
        }

        // Upload thumbnail với courseId
        try {
        const uploadResult = await uploadCourseThumbnail(currentCourseId, thumbnailFile, token)
        thumbnailUrl = uploadResult.thumbnailUrl
        console.log("✅ Thumbnail uploaded:", thumbnailUrl)
        } catch (uploadError) {
          console.warn("⚠️ Could not upload thumbnail:", uploadError)
          // Tiếp tục với thumbnailUrl rỗng nếu upload thất bại
        }
      }

      // Prepare course data for API
      const coursePayload = {
        courseId: currentCourseId || courseData.courseId || 0,
        title: title.trim(),
        description: desc.trim(),
        categoryId: parseInt(category) || null,
        thumbnailUrl: thumbnailUrl, // ✅ URL từ server sau khi upload
        price: courseData.price || 0,
        duration: courseData.duration || "",
        level: courseData.level || "",
        prerequisites: courseData.prerequisites || "",
        learningOutcomes: courseData.learningOutcomes || "",
        tagName: courseData.tagName || "",
        tagIds: null, // ✅ Backend chỉ dùng TagName, không dùng TagIds. Gửi null để tránh lỗi validation
        slug: slug || generateSlug(title.trim()) || "untitled-course", // ✅ Thêm slug (bắt buộc)
        lessons: courseData.lessons || [],
        status: "published", // ✅ Tự động publish, không cần duyệt
      }

      // Call API to save step 1
      const result = await createOrUpdateCourseStep(coursePayload, token)

      // Update courseData with response
      // ✅ Lấy thumbnailUrl từ nhiều nguồn: upload result, API response (cả PascalCase và camelCase)
      const finalThumbnailUrl = thumbnailUrl || 
                                result.ThumbnailUrl || 
                                result.thumbnailUrl || 
                                courseData.thumbnailUrl || 
                                ""
      
      updateCourseData({
        title: result.Title || result.title || title,
        description: result.Description || result.description || desc,
        categoryId: result.CategoryId || result.categoryId || parseInt(category),
        thumbnailUrl: finalThumbnailUrl, // ✅ Lưu URL từ upload hoặc từ server
        slug: slug || generateSlug(title.trim()) || "", // ✅ Lưu slug vào context
        courseId: result.CourseId || result.courseId || currentCourseId, // ✅ Lưu courseId để các step sau dùng
      })
      
      console.log("✅ Updated courseData with thumbnailUrl:", finalThumbnailUrl)
      
      // Clear file reference sau khi upload thành công
      setThumbnailFile(null)

      // Navigate to next step
      router.push("/giangvien/khoahoc/chitiet")
    } catch (err) {
      console.error("Error saving course step 1:", err)
      setError(err.message || "Có lỗi xảy ra khi lưu khóa học")
    } finally {
      setIsSaving(false)
    }
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
            <input className={`gvc-input ${attempted && title.trim()==="" ? "is-invalid" : ""}`} value={title} onChange={(e)=>{setTitle(e.target.value); updateCourseData({title: e.target.value})}} placeholder="VD: Lập trình React cơ bản đến nâng cao" />
            {attempted && title.trim()==="" && (<div className="gvc-error">Vui lòng nhập tiêu đề khóa học</div>)}
            {title.trim() && slug && (
              <div className="gvc-hint" style={{color: "#3b82f6", marginTop: "4px"}}>
                <span>🔗 Preview URL: </span>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{color: "#3b82f6", textDecoration: "underline"}}>
                  {previewUrl}
                </a>
              </div>
            )}
            <div className="gvc-hint"><span className="gvc-hint-icon">💡</span><span>Tiêu đề hấp dẫn sẽ thu hút nhiều học viên hơn</span></div>
          </label>

          <label className="gvc-field">
            <div className="gvc-label">Mô tả khóa học <span className="req">*</span></div>
            <textarea className={`gvc-textarea ${attempted && desc.trim()==="" ? "is-invalid" : ""}`} value={desc} onChange={(e)=>{setDesc(e.target.value); updateCourseData({description: e.target.value})}} placeholder="Mô tả ngắn gọn về nội dung và lợi ích của khóa học..." />
            {attempted && desc.trim()==="" && (<div className="gvc-error">Vui lòng nhập mô tả khóa học</div>)}
            <div className="gvc-hint"><span className="gvc-hint-icon">💡</span><span>Mô tả chi tiết giúp học viên hiểu rõ hơn về khóa học</span></div>
          </label>

          <div className="gvc-row">
            <label className="gvc-field">
              <div className="gvc-label">Danh mục <span className="req">*</span></div>
              <div className="gvc-select-wrap">
                {loadingCategories ? (
                  <div className="gvc-select" style={{ padding: "12px", color: "#666" }}>
                    Đang tải danh mục...
                  </div>
                ) : (
                  <select 
                    className={`gvc-select ${category === "" ? "placeholder" : ""} ${attempted && category === "" ? "is-invalid" : ""}`} 
                    value={category} 
                    onChange={(e)=>{
                      setCategory(e.target.value)
                      updateCourseData({categoryId: e.target.value ? parseInt(e.target.value) : null})
                    }}
                  >
                    <option value="">Chọn danh mục</option>
                    {(() => {
                      if (!categories || categories.length === 0) {
                        return null
                      }
                      
                      // ✅ Hiển thị tất cả danh mục từ trên xuống, không phân cấp
                      // Sắp xếp theo CategoryId để giữ thứ tự từ database
                      const sortedCategories = [...categories]
                        .sort((a, b) => {
                          const idA = a.categoryId || a.CategoryId || 0
                          const idB = b.categoryId || b.CategoryId || 0
                          return idA - idB
                        })
                        .map(cat => {
                          const categoryId = cat.categoryId || cat.CategoryId
                          const categoryName = cat.categoryName || cat.CategoryName
                          return { categoryId, categoryName }
                        })
                      
                      // ✅ Render tất cả danh mục đơn giản, không phân cấp
                      return sortedCategories.map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))
                    })()}
                  </select>
                )}
              </div>
              {attempted && category === "" && (<div className="gvc-error">Vui lòng chọn danh mục</div>)}
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
            {thumbPreview && !thumbError ? (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <img 
                  src={thumbPreview} 
                  alt="thumbnail preview" 
                  className="gvc-thumb-preview"
                  onError={() => setThumbError(true)}
                />
                <button 
                  type="button" 
                  className="gvc-btn"
                  onClick={() => {
                    setThumbPreview("")
                    setThumbnailFile(null)
                    setThumbError(false)
                    updateCourseData({ thumbnailUrl: "" })
                    if (fileRef.current) fileRef.current.value = ""
                  }}
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Đổi ảnh
                </button>
              </div>
            ) : (
              <div className="gvc-drop-hint">
                <div className="gvc-drop-icon">📷</div>
                <div className="gvc-drop-title">Chọn ảnh thumbnail</div>
                <div className="gvc-drop-desc">Chấp nhận mọi định dạng file — Kích thước khuyến nghị 1280×720px</div>
                <button type="button" className="gvc-btn" onClick={handleChooseFile}>Tải ảnh lên</button>
                <input ref={fileRef} type="file" accept="*/*" onChange={handleFileChange} hidden />
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="gvc-create-footer">
        <div className="gvc-footer-inner">
          <button className="gvc-btn ghost" type="button" onClick={() => router.push('/giangvien/khoahoc')}>Quay lại</button>
          <div className="gvc-step-info">Bước 1 / 4</div>
          {error && (
            <div className="gvc-error" style={{marginBottom: "8px", textAlign: "center", padding: "8px", background: "#fee2e2", borderRadius: "8px"}}>
              {error}
            </div>
          )}
          <button
            className="gvc-btn primary"
            disabled={!isValidBasic || isSaving}
            onClick={handleContinue}
          >
            {isSaving ? "Đang lưu..." : "Tiếp tục →"}
          </button>
        </div>
      </div>
    </div>
  )
}