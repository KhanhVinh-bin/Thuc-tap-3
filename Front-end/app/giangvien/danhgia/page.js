"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import "../tongquan/page.css";
import "./page.css";

function Star({ filled, onClick }) {
  return (
    <button
      type="button"
      className={`star ${filled ? "active" : ""}`}
      onClick={onClick}
      aria-label={filled ? "Sao đã chọn" : "Sao chưa chọn"}
    >
      {filled ? "★" : "☆"}
    </button>
  );
}

export default function DanhGiaPage() {
  // Demo data: có thể thay bằng dữ liệu thực từ API
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Nguyễn Văn A",
      course: "Javascript Course",
      rating: 5,
      title: "Khóa học rất dễ hiểu",
      content:
        "Khóa học rất dễ hiểu, giảng viên giải thích rõ ràng. Tôi đã học được rất nhiều điều hữu ích từ khóa học này.",
      createdAt: "2 ngày trước",
      reply:
        "Cảm ơn bạn đã đánh giá! Rất vui vì khóa học giúp bạn đạt được mục tiêu. Chúc bạn học tốt hơn nữa!",
    },
    {
      id: 2,
      name: "Nguyễn Th B",
      course: "React Course",
      rating: 4,
      title: "Nội dung đầy đủ, dễ hiểu",
      content:
        "Nội dung đầy đủ, dễ hiểu, bám sát thực hành. Khả năng giảng dạy của giảng viên rất tốt.",
      createdAt: "5 ngày trước",
      reply: null,
    },
    {
      id: 3,
      name: "Lê Văn C",
      course: "Web Development Course",
      rating: 5,
      title: "Khóa học thú vị",
      content:
        "Khóa học cung cấp nhiều trải nghiệm thực tế. Phần lý thuyết rõ ràng, dễ tiếp thu.",
      createdAt: "1 tuần trước",
      reply:
        "Cảm ơn góp ý của bạn! Chúng tôi sẽ cập nhật nội dung thực tế trong các bài học tiếp theo.",
    },
    {
      id: 4,
      name: "Phạm Th D",
      course: "NodeJS Course",
      rating: 3,
      title: "Xuất sắc về bố cục",
      content:
        "Xuất sắc về bố cục. Nội dung dễ hiểu và rõ ràng. Giảng viên rất chuyên nghiệp.",
      createdAt: "2 tuần trước",
      reply: null,
    },
    {
      id: 5,
      name: "Hoàng V E",
      course: "Typescript Course",
      rating: 5,
      title: "Khóa học rất bổ ích",
      content:
        "Khóa học có lộ trình gọn gàng, người mới học cũng theo kịp.",
      createdAt: "3 tuần trước",
      reply:
        "Cảm ơn bạn đã phản hồi. Bọn mình sẽ bổ sung các video ví dụ và bài luyện thêm. Về demo UI, bọn mình sẽ dùng ngôn ngữ React cho dễ sử dụng.",
    },
  ]);

  // Bộ lọc theo số sao
  const [starFilter, setStarFilter] = useState("all"); // "all" | 1..5

  // Form thêm đánh giá mới
  const [newRating, setNewRating] = useState(0);
  const [newName, setNewName] = useState("");
  const [newCourse, setNewCourse] = useState("Javascript Course");
  const [newContent, setNewContent] = useState("");

  const filteredReviews = useMemo(() => {
    if (starFilter === "all") return reviews;
    return reviews.filter((r) => r.rating === Number(starFilter));
  }, [reviews, starFilter]);

  const totalReviews = reviews.length;
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // 1 decimal
  }, [reviews]);

  const distribution = useMemo(() => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      dist[r.rating] += 1;
    });
    return dist;
  }, [reviews]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim() || newRating === 0) return;

    const newItem = {
      id: Date.now(),
      name: newName.trim(),
      course: newCourse,
      rating: newRating,
      title: "",
      content: newContent.trim(),
      createdAt: "Vừa xong",
      reply: null,
    };
    setReviews((prev) => [newItem, ...prev]);
    setNewRating(0);
    setNewName("");
    setNewCourse("Javascript Course");
    setNewContent("");
    setStarFilter("all");
  }

  return (
    <div className="page-container">
      <aside className="sidebar">
        <div className="brand">EduLearn</div>
        <nav className="nav">
          <Link href="/giangvien/tongquan">Tổng quan</Link>
          <Link href="/giangvien/khoahoc">Khóa học</Link>
          <Link href="/giangvien/hocvien">Học viên</Link>
          <Link href="/giangvien/doanhthu">Doanh thu</Link>
          <Link href="/giangvien/danhgia" className="active">
            Đánh giá & Phản hồi
          </Link>
          <Link href="/giangvien/hoso">Hồ sơ</Link>
        </nav>
      </aside>

      <main className="content">
        <div className="gv-title-row">
          <div>
            <h1>Đánh giá & Phản hồi</h1>
            <p>Quản lý đánh giá của học viên</p>
          </div>
          <div className="actions">
            <button className="btn btn-light">Xuất CSV</button>
            <button className="btn btn-primary">Phản hồi hàng loạt</button>
          </div>
        </div>

        <section className="rating-summary">
          <div className="card">
            <div className="card-title">Tổng số đánh giá</div>
            <div className="card-value">{totalReviews}</div>
          </div>
          <div className="card">
            <div className="card-title">Điểm trung bình</div>
            <div className="card-value">
              {averageRating} <span className="star-inline">★</span>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Đã phản hồi</div>
            <div className="card-value">
              {reviews.filter((r) => r.reply).length}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Chưa phản hồi</div>
            <div className="card-value">
              {reviews.filter((r) => !r.reply).length}
            </div>
          </div>
        </section>

        <section className="rating-distribution">
          <h3>Phân bố đánh giá</h3>
          {[5, 4, 3, 2, 1].map((s) => {
            const count = distribution[s];
            const percent = totalReviews
              ? Math.round((count / totalReviews) * 100)
              : 0;
            return (
              <div className="dist-row" key={s}>
                <div className="dist-label">
                  <span>{s}★</span>
                </div>
                <div className="dist-bar">
                  <div
                    className="dist-fill"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="dist-count">{count}</div>
                <div className="dist-percent">{percent}%</div>
              </div>
            );
          })}
        </section>

        <section className="rating-filters">
          <input
            className="input"
            placeholder="Tìm kiếm đánh giá..."
            aria-label="Tìm kiếm"
          />
          <select
            className="select"
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
            aria-label="Lọc theo số sao"
          >
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <select className="select" value={newCourse} onChange={(e) => setNewCourse(e.target.value)}>
            <option value="Javascript Course">Tất cả khóa học</option>
            <option value="Javascript Course">Javascript Course</option>
            <option value="React Course">React Course</option>
            <option value="Web Development Course">Web Development Course</option>
            <option value="NodeJS Course">NodeJS Course</option>
            <option value="Typescript Course">Typescript Course</option>
          </select>
        </section>

        <section className="add-review">
          <h3>Thêm đánh giá</h3>
          <form onSubmit={handleSubmit} className="review-form">
            <div className="form-row">
              <input
                className="input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Tên học viên"
              />
              <div className="stars-select" aria-label="Chọn số sao">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    filled={i <= newRating}
                    onClick={() => setNewRating(i)}
                  />
                ))}
              </div>
            </div>
            <textarea
              className="textarea"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Nội dung đánh giá"
              rows={3}
            />
            <div className="review-form-actions">
              <button type="submit" className="btn btn-primary">
                Gửi đánh giá
              </button>
              <span className="hint">Chọn số sao và nhập nội dung để gửi</span>
            </div>
          </form>
        </section>

        <section className="reviews-list">
          <div className="list-header">
            <h3>Danh sách đánh giá ({filteredReviews.length})</h3>
          </div>
          <ul className="review-items">
            {filteredReviews.map((r) => (
              <li key={r.id} className="review-item">
                <div className="review-head">
                  <div className="avatar" aria-hidden>
                    {r.name.slice(0, 1)}
                  </div>
                  <div className="meta">
                    <div className="name-row">
                      <span className="name">{r.name}</span>
                      <span className="course">{r.course}</span>
                    </div>
                    <div className="rating-row">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < r.rating ? "star-inline active" : "star-inline"}>
                          ★
                        </span>
                      ))}
                      <span className="created">• {r.createdAt}</span>
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-light">Phản hồi</button>
                  </div>
                </div>
                {r.title && <div className="title">{r.title}</div>}
                <div className="content">{r.content}</div>
                {r.reply && (
                  <div className="reply">
                    <div className="reply-title">Phản hồi của bạn</div>
                    <div className="reply-content">{r.reply}</div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}