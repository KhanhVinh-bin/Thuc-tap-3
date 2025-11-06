"use client"

import Link from 'next/link'
import '../tongquan/page.css'
import './page.css'
import { students } from '../services/students'
import Footer from '@/components/footer'

function Avatar({name}){
  const initial = name ? name.charAt(0) : 'N'
  return (
    <div className="hv-avatar">{initial}</div>
  )
}

export default function HocVienPage(){
  return (
    <div className="gv-dashboard-root">
      <header className="gv-topbar" role="banner">
        <div className="gv-topbar-left">
          <div className="gv-brand-mini">
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
          </div>
          <span className="gv-divider" aria-hidden="true" />
          <div className="gv-breadcrumb" aria-label="Breadcrumb">
            <span className="gv-bc-icon">≡</span>
            <span className="gv-bc-label">Học viên</span>
          </div>
        </div>
        <div className="gv-topbar-right">
          <div className="gv-notify" title="Thông báo">
            <span className="gv-bell-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b">
                <path
                  d="M12 3c-2.761 0-5 2.239-5 5v3l-2 2v2h14v-2l-2-2V8c0-2.761-2.239-5-5-5Z"
                  strokeWidth="1.5"
                />
                <circle cx="12" cy="19" r="2" fill="#f59e0b" />
              </svg>
            </span>
            <span className="gv-badge">4</span>
          </div>
          <div className="gv-avatar" title="Tài khoản">
            <span className="gv-presence" />
          </div>
        </div>
      </header>

      <div className="gv-dashboard">
        <aside className="gv-sidebar">
          <nav className="gv-nav">
            <ul>
              <li><Link href="/giangvien/tongquan">📊 Tổng quan</Link></li>
              <li><Link href="/giangvien/khoahoc">📚 Khóa học</Link></li>
              <li><Link href="/giangvien/hocvien" className="active">👥 Học viên</Link></li>
              <li><Link href="/giangvien/doanhthu">💰 Doanh thu</Link></li>
              <li><Link href="/giangvien/hoso">🗂️ Hồ sơ</Link></li>
              <li><Link href="/giangvien/caidat">⚙️ Cài đặt</Link></li>
              <li><Link href="#">🆘 Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="gv-main">
          <div className="hv-root">
            <div className="hv-container">
              <h2 className="hv-title">Học viên</h2>
              <div className="hv-card">
                <div className="hv-card-header">Danh sách học viên</div>

                <div className="hv-table">
                  <div className="hv-table-head">
                    <div>Học viên</div>
                    <div>Khóa học</div>
                    <div>Tiến độ</div>
                    <div>Truy cập cuối</div>
                    <div>Trạng thái</div>
                    <div>Hành động</div>
                  </div>

                  <div className="hv-table-body">
                    {students.map(s => (
                      <div className="hv-row" key={s.id}>
                        <div className="hv-col hv-student">
                          <Avatar name={s.name} />
                          <div className="hv-student-info">
                            <div className="hv-name">{s.name}</div>
                            <div className="hv-email">{s.email}</div>
                          </div>
                        </div>

                        <div className="hv-col hv-course">
                          <div className="hv-course-title"><Link href={`/giangvien/khoahoc/${s.courseId}/chitiet`}>{s.course}</Link></div>
                          <div className="hv-course-meta">Đăng ký: {s.registered}</div>
                        </div>

                        <div className="hv-col hv-progress">
                          <div className="hv-progress-row">
                            <div className="hv-progress-percent">{s.progress}%</div>
                            <div className="hv-progress-bar-wrap">
                              <div className="hv-progress-bar-bg">
                                <div className="hv-progress-bar-fill" style={{width: `${s.progress}%`}} />
                              </div>
                            </div>
                            <div className="hv-lessons">{s.lessons}</div>
                          </div>
                        </div>

                        <div className="hv-col hv-last">{s.lastAccess}</div>

                        <div className="hv-col hv-status">
                          <span className={`hv-badge ${s.status === 'Hoạt động' ? 'active' : s.status === 'Đang học' ? 'learning' : 'inactive'}`}>{s.status}</span>
                        </div>

                        <div className="hv-col hv-action">
                          <button className="hv-action-btn" aria-label="chat">💬</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hv-pagination">
                  <button className="pag-btn">««</button>
                  <button className="pag-btn">«</button>
                  <div className="pag-pages">
                    <button className="pag-page active">1</button>
                    <button className="pag-page">2</button>
                    <button className="pag-page">3</button>
                    <button className="pag-page">4</button>
                    <button className="pag-page">5</button>
                    <span className="pag-ellipsis">…</span>
                  </div>
                  <button className="pag-btn">»</button>
                  <button className="pag-btn">»»</button>
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
