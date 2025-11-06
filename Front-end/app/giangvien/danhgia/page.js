"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Footer from "@/components/footer";
import "../tongquan/page.css";
import "./page.css";

export default function DanhGiaPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Demo data theo thiết kế mới
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      course: "Complete React Development Course",
      rating: 5,
      content: "Khóa học rất dễ hiểu và dễ thực hành. Giảng viên giải thích rõ ràng. Tôi đã học được rất nhiều điều hữu ích từ khóa học này.",
      createdAt: "2 ngày trước",
      reply: "Phản hồi của bạn",
      replyContent: "Cảm ơn bạn đã đánh giá! Rất vui vì khóa học giúp bạn đạt được mục tiêu. Chúc bạn học tốt hơn nữa!",
    },
    {
      id: 2,
      name: "Nguyễn Th B",
      course: "Complete React Development Course", 
      rating: 4,
      content: "Nội dung đầy đủ, dễ hiểu, bám sát thực hành. Khả năng giảng dạy của giảng viên rất tốt.",
      createdAt: "5 ngày trước",
      reply: null,
    },
    {
      id: 3,
      name: "Lê Văn C",
      course: "Complete React Development Course",
      rating: 5,
      content: "Khóa học cung cấp nhiều trải nghiệm thực tế. Phần lý thuyết rõ ràng, dễ tiếp thu.",
      createdAt: "1 tuần trước",
      reply: "Phản hồi của bạn",
      replyContent: "Cảm ơn góp ý của bạn! Chúng tôi sẽ cập nhật nội dung thực tế trong các bài học tiếp theo.",
    },
    {
      id: 4,
      name: "Phạm Th D",
      course: "Complete React Development Course",
      rating: 4,
      content: "Xuất sắc về bố cục. Nội dung dễ hiểu và rõ ràng. Giảng viên rất chuyên nghiệp.",
      createdAt: "2 tuần trước",
      reply: null,
    },
    {
      id: 5,
      name: "Hoàng Văn E",
      course: "Complete React Development Course",
      rating: 5,
      content: "Khóa học có lộ trình gọn gàng, người mới học cũng theo kịp.",
      createdAt: "3 tuần trước",
      reply: "Phản hồi của bạn",
      replyContent: "Cảm ơn bạn đã phản hồi. Bọn mình sẽ bổ sung các video ví dụ và bài luyện thêm. Về demo UI, bọn mình sẽ dùng ngôn ngữ React cho dễ sử dụng.",
    },
  ]);

  // Thống kê theo thiết kế mới
  const totalReviews = 2500; // Số liệu theo hình
  const averageRating = 4.6;
  const repliedCount = 3;
  const unrepliedCount = 2;

  const distribution = useMemo(() => {
    return {
      5: { count: 1865, percent: 75 },
      4: { count: 500, percent: 20 },
      3: { count: 100, percent: 4 },
      2: { count: 25, percent: 1 },
      1: { count: 10, percent: 0 }
    };
  }, [reviews]);

  return (
    <div className={`gv-dashboard-root ${sidebarCollapsed ? "collapsed" : ""}`}>
      {/* Header/topbar */}
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
             <span className="gv-bc-label">Đánh giá & Phản hồi</span> 
          </div>
        </div>
        <div className="gv-topbar-right">
          <div className="gv-avatar" title="Tài khoản">
            <span className="gv-presence" />
          </div>
        </div>
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
                      <path d="M20 42 L60 18 L100 42 V82 H20 Z" fill="none" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M24 82 H96" fill="none" stroke="#2b2b2b" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M34 52 C44 66,76 66,86 52" fill="none" stroke="#2b2b2b" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  Tổng quan
                </Link>
              </li>
              <li><Link href="/giangvien/khoahoc"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><rect width="256" height="256" fill="none"/><path d="M128,88 a32,32,0,0,1,32-32 h64 a8,8,0,0,1,8,8 V192 a8,8,0,0,1-8,8 H160 a32,32,0,0,0-32,32" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/><path d="M24,192 a8,8,0,0,0,8,8 H96 a32,32,0,0,1,32,32 V88 A32,32,0,0,0,96,56 H32 a8,8,0,0,0-8,8 Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"/></svg></span> Khóa học</Link></li>
              <li><Link href="/giangvien/hocvien"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="#000000" d="M10 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8z M4 8a6 6 0 1 1 12 0A6 6 0 0 1 4 8z m12.828-4.243a1 1 0 0 1 1.415 0 a6 6 0 0 1 0 8.486 a1 1 0 1 1-1.415-1.415 a4 4 0 0 0 0-5.656 a1 1 0 0 1 0-1.415z m.702 13a1 1 0 0 1 1.212-.727 c1.328.332 2.169 1.18 2.652 2.148 c.468.935.606 1.98.606 2.822 a1 1 0 1 1-2 0 c0-.657-.112-1.363-.394-1.928 c-.267-.533-.677-.934-1.349-1.102 a1 1 0 0 1-.727-1.212z M6.5 18 C5.24 18 4 19.213 4 21 a1 1 0 1 1-2 0 c0-2.632 1.893-5 4.5-5h7 c2.607 0 4.5 2.368 4.5 5 a1 1 0 1 1-2 0 c0-1.787-1.24-3-2.5-3h-7z" /></svg></span> Học viên</Link></li>
              <li><Link href="/giangvien/doanhthu"><span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 256 256" aria-hidden="true"><rect width="256" height="256" fill="none" /><line x1="128" y1="168" x2="128" y2="184" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><line x1="128" y1="72" x2="128" y2="88" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="128" cy="128" r="96" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /><path d="M104,168h36a20,20,0,0,0,0-40H116a20,20,0,0,1,0-40h36" fill="none" stroke="#000" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" /></svg></span> Doanh thu</Link></li>
              <li><Link href="/giangvien/hoso"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true"><path d="M416,221.25 V416 a48,48,0,0,1-48,48 H144 a48,48,0,0,1-48-48 V96 a48,48,0,0,1,48-48 h98.75 a32,32,0,0,1,22.62,9.37 L406.63,198.63 A32,32,0,0,1,416,221.25Z" fill="none" stroke="#000" strokeLinejoin="round" strokeWidth="32" /><path d="M256,56 V176 a32,32,0,0,0,32,32 H408" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /><line x1="176" y1="288" x2="336" y2="288" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /><line x1="176" y1="368" x2="336" y2="368" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /></svg></span> Hồ sơ</Link></li>
              <li>
                <Link href="/giangvien/danhgia" className="active">
                  <span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" aria-hidden="true">
                      <path d="M123.6 391.3 c12.9-9.4 29.6-11.8 44.6-6.4 c26.5 9.6 56.2 15.1 87.8 15.1 c124.7 0 208-80.5 208-160 s-83.3-160-208-160 S48 160.5 48 240 c0 32 12.4 62.8 35.7 89.2 c8.6 9.7 12.8 22.5 11.8 35.5 c-1.4 18.1-5.7 34.7-11.3 49.4 c17-7.9 31.1-16.7 39.4-22.7 z M21.2 431.9 c1.8-2.7 3.5-5.4 5.1-8.1 c10-16.6 19.5-38.4 21.4-62.9 C17.7 326.8 0 285.1 0 240 C0 125.1 114.6 32 256 32 s256 93.1 256 208 s-114.6 208-256 208 c-37.1 0-72.3-6.4-104.1-17.9 c-11.9 8.7-31.3 20.6-54.3 30.6 c-15.1 6.6-32.3 12.6-50.1 16.1 c-.8 .2-1.6 .3-2.4 .5 c-4.4 .8-8.7 1.5-13.2 1.9 c-.2 0-.5 .1-.7 .1 c-5.1 .5-10.2 .8-15.3 .8 c-6.5 0-12.3-3.9-14.8-9.9 c-2.5-6-1.1-12.8 3.4-17.4 c4.1-4.2 7.8-8.7 11.3-13.5 c1.7-2.3 3.3-4.6 4.8-6.9 c.1-.2 .2-.3 .3-.5 z" />
                    </svg>
                  </span>
                  Đánh giá & Phản hồi
                </Link>
              </li>
              <li><Link href="/giangvien/caidat"><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",gap:"6px"}}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" aria-hidden="true"><path d="M262.29,192.31 a64,64,0,1,0,57.4,57.4 A64.13,64.13,0,0,0,262.29,192.31Z M416.39,256 a154.34,154.34,0,0,1-1.53,20.79 l45.21,35.46 A10.81,10.81,0,0,1,462.52,326 l-42.77,74 a10.81,10.81,0,0,1-13.14,4.59 l-44.9-18.08 a16.11,16.11,0,0,0-15.17,1.75 A164.48,164.48,0,0,1,325,400.8 a15.94,15.94,0,0,0-8.82,12.14 l-6.73,47.89 A11.08,11.08,0,0,1,298.77,470 H213.23 a11.11,11.11,0,0,1-10.69-8.87 l-6.72-47.82 a16.07,16.07,0,0,0-9-12.22 a155.3,155.3,0,0,1-21.46-12.57 a16,16,0,0,0-15.11-1.71 l-44.89,18.07 a10.81,10.81,0,0,1-13.14-4.58 l-42.77-74 a10.8,10.8,0,0,1,2.45-13.75 l38.21-30 a16.05,16.05,0,0,0,6-14.08 c-.36-4.17-.58-8.33-.58-12.5 s.21-8.27.58-12.35 a16,16,0,0,0-6.07-13.94 l-38.19-30 A10.81,10.81,0,0,1,49.48,186 l42.77-74 a10.81,10.81,0,0,1,13.14-4.59 l44.9,18.08 a16.11,16.11,0,0,0,15.17-1.75 A164.48,164.48,0,0,1,187,111.2 a15.94,15.94,0,0,0,8.82-12.14 l6.73-47.89 A11.08,11.08,0,0,1,213.23,42 h85.54 a11.11,11.11,0,0,1,10.69,8.87 l6.72,47.82 a16.07,16.07,0,0,0,9,12.22 a155.3,155.3,0,0,1,21.46,12.57 a16,16,0,0,0,15.11,1.71 l44.89-18.07 a10.81,10.81,0,0,1,13.14,4.58 l42.77,74 a10.8,10.8,0,0,1-2.45,13.75 l-38.21,30 a16.05,16.05,0,0,0-6.05,14.08 C416.17,247.67,416.39,251.83,416.39,256Z" fill="none" stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" /></svg></span> Cài đặt</Link></li>
              <li><Link href="/giangvien/hotro"><span aria-hidden="true" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-patch-question" viewBox="0 0 16 16" aria-hidden="true"><path d="M8.05 9.6 c.336 0 .504-.24.554-.627 .04-.534.198-.815.847-1.26 .673-.475 1.049-1.09 1.049-1.986 0-1.325-.92-2.227-2.262-2.227 -1.02 0-1.792.492-2.1 1.29 A1.71 1.71 0 0 0 6 5.48 c0 .393.203.64.545.64 .272 0 .455-.147.564-.51 .158-.592.525-.915 1.074-.915 .61 0 1.03.446 1.03 1.084 0 .563-.208.885-.822 1.325 -.619.433-.926.914-.926 1.64v.111 c0 .428.208.745.585.745z"/><path d="m10.273 2.513-.921-.944.715-.698.622.637.89-.011 a2.89 2.89 0 0 1 2.924 2.924l-.01.89.636.622 a2.89 2.89 0 0 1 0 4.134l-.637.622.011.89 a2.89 2.89 0 0 1-2.924 2.924l-.89-.01-.622.636 a2.89 2.89 0 0 1-4.134 0l-.622-.637-.89.011 a2.89 2.89 0 0 1-2.924-2.924l.01-.89-.636-.622 a2.89 2.89 0 0 1 0-4.134l.637-.622-.011-.89 a2.89 2.89 0 0 1 2.924-2.924l.89.01.622-.636 a2.89 2.9 0 0 1 4.134 0l-.715.698 a1.89 1.89 0 0 0-2.704 0l-.92.944-1.32-.016 a1.89 1.89 0 0 0-1.911 1.912l.016 1.318-.944.921 a1.89 1.89 0 0 0 0 2.704l.944.92-.016 1.32 a1.89 1.89 0 0 0 1.912 1.911l1.318-.016.921.944 a1.89 1.89 0 0 0 2.704 0l.92-.944 1.32.016 a1.89 1.89 0 0 0 1.911-1.912l-.016-1.318.944-.921 a1.89 1.89 0 0 0 0-2.704l-.944-.92.016-1.32 a1.89 1.89 0 0 0-1.912-1.911l-1.318.016z"/><path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0z"/></svg></span> Hỗ trợ</Link></li>
            </ul>
          </nav>
        </aside>

        {/* Main content */}
        <main className="gv-main">
          <div className="dg-header">
            <div className="dg-title">
              <h1>Đánh giá & Phản hồi</h1>
              <p>Quản lý đánh giá của học viên</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="dg-stats">
            <div className="dg-stat-card">
              <div className="dg-stat-label">Tổng số đánh giá</div>
              <div className="dg-stat-value">{totalReviews.toLocaleString()}</div>
            </div>
            <div className="dg-stat-card">
              <div className="dg-stat-label">Điểm trung bình</div>
              <div className="dg-stat-value">
                {averageRating} <span className="dg-star">★</span>
              </div>
            </div>
            <div className="dg-stat-card">
              <div className="dg-stat-label">Đã phản hồi</div>
              <div className="dg-stat-value">{repliedCount}</div>
            </div>
            <div className="dg-stat-card">
              <div className="dg-stat-label">Chưa phản hồi</div>
              <div className="dg-stat-value">{unrepliedCount}</div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="dg-distribution">
            <h3>Phân bố đánh giá</h3>
            <div className="dg-dist-list">
              {[5, 4, 3, 2, 1].map((star) => {
                const data = distribution[star];
                return (
                  <div key={star} className="dg-dist-row">
                    <div className="dg-dist-label">{star}★</div>
                    <div className="dg-dist-bar">
                      <div 
                        className="dg-dist-fill" 
                        style={{ width: `${data.percent}%` }}
                      />
                    </div>
                    <div className="dg-dist-count">{data.count}</div>
                    <div className="dg-dist-percent">{data.percent}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="dg-reviews">
            <h3>Danh sách đánh giá ({reviews.length})</h3>
            <div className="dg-review-list">
              {reviews.map((review) => (
                <div key={review.id} className="dg-review-item">
                  <div className="dg-review-header">
                    <div className="dg-avatar">
                      {review.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="dg-review-meta">
                      <div className="dg-review-name">{review.name}</div>
                      <div className="dg-review-course">{review.course}</div>
                      <div className="dg-review-rating">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span 
                            key={i} 
                            className={`dg-star ${i < review.rating ? 'active' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                        <span className="dg-review-time">• {review.createdAt}</span>
                      </div>
                    </div>
                    <div className="dg-review-actions">
                      <button className="dg-reply-btn">Phản hồi</button>
                    </div>
                  </div>
                  <div className="dg-review-content">
                    {review.content}
                  </div>
                  {review.reply && (
                    <div className="dg-reply">
                      <div className="dg-reply-header">{review.reply}</div>
                      <div className="dg-reply-content">{review.replyContent}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}