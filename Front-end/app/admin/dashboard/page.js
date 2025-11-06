'use client';


import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import './dashboard.css';
import AdminLayout from '../components/AdminLayout';
import { BarChart3 } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


const API_BASE = 'https://localhost:7166';

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [summary, setSummary] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [growth, setGrowth] = useState({ groupBy: 'year', points: [] });
  const [recentReviews, setRecentReviews] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  // Thêm: tổng quan đơn hàng/doanh thu từ AdminOrdersController
  const [ordersSummary, setOrdersSummary] = useState(null);

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

    const dateTo = new Date();
    const dateFrom = new Date();
    dateFrom.setDate(dateTo.getDate() - 30);

    const dateToISO = dateTo.toISOString().split('T')[0];
    const dateFromISO = dateFrom.toISOString().split('T')[0];

    (async () => {
      try {
        setLoading(true);
        const [summaryRes, customersRes, growthRes, ordersSummaryRes, recentReviewsRes, recentOrdersRes, recentCoursesRes] = await Promise.all([
          apiFetch('/admin/dashboard/summary'),
          apiFetch('/admin/dashboard/customers/recent?limit=8'),
          apiFetch('/admin/dashboard/growth/users?groupBy=year&range=7'),
          apiFetch(`/api/admin/orders/summary?dateFrom=${dateFromISO}&dateTo=${dateToISO}`),
          apiFetch('/admin/dashboard/reviews/recent?limit=5'),
          apiFetch('/admin/dashboard/orders/recent?limit=5'),
          apiFetch('/admin/courses?limit=5'),
        ]);
        if (!mounted) return;
        if (!summaryRes || !customersRes || !growthRes || !ordersSummaryRes || !recentReviewsRes || !recentOrdersRes || !recentCoursesRes) {
          setError('');
        }
        setSummary(summaryRes || null);
        setCustomers(customersRes?.items || []);
        setGrowth(growthRes || { groupBy: 'year', points: [] });
        setRecentReviews(recentReviewsRes?.items || []);
        setRecentOrders(recentOrdersRes?.items || []);
        setRecentCourses(recentCoursesRes?.items || []);
        // Cập nhật state mới
        setOrdersSummary(ordersSummaryRes || null);
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
console.log("Summary:", summary);
  return (
    <AdminLayout
      title="Tổng quan hệ thống"
      description="Phân tích nhanh doanh thu, người dùng và khóa học"
      headerRightActions={(
        <button className="btn-report" onClick={handleOpenReports}>
          <BarChart3 size={16} className="btn-icon" /> Xem báo cáo
        </button>
      )}
    >

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

        <div className="stat-card courses">
          <div className="stat-header">
            <h3>Tổng khóa học</h3>
          </div>
          <div className="stat-value">
            {loading ? '...' : summary?.totalCourses ?? 0}
          </div>
          <div className="stat-description">
            &nbsp;
          </div>
          <a href="/admin/khoahoc" className="stat-link">Quản lý khóa học →</a>
        </div>

        <div className="stat-card instructors">
          <div className="stat-header">
            <h3>Tổng giảng viên</h3>
          </div>
          <div className="stat-value">
            {loading ? '...' : summary?.totalInstructors ?? 0}
          </div>
          <div className="stat-description">
            &nbsp;
          </div>
          <a href="/admin/giangvien" className="stat-link">Quản lý giảng viên →</a>
        </div>

        <div className="stat-card students">
          <div className="stat-header">
            <h3>Tổng học viên</h3>
          </div>
          <div className="stat-value">
            {loading ? '...' : summary?.totalStudents ?? 0}
          </div>
          <div className="stat-description">
            &nbsp;
          </div>
          <a href="/admin/sinhvien" className="stat-link">Quản lý học viên →</a>
        </div>

        <div className="stat-card customers-total">
          <h3 className="stat-title">Tổng số khách hàng</h3>
          <p className="stat-value">{loading ? '...' : summary?.totalStudents ?? 0}</p>
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

        {/* Recent Reviews Section */}
        <div className="content-card reviews">
          <div className="card-header">
            <h3>Đánh giá gần đây</h3>
            <a href="/admin/danhgia" className="card-link">Tất cả đánh giá →</a>
          </div>
          <div className="review-list">
            {loading && (
              <div className="review-item">Đang tải đánh giá...</div>
            )}
            {!loading && recentReviews.map((r) => (
              <div className="review-item" key={r.reviewId}>
                <div className="review-header">
                  <span className="review-user">{r.userFullName}</span>
                  <span className="review-rating">{'⭐'.repeat(r.rating)}</span>
                </div>
                <p className="review-comment">{r.comment}</p>
                <p className="review-course">Khóa học: {r.courseTitle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="content-card orders">
          <div className="card-header">
            <h3>Đơn hàng gần đây</h3>
            <a href="/admin/qlydonhang" className="card-link">Tất cả đơn hàng →</a>
          </div>
          <div className="order-list">
            {loading && (
              <div className="order-item">Đang tải đơn hàng...</div>
            )}
            {!loading && recentOrders.map((o) => (
              <div className="order-item" key={o.orderId}>
                <div className="order-info">
                  <span className="order-user">{o.userFullName}</span>
                  <span className="order-price">{Intl.NumberFormat('vi-VN').format(o.totalPrice)} đ</span>
                </div>
                <div className={`order-status ${o.status.toLowerCase()}`}>{o.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Courses Section */}
        <div className="content-card courses">
          <div className="card-header">
            <h3>Khóa học gần đây</h3>
            <a href="/admin/khoahoc" className="card-link">Tất cả khóa học →</a>
          </div>
          <div className="review-list"> {/* Using review-list for consistent styling */}
            {loading && (
              <div className="review-item">Đang tải khóa học...</div>
            )}
            {!loading && recentCourses.map((c) => (
              <div className="review-item" key={c.courseId}>
                <div className="review-header">
                  <span className="review-user">{c.title}</span>
                </div>
                <p className="review-course">Giảng viên: {c.instructorName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="content-card chart">
          <div className="card-header">
            <h3>Tốc độ tăng trưởng</h3>
            <select className="period-dropdown" disabled>
              <option>Hàng năm</option>
            </select>
          </div>
          <div className="chart-container" style={{ height: 200, width: '100%' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <span>Đang tải...</span>
              </div>
            ) : (
              <ResponsiveContainer>
                <AreaChart data={growth.points} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(value) => {
                    if (value >= 1000) return `${value / 1000}k`;
                    return value;
                  }} />
                  <Tooltip formatter={(value) => [value, 'New Users']} />
                  <Area type="monotone" dataKey="newUsers" stroke="#4ade80" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="chart-stats">
            <div className="chart-stat">
              <span className="stat-label">Năm tốt nhất</span>
              <div className="stat-info">
                <strong>{bestYear?.period || '—'}</strong>
                <span className="stat-desc">Người dùng mới: {bestYear?.newUsers ?? 0}</span>
              </div>
            </div>
            {/* Thêm: số liệu thật từ AdminOrdersController */}
            <div className="chart-stat">
              <span className="stat-label">Doanh thu 30 ngày</span>
              <div className="stat-info">
                <strong>{Intl.NumberFormat('vi-VN').format(ordersSummary?.TotalRevenue ?? 0)} đ</strong>
                <span className="stat-desc">Đơn hoàn tất: {ordersSummary?.CompletedOrders ?? 0}</span>
              </div>
            </div>
            <div className="chart-stat">
              <span className="stat-label">Thanh toán chờ</span>
              <div className="stat-info">
                <strong>{ordersSummary?.PendingPayments ?? 0}</strong>
                <span className="stat-desc">Payout GV chờ: {ordersSummary?.PendingInstructorPayouts ?? 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Stats Cards, Content Grid, Bottom Grid, etc. */}
      {/* Giữ nguyên toàn bộ nội dung trang như hiện có */}
      {/* Cuối file hiện đang có </AdminLayout>, thay bằng fragment */}
      {error && (
        <div style={{ marginTop: 16, color: '#ef4444' }}>{error}</div>
      )}
    </AdminLayout>
  );
}
