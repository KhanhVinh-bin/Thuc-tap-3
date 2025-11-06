"use client"

import Link from 'next/link'
import '../tongquan/page.css'
import './page.css'
import Footer from '@/components/footer'

const chartData = [
  { label: 'T5/24', value: 7000 },
  { label: 'T6/24', value: 4000 },
  { label: 'T7/24', value: 11000 },
  { label: 'T8/24', value: 5000 },
  { label: 'T9/24', value: 9000 },
  { label: 'T10/24', value: 10500 }
]

export default function DoanhThuPage(){
  const max = Math.max(...chartData.map(c => c.value))

  return (
    <div className="gv-dashboard-root">
      <header className="gv-topbar">
        <div className="gv-topbar-left">
          <div className="gv-brand-mini">
            <span className="gv-brand-icon" aria-hidden="true">📘</span>
            <span className="gv-brand-text">EduLearn</span>
          </div>
        </div>
        <div className="gv-topbar-right">
          <div className="gv-notifs">🔔</div>
          <div className="gv-avatar">N</div>
        </div>
      </header>

      <div className="gv-dashboard">
        <aside className="gv-sidebar">
          <nav className="gv-nav">
            <ul>
              <li><Link href="/giangvien/tongquan">Tổng quan</Link></li>
              <li><Link href="/giangvien/khoahoc">Khóa học</Link></li>
              <li><Link href="/giangvien/hocvien">Học viên</Link></li>
              <li><Link href="/giangvien/doanhthu" className="active">Doanh thu</Link></li>
              <li><Link href="/giangvien/hoso">Hồ sơ</Link></li>
              <li><Link href="/giangvien/caidat">Cài đặt</Link></li>
              <li><Link href="/giangvien/hotro">Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>

        <main className="gv-main">
          <h1 className="page-title">Doanh thu</h1>

          <div className="summary-cards">
            <div className="summary-card green">
              <div className="sc-top">Tổng doanh thu</div>
              <div className="sc-value">84.3M VNĐ</div>
              <div className="sc-sub">+4% So với tháng trước</div>
            </div>

            <div className="summary-card blue">
              <div className="sc-top">Số dư khả dụng</div>
              <div className="sc-value">8.3M VNĐ</div>
              <button className="sc-action">Rút tiền</button>
            </div>

            <div className="summary-card pink">
              <div className="sc-top">Doanh thu tháng này</div>
              <div className="sc-value">13.3M VNĐ</div>
              <div className="sc-sub">103 khóa học đã đc bán</div>
            </div>
          </div>

          <section className="chart-card">
            <h2>Biểu đồ doanh thu</h2>

            <div className="bar-chart" role="img" aria-label="Biểu đồ doanh thu">
              <svg viewBox={`0 0 600 260`} preserveAspectRatio="none">
                {/* grid lines */}
                {[0,1,2,3,4,5].map(i => (
                  <line key={i} x1={40} x2={580} y1={40 + i*40} y2={40 + i*40} stroke="#e6e6e6" strokeWidth="1" />
                ))}

                {/* bars */}
                {chartData.map((c, idx) => {
                  const barWidth = 60
                  const gap = 20
                  const x = 40 + idx * (barWidth + gap)
                  const height = (c.value / max) * 160
                  const y = 220 - height
                  return (
                    <g key={c.label}>
                      <rect x={x} y={y} width={barWidth} height={height} rx={6} fill="#8b5cf6" />
                      <text x={x + barWidth/2} y={240} fontSize={12} textAnchor="middle" fill="#374151">{c.label}</text>
                    </g>
                  )
                })}
              </svg>
            </div>
          </section>

        </main>
      </div>

      <Footer />
    </div>
  )
}
