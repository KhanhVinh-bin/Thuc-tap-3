"use client"

import Link from 'next/link'
import '../tongquan/page.css'
import './page.css'
import Footer from '@/components/footer'

const profile = {
  name: 'Nguyễn Văn Văn',
  rating: 4.5,
  students: 12500,
  courses: 6,
  joined: 1875,
  email: 'ngtruong404@gmail.com',
  phone: '+84 343822367',
  address: 'HCM, Việt Nam',
  bio: 'Tôi là một full-stack developer với hơn 8 năm kinh nghiệm trong phát triển web. Đam mê chia sẻ kiến thức và giúp đỡ học viên phát triển kỹ năng lập trình.',
  experience: '8+ năm kinh nghiệm phát triển web',
  education: 'Cử nhân Khoa học Máy tính - ĐH Harvard',
  skills: ['React.js','Node.js','JavaScript'],
  social: { facebook: 'https://facebook.com', youtube: 'https://youtube.com', linkedin: 'https://linkedin.com', x: 'https://x.com' }
}

function Avatar(){
  return (
    <div className="pf-avatar">
      <img src="/avatar-placeholder.png" alt="avatar" />
    </div>
  )
}

export default function HosoPage(){
  return (
    <div className="gv-dashboard-root">
      <header className="gv-topbar">
        <div className="gv-topbar-left">
          <div className="gv-brand-mini">
            <span className="gv-brand-icon" aria-hidden="true">📘</span>
            <span className="gv-brand-text">EduLearn</span>
          </div>
          <span className="gv-divider" aria-hidden="true" />
          <div className="gv-breadcrumb"><span className="gv-bc-label">Hồ sơ giảng viên</span></div>
        </div>
      </header>

      <div className="gv-dashboard">
        <aside className="gv-sidebar">
          <nav className="gv-nav">
            <ul>
              <li><Link href="/giangvien/tongquan">📊 Tổng quan</Link></li>
              <li><Link href="/giangvien/khoahoc">📚 Khóa học</Link></li>
              <li><Link href="/giangvien/hocvien">👥 Học viên</Link></li>
              <li><Link href="/giangvien/doanhthu">💰 Doanh thu</Link></li>
              <li><Link href="/giangvien/hoso" className="active">🗂️ Hồ sơ</Link></li>
              <li><Link href="/giangvien/caidat">⚙️ Cài đặt</Link></li>
              <li><Link href="#">🆘 Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="gv-main">
          <div className="pf-grid">
            <div className="pf-left">
              <div className="pf-card">
                <Avatar />
                <div className="pf-name">{profile.name}</div>
                <div className="pf-meta">⭐ {profile.rating} • ({profile.students} học viên)</div>
                <ul className="pf-stats">
                  <li>{profile.courses} khóa học</li>
                  <li>Tham gia từ {profile.joined}</li>
                </ul>
                <button className="pf-edit">Chỉnh sửa</button>
              </div>
            </div>

            <div className="pf-right">
              <div className="pf-panel">
                <h3>Thông tin liên hệ</h3>
                <div className="pf-row"><strong>Email</strong><span>{profile.email}</span></div>
                <div className="pf-row"><strong>Số điện thoại</strong><span>{profile.phone}</span></div>
                <div className="pf-row"><strong>Địa chỉ</strong><span>{profile.address}</span></div>
              </div>

              <div className="pf-panel">
                <h3>Giới thiệu bản thân</h3>
                <p className="pf-bio">{profile.bio}</p>
              </div>

              <div className="pf-panel">
                <h3>Chuyên môn</h3>
                <div className="pf-row"><strong>Kinh nghiệm</strong><span>{profile.experience}</span></div>
                <div className="pf-row"><strong>Học vấn</strong><span>{profile.education}</span></div>
                <div className="pf-row"><strong>Kỹ năng chuyên môn</strong>
                  <div className="pf-skills">{profile.skills.map(s => <span key={s} className="pf-skill">{s}</span>)}</div>
                </div>
              </div>

              <div className="pf-panel">
                <h3>Liên kết mạng xã hội</h3>
                <div className="pf-row"><strong>Facebook</strong><span>{profile.social.facebook}</span></div>
                <div className="pf-row"><strong>Youtube</strong><span>{profile.social.youtube}</span></div>
                <div className="pf-row"><strong>LinkedIn</strong><span>{profile.social.linkedin}</span></div>
                <div className="pf-row"><strong>X</strong><span>{profile.social.x}</span></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
