"use client"

import Footer from "@/components/footer"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import "../tongquan/page.css"
import "./page.css"
import { getInstructorProfile, patchInstructorProfile } from "../lib/instructorApi"

export default function GiangVienHoSoPage() {
  const router = useRouter()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [bio, setBio] = useState("")
  const [experience, setExperience] = useState("")
  const [education, setEducation] = useState("")
  const [backup, setBackup] = useState(null)
  // Liên hệ và kỹ năng
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [contactAddress, setContactAddress] = useState("")
  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState("")

  // Social links
  const [facebook, setFacebook] = useState("")
  const [youtube, setYoutube] = useState("")
  const [linkedIn, setLinkedIn] = useState("")
  const [xUrl, setXUrl] = useState("")

  // Basic profile info
  const [fullName, setFullName] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("/placeholder-user.jpg")
  const [ratingAvg, setRatingAvg] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)
  const [totalStudents, setTotalStudents] = useState(0)
  const [totalCourses, setTotalCourses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const onEdit = () => {
    setBackup({ bio, experience, education, contactEmail, contactPhone, contactAddress, skills, fullName, avatarUrl })
    setEditMode(true)
  }
  const onCancel = () => {
    if (backup) {
      setBio(backup.bio)
      setExperience(backup.experience)
      setEducation(backup.education)
      setContactEmail(backup.contactEmail)
      setContactPhone(backup.contactPhone)
      setContactAddress(backup.contactAddress)
      setSkills(backup.skills)
      setFullName(backup.fullName)
      setAvatarUrl(backup.avatarUrl)
    }
    setEditMode(false)
  }
  const onSave = () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      if (!token) {
        alert("Bạn chưa đăng nhập")
        return
      }

      const expMatch = experience && experience.match(/\d+/)
      const expYears = expMatch ? parseInt(expMatch[0], 10) : undefined

      const dto = {
        Biography: bio || undefined,
        ExperienceYears: expYears || undefined,
        Education: education || undefined,
        FullName: fullName || undefined,
        Email: contactEmail || undefined,
        PhoneNumber: contactPhone || undefined,
        Address: contactAddress || undefined,
        AvatarUrl: avatarUrl || undefined,
        FacebookUrl: facebook || undefined,
        YouTubeUrl: youtube || undefined,
        LinkedInUrl: linkedIn || undefined,
        Xurl: xUrl || undefined,
      }

      patchInstructorProfile(dto, token)
        .then((updated) => {
          // Đồng bộ lại state từ phản hồi server nếu có
          if (updated) {
            setFullName(updated.fullName ?? updated.FullName ?? fullName)
            setAvatarUrl(updated.avatarUrl ?? updated.AvatarUrl ?? avatarUrl)
            setBio(updated.biography ?? updated.Biography ?? bio)
            const exp = updated.experienceYears ?? updated.ExperienceYears
            setExperience(typeof exp === 'number' ? `${exp} năm kinh nghiệm` : experience)
            setEducation(updated.education ?? updated.Education ?? education)
            setContactEmail(updated.email ?? updated.Email ?? contactEmail)
            setContactPhone(updated.phoneNumber ?? updated.PhoneNumber ?? contactPhone)
            setContactAddress(updated.address ?? updated.Address ?? contactAddress)
            setFacebook(updated.facebookUrl ?? updated.FacebookUrl ?? facebook)
            setYoutube(updated.youTubeUrl ?? updated.YouTubeUrl ?? youtube)
            setLinkedIn(updated.linkedInUrl ?? updated.LinkedInUrl ?? linkedIn)
            setXUrl(updated.xurl ?? updated.Xurl ?? xUrl)
          }
          setEditMode(false)
          alert("Cập nhật hồ sơ thành công")
        })
        .catch((err) => {
          console.error(err)
          alert("Cập nhật hồ sơ thất bại")
        })
    } catch (e) {
      console.error(e)
    }
  }
  // Kỹ năng: thêm/xóa
  const addSkill = () => {
    const name = newSkill.trim()
    if (!name) return
    if (skills.some(s => s.toLowerCase() === name.toLowerCase())) { setNewSkill(""); return }
    setSkills(prev => [...prev, name])
    setNewSkill("")
  }
  const removeSkill = (index) => {
    setSkills(prev => prev.filter((_, i) => i !== index))
  }

  // Fetch profile from API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
        if (!token) {
          setError('Vui lòng đăng nhập để xem hồ sơ giảng viên.')
          setLoading(false)
          return
        }
        const data = await getInstructorProfile(token)
        // Ánh xạ theo cấu trúc response thực tế từ API
        const inst = data?.instructor || {}

        setFullName(data?.fullName || inst?.fullName || "")
        setAvatarUrl(data?.avatar || inst?.avatarUrl || "/placeholder-user.jpg")
        setRatingAvg(inst?.ratingAverage ?? 0)
        setTotalStudents(inst?.totalStudents ?? 0)
        setTotalCourses(inst?.totalCourses ?? 0)
        setTotalReviews(inst?.totalReviews ?? 0)

        setContactEmail(data?.email || inst?.email || "")
        setContactPhone(inst?.phoneNumber || "")
        setContactAddress(inst?.address || "")

        setBio(inst?.biography || "")
        setEducation(inst?.education || "")
        setExperience(
          inst?.experienceYears || inst?.experienceYears === 0
            ? `${inst.experienceYears} năm kinh nghiệm`
            : ""
        )

        setFacebook(inst?.socialLinks?.facebookUrl || "")
        setYoutube(inst?.socialLinks?.youTubeUrl || "")
        setLinkedIn(inst?.socialLinks?.linkedInUrl || "")
        setXUrl(inst?.socialLinks?.xurl || "")
      } catch (err) {
        console.error('Load instructor profile failed:', err)
        if (err.message.includes('404')) {
          setError('Không tìm thấy hồ sơ giảng viên. Vui lòng đăng nhập lại.')
        } else if (err.message.includes('401')) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
        } else if (err.message.includes('Failed to fetch')) {
          setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.')
        } else {
          setError(`Lỗi tải hồ sơ: ${err.message}`)
        }
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  return (
    <div className={`gv-dashboard-root ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Header/topbar */}
      <header className="gv-topbar" role="banner">
        <div className="gv-topbar-left">
          <Link href="/giangvien/tongquan" className="gv-brand-mini" aria-label="Về trang Tổng quan">
            <span className="gv-brand-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="#1e3a8a">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </span>
            <span className="gv-brand-text">EduLearn</span>
          </Link>
          <span className="gv-divider" aria-hidden="true" />
          <div className="gv-breadcrumb" aria-label="Breadcrumb"> 
            <button 
              type="button" 
              className="gv-collapse-btn" 
              aria-label={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"} 
              onClick={() => setSidebarCollapsed(v => !v)} 
            > 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{transform: sidebarCollapsed ? "scaleX(-1)" : "none"}}> 
                <polyline points="9 6 5 12 9 18" strokeLinecap="round" strokeLinejoin="round" /> 
                <line x1="13" y1="7" x2="20" y2="7" strokeLinecap="round" /> 
                <line x1="13" y1="12" x2="20" y2="12" strokeLinecap="round" /> 
                <line x1="13" y1="17" x2="20" y2="17" strokeLinecap="round" /> 
              </svg> 
            </button> 
             <span className="gv-bc-label">Hồ sơ</span> 
          </div>
        </div>
        <div className="gv-topbar-right"></div>
      </header>

      <div className="gv-dashboard">
        {/* Sidebar */}
        <aside className="gv-sidebar">
          <nav className="gv-nav">
            <ul>
              <li>
                <Link href="/giangvien/tongquan">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" width="18" height="18" aria-hidden="true">
                      <path d="M20 42 L60 18 L100 42 V82 H20 Z" fill="none" stroke="#2b2b2b" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M24 82 H96" fill="none" stroke="#2b2b2b" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M34 52 C44 66,76 66,86 52" fill="none" stroke="#2b2b2b" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Tổng quan
                </Link>
              </li>
              <li><Link href="/giangvien/khoahoc"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><rect width="256" height="256" fill="none"/><path d="M128,88 a32,32,0,0,1,32-32 h64 a8,8,0,0,1,8,8 V192 a8,8,0,0,1-8,8 H160 a32,32,0,0,0-32,32" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M24,192 a8,8,0,0,0,8,8 H96 a32,32,0,0,1,32,32 V88 A32,32,0,0,0,96,56 H32 a8,8,0,0,0-8,8 Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/></svg></span> Khóa học</Link></li>
              <li><Link href="/giangvien/hocvien"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#000000" d="M10 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8z M4 8a6 6 0 1 1 12 0A6 6 0 0 1 4 8z m12.828-4.243a1 1 0 0 1 1.415 0 a6 6 0 0 1 0 8.486 a1 1 0 1 1-1.415-1.415 a4 4 0 0 0 0-5.656 a1 1 0 0 1 0-1.415z m.702 13a1 1 0 0 1 1.212-.727 c1.328.332 2.169 1.18 2.652 2.148 c.468.935.606 1.98.606 2.822 a1 1 0 1 1-2 0 c0-.657-.112-1.363-.394-1.928 c-.267-.533-.677-.934-1.349-1.102 a1 1 0 0 1-.727-1.212z M6.5 18 C5.24 18 4 19.213 4 21 a1 1 0 1 1-2 0 c0-2.632 1.893-5 4.5-5h7 c2.607 0 4.5 2.368 4.5 5 a1 1 0 1 1-2 0 c0-1.787-1.24-3-2.5-3h-7z" /></svg></span> Học viên</Link></li>
              <li><Link href="/giangvien/doanhthu"><span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><rect width="256" height="256" fill="none" /><line x1="128" y1="168" x2="128" y2="184" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><line x1="128" y1="72" x2="128" y2="88" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="128" cy="128" r="96" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><path d="M104,168h36a20,20,0,0,0,0-40H116a20,20,0,0,1,0-40h36" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Doanh thu</Link></li>
              
              <li><Link href="/giangvien/hoso" className="active"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true"><path d="M416,221.25 V416 a48,48,0,0,1-48,48 H144 a48,48,0,0,1-48-48 V96 a48,48,0,0,1,48-48 h98.75 a32,32,0,0,1,22.62,9.37 L406.63,198.63 A32,32,0,0,1,416,221.25Z" fill="none" stroke="#000" strokeLinejoin="round" strokeWidth="32" /><path d="M256,56 V176 a32,32,0,0,0,32,32 H408" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /><line x1="176" y1="288" x2="336" y2="288" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /><line x1="176" y1="368" x2="336" y2="368" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /></svg></span> Hồ sơ</Link></li>
              <li>
                <Link href="/giangvien/danhgia">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" aria-hidden="true">
                      <path d="M123.6 391.3 c12.9-9.4 29.6-11.8 44.6-6.4 c26.5 9.6 56.2 15.1 87.8 15.1 c124.7 0 208-80.5 208-160 s-83.3-160-208-160 S48 160.5 48 240 c0 32 12.4 62.8 35.7 89.2 c8.6 9.7 12.8 22.5 11.8 35.5 c-1.4 18.1-5.7 34.7-11.3 49.4 c17-7.9 31.1-16.7 39.4-22.7 z M21.2 431.9 c1.8-2.7 3.5-5.4 5.1-8.1 c10-16.6 19.5-38.4 21.4-62.9 C17.7 326.8 0 285.1 0 240 C0 125.1 114.6 32 256 32 s256 93.1 256 208 s-114.6 208-256 208 c-37.1 0-72.3-6.4-104.1-17.9 c-11.9 8.7-31.3 20.6-54.3 30.6 c-15.1 6.6-32.3 12.6-50.1 16.1 c-.8 .2-1.6 .3-2.4 .5 c-4.4 .8-8.7 1.5-13.2 1.9 c-.2 0-.5 .1-.7 .1 c-5.1 .5-10.2 .8-15.3 .8 c-6.5 0-12.3-3.9-14.8-9.9 c-2.5-6-1.1-12.8 3.4-17.4 c4.1-4.2 7.8-8.7 11.3-13.5 c1.7-2.3 3.3-4.6 4.8-6.9 c.1-.2 .2-.3 .3-.5 z" />
                    </svg>
                  </span>
                  Đánh giá & Phản hồi
                </Link>
              </li>
              <li><Link href="/giangvien/caidat"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true"><path d="M262.29,192.31 a64,64,0,1,0,57.4,57.4 A64.13,64.13,0,0,0,262.29,192.31Z M416.39,256 a154.34,154.34,0,0,1-1.53,20.79 l45.21,35.46 A10.81,10.81,0,0,1,462.52,326 l-42.77,74 a10.81,10.81,0,0,1-13.14,4.59 l-44.9-18.08 a16.11,16.11,0,0,0-15.17,1.75 A164.48,164.48,0,0,1,325,400.8 a15.94,15.94,0,0,0-8.82,12.14 l-6.73,47.89 A11.08,11.08,0,0,1,298.77,470 H213.23 a11.11,11.11,0,0,1-10.69-8.87 l-6.72-47.82 a16.07,16.07,0,0,0-9-12.22 a155.3,155.3,0,0,1-21.46-12.57 a16,16,0,0,0-15.11-1.71 l-44.89,18.07 a10.81,10.81,0,0,1-13.14-4.58 l-42.77-74 a10.8,10.8,0,0,1,2.45-13.75 l38.21-30 a16.05,16.05,0,0,0,6-14.08 c-.36-4.17-.58-8.33-.58-12.5 s.21-8.27.58-12.35 a16,16,0,0,0-6.07-13.94 l-38.19-30 A10.81,10.81,0,0,1,49.48,186 l42.77-74 a10.81,10.81,0,0,1,13.14-4.59 l44.9,18.08 a16.11,16.11,0,0,0,15.17-1.75 A164.48,164.48,0,0,1,187,111.2 a15.94,15.94,0,0,0,8.82-12.14 l6.73-47.89 A11.08,11.08,0,0,1,213.23,42 h85.54 a11.11,11.11,0,0,1,10.69,8.87 l6.72,47.82 a16.07,16.07,0,0,0,9,12.22 a155.3,155.3,0,0,1,21.46,12.57 a16,16,0,0,0,15.11,1.71 l44.89-18.07 a10.81,10.81,0,0,1,13.14,4.58 l42.77,74 a10.8,10.8,0,0,1-2.45,13.75 l-38.21,30 a16.05,16.05,0,0,0-6.05,14.08 C416.17,247.67,416.39,251.83,416.39,256Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /></svg></span> Cài đặt</Link></li>
              <li><Link href="/giangvien/hotro"><span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-patch-question" viewBox="0 0 16 16" aria-hidden="true"><path d="M8.05 9.6 c.336 0 .504-.24.554-.627 .04-.534.198-.815.847-1.26 .673-.475 1.049-1.09 1.049-1.986 0-1.325-.92-2.227-2.262-2.227 -1.02 0-1.792.492-2.1 1.29 A1.71 1.71 0 0 0 6 5.48 c0 .393.203.64.545.64 .272 0 .455-.147.564-.51 .158-.592.525-.915 1.074-.915 .61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325 -.619.433-.926.914-.926 1.64v.111 c0 .428.208.745.585.745z"/><path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011 a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622 a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89 a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636 a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011 a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622 a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89 a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636 a2.89 2.89 0 0 1 4.134 0l-.715.698 a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016 a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921 a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32 a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944 a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016 a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921 a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32 a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z"/><path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/></svg></span> Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="gv-main">
          <div className="profile-container">
            {loading && (
              <div style={{padding:"12px"}}>Đang tải hồ sơ...</div>
            )}
            {error && (
              <div style={{padding:"12px", color:"red"}}>{error}</div>
            )}
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-tabs">
                <button className="tab-btn active">Thông tin cá nhân</button>
              </div>
              {editMode ? (
                <div className="edit-actions">
                  <button className="btn cancel" onClick={onCancel}>Hủy</button>
                  <button className="btn save" onClick={onSave}>Lưu</button>
                </div>
              ) : (
                <button className="edit-btn" onClick={onEdit}>Chỉnh sửa</button>
              )}
            </div>

            {/* Profile Content */}
            <div className="profile-content">
              {/* Left Column - Avatar and Basic Info */}
              <div className="profile-left">
                <div className="avatar-section">
                  <div className="avatar-container">
                    <img src={avatarUrl || "/placeholder-user.jpg"} alt={fullName || "Giảng viên"} className="profile-avatar" />
                  </div>
                  <div className="profile-basic-info">
                    {editMode ? (
                      <input
                        className="edit-input"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nhập họ và tên"
                      />
                    ) : (
                      <h2 className="profile-name">{fullName || ""}</h2>
                    )}
                    {false && (
                    <div className="profile-rating">
                      <span className="rating-stars">⭐ {Number(ratingAvg || 0).toFixed(1)}</span>
                      <span className="rating-text">({totalReviews?.toLocaleString?.('vi-VN') || 0} đánh giá)</span>
                    </div>
                    )}
                    {false && (
                    <div className="profile-stats">
                      <div className="stat-item">
                        <span className="stat-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                            {/* Group chứa các phần tử */}
                            <g>
                              {/* Nền trong suốt để giữ kích thước */}
                              <path fill="none" d="M0 0h24v24H0z" />
                              {/* Hình vẽ chính: hai người (group/users) */}
                              <path d="M2 22 a8 8 0 1 1 16 0 h-2 a6 6 0 1 0-12 0 H2 z m8-9 c-3.315 0-6-2.685-6-6 s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6 z m0-2 c2.21 0 4-1.79 4-4 s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4 z m8.284 3.703 A8.002 8.002 0 0 1 23 22 h-2 a6.001 6.001 0 0 0-3.537-5.473 l.82-1.824 z m-.688-11.29 A5.5 5.5 0 0 1 21 8.5 a5.499 5.499 0 0 1-5 5.478 v-2.013 a3.5 3.5 0 0 0 1.041-6.609 l.555-1.943 z" />
                            </g>
                          </svg>
                        </span>
                        <span className="stat-text">{(totalStudents || 0).toLocaleString('vi-VN')} học viên</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 256 256"
                            aria-hidden="true"
                          >
                            {/* Nền trong suốt */}
                            <rect width="256" height="256" fill="none" />
                            {/* Nửa bên phải (thiết bị hoặc phần thứ hai) */}
                            <path
                              d="M128,88 a32,32,0,0,1,32-32 h64 a8,8,0,0,1,8,8 V192 a8,8,0,0,1-8,8 H160 a32,32,0,0,0-32,32"
                              fill="none"
                              stroke="#000"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="12"
                            />
                            {/* Nửa bên trái */}
                            <path
                              d="M24,192 a8,8,0,0,0,8,8 H96 a32,32,0,0,1,32,32 V88 A32,32,0,0,0,96,56 H32 a8,8,0,0,0-8,8 Z"
                              fill="none"
                              stroke="#000"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="12"
                            />
                          </svg>
                        </span>
                        <span className="stat-text">{(totalCourses || 0).toLocaleString('vi-VN')} khóa học</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-calendar"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                          >
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2  2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2  2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1  4v10a1 1 0 0 0 1 1h12a1  1 0 0 0 1-1V4H1z" />
                          </svg>
                        </span>
                        <span className="stat-text">Tham gia từ {(new Date()).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    )}
                  </div>
                  {editMode && (
                    <div style={{marginTop:"12px"}}>
                      <label className="info-label" style={{display:"block", marginBottom:"6px"}}>Ảnh đại diện (URL)</label>
                      <input
                        className="edit-input"
                        type="text"
                        value={avatarUrl}
                        onChange={(e)=>setAvatarUrl(e.target.value)}
                        placeholder="Ví dụ: /placeholder-user.jpg hoặc https://..."
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Detailed Info */}
              <div className="profile-right">
                {/* Contact Information */}
                <div className="info-section">
                  <h3 className="section-title">Thông tin liên hệ</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <label className="info-label">Email</label>
                      <div className="info-value">
                        <span className="info-icon" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="18"
                            height="18"
                          >
                            <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </span>
                        {editMode ? (
                          <input
                            className="edit-input"
                            type="email"
                            value={contactEmail}
                            onChange={(e)=>setContactEmail(e.target.value)}
                            placeholder="name@example.com"
                          />
                        ) : (
                          <span>{contactEmail}</span>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <label className="info-label">Số điện thoại</label>
                      <div className="info-value">
                        <span className="info-icon" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="18"
                            height="18"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2  19.79 19.79 0 0 1-8.63-3.07  19.5 19.5 0 0 1-6-6  19.79 19.79 0 0 1-3.07-8.63  A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72  12.84 12.84 0 0 0 .7 2.81  2 2 0 0 1-.45 2.11L8.09 9.91  a16 16 0 0 0 6 6l1.27-1.27  a2 2 0 0 1 2.11-.45  12.84 12.84 0 0 0 2.81.7  A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </span>
                        {editMode ? (
                          <input
                            className="edit-input"
                            type="text"
                            value={contactPhone}
                            onChange={(e)=>setContactPhone(e.target.value)}
                            placeholder="(+84)xxxxxxxxx"
                          />
                        ) : (
                          <span>{contactPhone}</span>
                        )}
                      </div>
                    </div>
                    <div className="info-item full-width">
                      <label className="info-label">Địa chỉ</label>
                      <div className="info-value">
                        <span className="info-icon" aria-hidden="true">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            width="18"
                            height="18"
                          >
                            <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </span>
                        {editMode ? (
                          <input
                            className="edit-input"
                            type="text"
                            value={contactAddress}
                            onChange={(e)=>setContactAddress(e.target.value)}
                            placeholder="Thành phố, Quốc gia"
                          />
                        ) : (
                          <span>{contactAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="info-section">
                  <h3 className="section-title">Giới thiệu bản thân</h3>
                  <div className="bio-content">
                    {editMode ? (
                      <textarea
                        className="edit-textarea"
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                      />
                    ) : (
                      <div className="bio-box">
                        <p>{bio}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expertise Section */}
                <div className="info-section">
                  <h3 className="section-title">Chuyên môn</h3>
                  <div className="expertise-content">
                    <div className="expertise-item">
                      <h4 className="expertise-title">Kinh nghiệm</h4>
                      {editMode ? (
                        <input
                          className="edit-input"
                          type="text"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                        />
                      ) : (
                        <div className="expertise-field">{experience}</div>
                      )}
                    </div>
                    <div className="expertise-item">
                      <h4 className="expertise-title">Học vấn</h4>
                      {editMode ? (
                        <input
                          className="edit-input"
                          type="text"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                        />
                      ) : (
                        <div className="expertise-field">{education}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="info-section">
                  <h3 className="section-title">Kỹ năng chuyên môn</h3>
                  {editMode ? (
                    <div>
                      <div className="skills-content">
                        {skills.map((s, idx) => (
                          <span key={idx} className="skill-chip">
                            <span>{s}</span>
                            <button className="skill-remove" title="Xóa" onClick={()=>removeSkill(idx)}>×</button>
                          </span>
                        ))}
                      </div>
                      <div className="skill-add">
                        <input
                          className="skill-input"
                          type="text"
                          value={newSkill}
                          placeholder="Thêm kỹ năng (Enter để thêm)"
                          onChange={(e)=>setNewSkill(e.target.value)}
                          onKeyDown={(e)=>{ if(e.key==='Enter'){ addSkill() } }}
                        />
                        <button className="skill-add-btn" onClick={addSkill}>Thêm</button>
                      </div>
                    </div>
                  ) : (
                    <div className="skills-content">
                      {skills.map((s, idx) => (
                        <span key={idx} className="skill-tag">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social Links Section */}
                <div className="info-section">
                  <h3 className="section-title">Liên kết mạng xã hội</h3>
                  <div className="social-grid">
                    <div className="social-item">
                      <label className="social-label">Facebook</label>
                      <input type="text" className="social-input" placeholder="https://Facebook.com" value={facebook} onChange={(e)=>setFacebook(e.target.value)} />
                    </div>
                    <div className="social-item">
                      <label className="social-label">Youtube</label>
                      <input type="text" className="social-input" placeholder="https://Youtube.com" value={youtube} onChange={(e)=>setYoutube(e.target.value)} />
                    </div>
                    <div className="social-item">
                      <label className="social-label">LinkedIn</label>
                      <input type="text" className="social-input" placeholder="https://LinkedIn.com" value={linkedIn} onChange={(e)=>setLinkedIn(e.target.value)} />
                    </div>
                    <div className="social-item">
                      <label className="social-label">X</label>
                      <input type="text" className="social-input" placeholder="https://X.com" value={xUrl} onChange={(e)=>setXUrl(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}