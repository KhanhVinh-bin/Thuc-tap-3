"use client"

import Link from 'next/link'
import '../tongquan/page.css'
import './page.css'
import Footer from '@/components/footer'
import { useState } from 'react'

export default function CaiDatPage(){
  const [twoFA, setTwoFA] = useState(false)
  const [loginNotif, setLoginNotif] = useState(true)
  const [emailNewStudent, setEmailNewStudent] = useState(true)
  const [emailReview, setEmailReview] = useState(true)

  return (
    <div className="gv-dashboard-root">
      <header className="gv-topbar">
        <div className="gv-topbar-left">
          <div className="gv-brand-mini">
            <span className="gv-brand-icon">📘</span>
            <span className="gv-brand-text">EduLearn</span>
          </div>
          <span className="gv-divider" />
          <div className="gv-breadcrumb"><span className="gv-bc-label">Cài đặt</span></div>
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
              <li><Link href="/giangvien/hoso">🗂️ Hồ sơ</Link></li>
              <li><Link href="/giangvien/caidat" className="active">⚙️ Cài đặt</Link></li>
              <li><Link href="/giangvien/hotro">🆘 Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="gv-main">
          <div className="cd-container">
            <h2>Cài đặt</h2>
            <div className="cd-card">
              <h3>Bảo mật</h3>
              <label className="cd-field">Mật khẩu hiện tại<input className="cd-input" placeholder=""/></label>
              <label className="cd-field">Mật khẩu mới<input className="cd-input" placeholder=""/></label>
              <label className="cd-field">Xác nhận mật khẩu mới<input className="cd-input" placeholder=""/></label>
              <button className="cd-btn">Đổi mật khẩu</button>

              <div className="cd-switch-row">
                <div>Xác thực hai yếu tố</div>
                <label className="cd-switch">
                  <input type="checkbox" checked={twoFA} onChange={()=>setTwoFA(!twoFA)} />
                  <span className="cd-slider" />
                </label>
              </div>

              <div className="cd-switch-row">
                <div>Thông báo đăng nhập</div>
                <label className="cd-switch">
                  <input type="checkbox" checked={loginNotif} onChange={()=>setLoginNotif(!loginNotif)} />
                  <span className="cd-slider" />
                </label>
              </div>
            </div>

            <div className="cd-card">
              <h3>Thông báo</h3>
              <div className="cd-switch-row">
                <div>Email về học viên mới</div>
                <label className="cd-switch">
                  <input type="checkbox" checked={emailNewStudent} onChange={()=>setEmailNewStudent(!emailNewStudent)} />
                  <span className="cd-slider" />
                </label>
              </div>
              <div className="cd-switch-row">
                <div>Email về đánh giá</div>
                <label className="cd-switch">
                  <input type="checkbox" checked={emailReview} onChange={()=>setEmailReview(!emailReview)} />
                  <span className="cd-slider" />
                </label>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
