'use client';


import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './dashboard.css';
import { BarChart3 } from 'lucide-react';


const API_BASE = 'https://localhost:7166';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [growth, setGrowth] = useState({ groupBy: 'year', points: [] });
  const [topCourses, setTopCourses] = useState([]);
  const [pendingCourses, setPendingCourses] = useState([]);

  const token = useMemo(() => {
    try { return localStorage.getItem('admin_token') || ''; } catch { return ''; }
  }, []);

  const apiFetch = async (path) => {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });
    if (res.status === 401 || res.status === 403) {
      router.push('/admin-login');
      return null;
    }
    const data = await res.json().catch(() => null);
    return res.ok ? data : null;
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [summaryRes, customersRes, growthRes, topRes, pendingRes] = await Promise.all([
          apiFetch('/admin/dashboard/summary'),
          apiFetch('/admin/dashboard/customers/recent?limit=8'),
          apiFetch('/admin/dashboard/growth/users?groupBy=year&range=7'),
          apiFetch('/admin/dashboard/courses/top?days=90&limit=5'),
          apiFetch('/admin/dashboard/courses/pending-approval?status=draft,pending')
        ]);
        if (!mounted) return;
        if (!summaryRes || !customersRes || !growthRes || !topRes || !pendingRes) {
          setError('Không thể tải dữ liệu Dashboard.');
        }
        setSummary(summaryRes || null);
        setCustomers(customersRes?.items || []);
        setGrowth(growthRes || { groupBy: 'year', points: [] });
        setTopCourses(topRes?.items || []);
        setPendingCourses(pendingRes?.items || []);
      } catch (e) {
        setError('Có lỗi xảy ra khi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [router, token]);

  const bestYear = useMemo(() => {
    if (!growth?.points?.length) return null;
    return growth.points.reduce((a, b) => (b.newUsers > a.newUsers ? b : a));
  }, [growth]);

  // Thêm: nút mở báo cáo tổng hợp
  const handleOpenReports = () => {
    router.push('/admin/thongkebaocao');
  };

  return (
    <>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>Tổng quan hệ thống</h1>
          <p>Phân tích nhanh doanh thu, người dùng và khóa học</p>
        </div>
        <div className="header-right">
          <button className="btn-report" onClick={handleOpenReports}>
            <BarChart3 size={16} className="btn-icon" /> Xem báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-header">
            <h3>Doanh thu</h3>
            <span className="stat-trend up">📈</span>
          </div>
          <div className="stat-value">
            {loading ? '...' : `${summary?.revenue?.changePercent ?? 0}%`}
          </div>
          <div className="stat-description">So với tuần trước</div>
          <a href="/admin/thongkebaocao" className="stat-link">Báo cáo doanh thu →</a>
        </div>

        <div className="stat-card discount">
          <div className="stat-header">
            <h3>Tỉ lệ chốt giao dịch</h3>
          </div>
          <div className="stat-value">
            {loading ? '...' : `${summary?.successRate?.currentPercent ?? 0}%`}
          </div>
          <div className="stat-description">
            {loading ? '' : `Đã chốt ${summary?.successRate?.currentWeekClosed ?? 0}/${summary?.successRate?.currentWeekTotal ?? 0} đơn`}
          </div>
          <a href="/admin/qlydonhang" className="stat-link">Xem đơn hàng →</a>
        </div>

        <div className="stat-card target">
          <div className="stat-header">
            <h3>Mục tiêu</h3>
          </div>
          <div className="stat-value">
            <div className="progress-circle">
              <span>{loading ? '...' : `${summary?.goals?.completionPercent ?? 0}%`}</span>
            </div>
          </div>
          <a href="/admin/khoahoc" className="stat-link">Tất cả các mục tiêu →</a>
        </div>
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Customers Section */}
        <div className="content-card customers">
          <div className="card-header">
            <h3>Khách hàng</h3>
            <select className="sort-dropdown" disabled>
              <option>Sắp xếp theo mới nhất</option>
            </select>
          </div>
          <div className="customer-list">
            {loading && (
              <div className="customer-item">Đang tải khách hàng...</div>
            )}
            {!loading && customers.map((c) => (
              <div className="customer-item" key={c.userId}>
                <img src="/placeholder-user.jpg" alt="Customer" className="customer-avatar" />
                <span className="customer-name">{c.fullName}</span>
                <div className="customer-actions">
                  <button title="Nhắn tin">💬</button>
                  <button title="Đánh dấu">⭐</button>
                  <button title="Sửa">✏️</button>
                  <button title="Thêm">⋯</button>
                </div>
              </div>
            ))}
          </div>
          <a href="/admin/sinhvien" className="card-link">Tất cả khách hàng →</a>
        </div>

        {/* Growth Chart */}
        <div className="content-card chart">
          <div className="card-header">
            <h3>Tốc độ tăng trưởng</h3>
            <select className="period-dropdown" disabled>
              <option>Hàng năm</option>
            </select>
          </div>
          <div className="chart-container">
            {/* Hiển thị nhãn năm theo dữ liệu */}
            <div className="chart-labels">
              {loading ? (
                <span>Đang tải...</span>
              ) : (
                growth.points.map((p) => (<span key={p.period}>{p.period}</span>))
              )}
            </div>
          </div>
          <div className="chart-stats">
            <div className="chart-stat">
              <span className="stat-label">Năm tốt nhất</span>
              <div className="stat-info">
                <strong>{bestYear?.period || '—'}</strong>
                <span className="stat-desc">Người dùng mới: {bestYear?.newUsers ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bottom-grid">
        {/* Best Selling Courses */}
        <div className="content-card products">
          <h3>Khóa học bán chạy</h3>
          <div className="product-list">
            {loading && <div className="product-item">Đang tải...</div>}
            {!loading && topCourses.map((c) => (
              <div className="product-item" key={c.courseId}>
                <span className="product-name">{c.title}</span>
                <span className="product-sales">{Intl.NumberFormat('vi-VN').format(c.revenue)} đ</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approval */}
        <div className="content-card promotions">
          <h3>Khóa học chờ duyệt</h3>
          <div className="promotion-tags">
            {loading && <span className="promo-tag">Đang tải...</span>}
            {!loading && pendingCourses.map((c) => (
              <span className="promo-tag" key={c.courseId}>{c.title}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards, Content Grid, Bottom Grid, etc. */}
      {/* Giữ nguyên toàn bộ nội dung trang như hiện có */}
      {/* Cuối file hiện đang có </AdminLayout>, thay bằng fragment */}
      {error && (
        <div style={{ marginTop: 16, color: '#ef4444' }}>{error}</div>
      )}
    </>
  );
}
