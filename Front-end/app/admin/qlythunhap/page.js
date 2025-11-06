'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './qlythunhap.css';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';

// Chart.js bar chart component (reusable)
const ChartComponent = ({ revenueData, profitData, labels }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueData,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Lợi nhuận',
        data: profitData,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.raw?.toLocaleString('vi-VN')} VND`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) { return Number(value).toLocaleString('vi-VN'); },
        },
      },
    },
  };

  return <Bar data={data} options={options} />;
};

// Chart.js line chart for time series (revenue vs profit)
const TimeSeriesChart = ({ labels, revenueData, profitData }) => {
  const data = {
    labels,
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueData,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
      },
      {
        label: 'Lợi nhuận',
        data: profitData,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw || 0).toLocaleString('vi-VN')} VND`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => Number(value).toLocaleString('vi-VN') },
      },
    },
    animation: { duration: 300 },
  };

  return <Line data={data} options={options} />;
};

export default function Page() {
  const router = useRouter();

  // Cấu hình API + auth (AdminRevenueController)
  const API_BASE = 'https://localhost:7166/api';
  const getToken = () => {
    if (typeof window === 'undefined') return '';
    return (
      localStorage.getItem('admin_token') ||
      sessionStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('auth_token') ||
      ''
    );
  };
  const apiFetch = async (path, options = {}) => {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
      mode: 'cors',
      credentials: 'include',
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      if (res.status === 401 || res.status === 403) {
        alert('Vui lòng đăng nhập tài khoản Admin');
        setTimeout(() => { window.location.href = '/admin-login'; }, 500);
      }
      throw new Error(msg || `HTTP ${res.status}`);
    }
    return res.json();
  };

  // State thống kê (overview) + bảng (analysis)
  const [stats, setStats] = React.useState({
    totalRevenue: 0,
    totalPaid: 0,
    profit: 0,
    totalStudents: 0,
    activeCourses: 0,
  });
  const [courses, setCourses] = React.useState([]);
  const [instructors, setInstructors] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Nạp tổng quan doanh thu
  React.useEffect(() => {
    let cancelled = false;
    const loadOverview = async () => {
      console.log('=== BẮT ĐẦU TẢI TỔNG QUAN DOANH THU ===');
      setLoading(true);
      setError('');
      try {
        console.log('API URL:', `${API_BASE}/admin/revenue/overview?period=month`);
        const data = await apiFetch(`/admin/revenue/overview?period=month`);

        console.log('✅ API Response Status: SUCCESS');
        console.log('Raw API Response:', data);

        if (cancelled) {
          console.log('⚠️ Request was cancelled');
          return;
        }

        if (!data) {
          console.log('❌ Response is null/undefined');
          return;
        }

        const summary = data.Summary ?? data.summary ?? {};
        console.log('Extracted Summary Object:', summary);
        console.log('Summary Keys:', Object.keys(summary));

        const totalRevenue = Number(summary.TotalRevenue ?? summary.totalRevenue ?? 0);
        const totalPaid = Number(summary.TotalPayouts ?? summary.totalPayouts ?? 0);
        const profit = Number(summary.ActualProfit ?? summary.actualProfit ?? (totalRevenue - totalPaid));
        const totalStudents = Number(summary.NewStudentsCount ?? summary.newStudentsCount ?? 0);
        const activeCourses = Number(summary.ActiveCourseCount ?? summary.activeCourseCount ?? 0);

        console.log('📊 PROCESSED STATS:');
        console.log('- Total Revenue:', totalRevenue, '(', typeof totalRevenue, ')');
        console.log('- Total Paid:', totalPaid, '(', typeof totalPaid, ')');
        console.log('- Profit:', profit, '(', typeof profit, ')');
        console.log('- Total Students:', totalStudents, '(', typeof totalStudents, ')');
        console.log('- Active Courses:', activeCourses, '(', typeof activeCourses, ')');

        const finalStats = { totalRevenue, totalPaid, profit, totalStudents, activeCourses };
        console.log('Final Stats Object:', finalStats);

        // Hiển thị dữ liệu thực tế từ API
        console.log('📊 Using real data from API:', finalStats);
        setStats(finalStats);
        console.log('✅ Stats updated successfully');

      } catch (e) {
        console.error('❌ API Error:', e);
        console.error('Error Message:', e?.message || 'Unknown error');
        console.error('Error Stack:', e?.stack);

        // Hiển thị dữ liệu trống khi có lỗi
        console.log('❌ API Error - setting empty stats');
        setStats({
          totalRevenue: 0,
          totalPaid: 0,
          profit: 0,
          totalStudents: 0,
          activeCourses: 0
        });

        setError(`Không thể tải tổng quan doanh thu: ${e.message}`);
      } finally {
        setLoading(false);
        console.log('=== END TỔNG QUAN DOANH THU ===');
      }
    };
    loadOverview();
    return () => { cancelled = true; };
  }, []);

  // Nạp phân tích để điền bảng khóa học/giảng viên
  React.useEffect(() => {
    let cancelled = false;

    const loadTables = async () => {
      try {
        const [byCourse, byInstructor] = await Promise.all([
          apiFetch(`/admin/revenue/by-course`).catch(() => null),
          apiFetch(`/admin/revenue/by-instructor`).catch(() => null),
        ]);
        if (cancelled) return;

        const courseArr = (byCourse && (byCourse.Data ?? byCourse.data)) || [];
        const normalizedCourses = Array.isArray(courseArr)
          ? courseArr.map((c) => ({
            id: c.CourseId ?? c.courseId ?? '',
            name: c.CourseTitle ?? c.courseTitle ?? '',
            instructor: c.InstructorName ?? c.instructorName ?? '',
            students: Number(c.TotalSold ?? c.totalSold ?? 0),
            revenue: Number(c.TotalRevenue ?? c.totalRevenue ?? 0),
            paid: Number(c.TotalPayouts ?? c.totalPayouts ?? 0),
          }))
          : [];

        const instructorArr = (byInstructor && (byInstructor.Data ?? byInstructor.data)) || [];
        const normalizedInstructors = Array.isArray(instructorArr)
          ? instructorArr.map((i) => ({
            id: i.InstructorId ?? i.instructorId ?? '',
            name: i.InstructorName ?? i.instructorName ?? '',
            courseCount: Number(i.CourseCount ?? i.courseCount ?? 0),
            students: Number(i.TotalSold ?? i.totalSold ?? 0),
            totalRevenue: Number(i.TotalRevenue ?? i.totalRevenue ?? 0),
            totalPaid: Number(i.TotalPayouts ?? i.totalPayouts ?? 0),
          }))
          : [];

        setCourses(normalizedCourses);
        setInstructors(normalizedInstructors);
      } catch (e) {
        console.warn('Không thể tải bảng khóa học/giảng viên:', e?.message || e);
      }
    };

    loadTables();
    return () => { cancelled = true; };
  }, []);

  const currency = (n) => (Number(n) || 0).toLocaleString('vi-VN') + ' đ';
  const safePercent = (num, den) => {
    const d = Number(den) || 0;
    if (!d) return '0.0';
    const n = Number(num) || 0;
    const val = (n / d) * 100;
    return Number.isFinite(val) ? val.toFixed(1) : '0.0';
  };
  const exportToExcel = () => {
    const rows1 = [
      ['Mã khóa học', 'Khóa học', 'Giảng viên', 'Học viên', 'Doanh thu', 'Chi trả GV', 'Lợi nhuận'],
      ...courses.map(c => [
        c.id,
        c.name,
        c.instructor,
        c.students,
        currency(c.revenue),
        currency(c.paid),
        currency((Number(c.revenue) || 0) - (Number(c.paid) || 0)),
      ])
    ];
    const rows2 = [
      ['Mã GV', 'Giảng viên', 'Số khóa học', 'Học viên', 'Tổng doanh thu', 'Chi trả GV', 'Lợi nhuận'],
      ...instructors.map(i => [
        i.id,
        i.name,
        i.courseCount,
        i.students,
        currency(i.totalRevenue),
        currency(i.totalPaid),
        currency((Number(i.totalRevenue) || 0) - (Number(i.totalPaid) || 0)),
      ])
    ];
    const toCSV = (rows) => rows.map(r => r.map(v => `"${String(v).replace(/"/g, '\"')}"`).join(',')).join('\n');
    const blob = new Blob(
      [`Bảng doanh thu theo khóa học\n` + toCSV(rows1) + '\n\n' + `Tổng hợp theo giảng viên\n` + toCSV(rows2)],
      { type: 'text/csv;charset=utf-8;' }
    );
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bao-cao-thu-nhap.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const exportToPDF = () => { window.print(); };

  // State biểu đồ xu hướng (dùng dữ liệu thực từ API)
  const [trend, setTrend] = React.useState([]);
  const [linePointsRevenue, setLinePointsRevenue] = React.useState('');
  const [linePointsProfit, setLinePointsProfit] = React.useState('');
  const [barsCost, setBarsCost] = React.useState([]);
  const [barsProfit, setBarsProfit] = React.useState([]);

  // Nạp dữ liệu biểu đồ xu hướng (đặt TRƯỚC return)
  React.useEffect(() => {
    let cancelled = false;
    const loadTrend = async () => {
      try {
        console.log('=== BẮT ĐẦU TẢI DOANH THU THEO THỜI GIAN ===');
        const res = await apiFetch(`/admin/revenue/trend?groupBy=month`);

        if (cancelled) {
          console.log('Request was cancelled');
          return;
        }

        if (!res) {
          throw new Error('API response is null or undefined');
        }

        console.log('✅ API Response Status: SUCCESS');
        console.log('Raw API Response:', res);

        const arr = res.Data ?? res.data ?? [];
        console.log('Extracted Array:', arr);

        if (!Array.isArray(arr) || arr.length === 0) {
          console.log('❌ No data available for chart - setting empty chart');
          setTrend([]);
          setLinePointsRevenue('');
          setLinePointsProfit('');
          setBarsCost([]);
          setBarsProfit([]);
          return;
        }

        setTrend(arr);

        let revenueVals = arr.map(d => Number(d.TotalRevenue ?? d.totalRevenue ?? 0));
        let profitVals = arr.map(d => Number(d.NetProfit ?? d.netProfit ?? 0));
        let payoutVals = arr.map(d => Number(d.TotalPayouts ?? d.totalPayouts ?? 0));

        console.log('Initial Revenue Values:', revenueVals);
        console.log('Initial Profit Values:', profitVals);
        console.log('Initial Payout Values:', payoutVals);

        // Handle single data point case for all series
        if (arr.length === 1) {
          console.log('⚠️ Only one data point, duplicating for chart rendering');
          revenueVals.push(revenueVals[0]);
          profitVals.push(profitVals[0]);
          payoutVals.push(payoutVals[0]);
        }

        const maxVal = Math.max(1, ...revenueVals, ...profitVals, ...payoutVals);
        console.log('Max Value for Chart Scaling:', maxVal);

        const widthStep = 50;
        const height = 200;
        const chartHeight = 180; // Use a fixed height for scaling calculations

        const toPoints = (vals) =>
          vals.map((v, i) => `${i * widthStep},${Math.max(0, height - Math.round((v / maxVal) * chartHeight))}`).join(' ');

        const revenuePoints = toPoints(revenueVals);
        const profitPoints = toPoints(profitVals);

        console.log('Revenue Chart Points:', revenuePoints);
        console.log('Profit Chart Points:', profitPoints);

        setLinePointsRevenue(revenuePoints);
        setLinePointsProfit(profitPoints);

        const toBarHeights = (vals) => vals.map(v => Math.max(2, Math.round((v / maxVal) * chartHeight)));
        
        const costBarHeights = toBarHeights(payoutVals);
        const profitBarHeights = toBarHeights(profitVals);

        console.log('Cost Bar Heights:', costBarHeights);
        console.log('Profit Bar Heights:', profitBarHeights);

        setBarsCost(costBarHeights);
        setBarsProfit(profitBarHeights);

        console.log('✅ Real chart data set successfully');

      } catch (e) {
        console.error('❌ API Error in loadTrend:', e);
        setError(`Không thể tải dữ liệu biểu đồ: ${e.message}`);

        // Clear chart data on error
        setTrend([]);
        setLinePointsRevenue('');
        setLinePointsProfit('');
        setBarsCost([]);
        setBarsProfit([]);
      }
    };

    loadTrend();
    return () => { cancelled = true; };
  }, []);

  // Datasets cho Chart.js (từ dữ liệu trend thực tế)
  const chartLabels = React.useMemo(() => trend.map(d => String(d.Label ?? d.label ?? '')), [trend]);
  const revenueValues = React.useMemo(() => trend.map(d => Number(d.TotalRevenue ?? d.totalRevenue ?? 0)), [trend]);
  const profitValues = React.useMemo(() => trend.map(d => Number(d.NetProfit ?? d.netProfit ?? 0)), [trend]);

  return (
    <AdminLayout
      title="Quản lý doanh thu & Thu nhập"
      description="Thống kê tổng hợp doanh thu, chi phí và lợi nhuận của nền tảng"
    >
      <div className="controls-section">
        <div></div>
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={exportToExcel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" /><path d="M7 10l5 5l5-5" stroke="currentColor" strokeWidth="2" /></svg>
            Xuất Excel
          </button>
          <button className="btn btn-primary" onClick={exportToPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" /></svg>
            Xuất PDF
          </button>
        </div>
      </div>

      {/* Error/Loading */}
      {error && <div style={{ marginBottom: 12, color: '#DC2626' }}>{error}</div>}
      {loading && <div style={{ marginBottom: 12, color: '#374151' }}>Đang tải dữ liệu...</div>}

      <div className="stats-grid">
        <div className="stat-card total-revenue">
          <div className="stat-label">Tổng doanh thu</div>
          <div className="stat-value">
            {loading ? (
              <div className="loading-skeleton">---</div>
            ) : (
              currency(stats.totalRevenue)
            )}
          </div>
          <div className="stat-change positive">+12.5% so với tháng trước</div>
        </div>
        {/* <div className="stat-card paid">
          <div className="stat-label">Chi trả giảng viên</div>
          <div className="stat-value">
            {loading ? (
              <div className="loading-skeleton">---</div>
            ) : (
              currency(stats.totalPaid)
            )}
          </div>
          <div className="stat-change neutral">{safePercent(stats.totalPaid, stats.totalRevenue)}% tổng doanh thu</div>

        </div> */}
        <div className="stat-card profit">
          <div className="stat-label">Lợi nhuận thực</div>
          <div className="stat-value">
            {loading ? (
              <div className="loading-skeleton">---</div>
            ) : (
              currency(stats.profit)
            )}
          </div>
          <div className="stat-change positive">Tỷ suất: {safePercent(stats.profit, stats.totalRevenue)}%</div>

        </div>
        <div className="stat-card total-students">
          <div className="stat-label">Tổng học viên</div>
          <div className="stat-value">
            {loading ? (
              <div className="loading-skeleton">---</div>
            ) : (
              stats.totalStudents.toLocaleString('vi-VN')
            )}
          </div>
          <div className="stat-change positive">+8.3% so với tháng trước</div>
        </div>
        <div className="stat-card active-courses">
          <div className="stat-label">Số khóa học</div>
          <div className="stat-value">
            {loading ? (
              <div className="loading-skeleton">---</div>
            ) : (
              stats.activeCourses.toLocaleString('vi-VN')
            )}
          </div>
          <div className="stat-change positive">+2 khóa học mới</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <div className="card-header"><h3 className="card-title">Doanh thu theo thời gian</h3><span className="chip">Theo tháng</span></div>
          <div className="card-content">
            <div className="line-chart">
              <TimeSeriesChart labels={chartLabels} revenueData={revenueValues} profitData={profitValues} />
            </div>
            <div className="chart-legend"><span className="dot blue"></span> Doanh thu <span className="dot green"></span> Lợi nhuận</div>
          </div>
        </div>
        <div className="card chart-card">
          <div className="card-header"><h3 className="card-title">Chi phí & Lợi nhuận</h3><span className="chip">Theo tháng</span></div>
          <div className="card-content">
            <div className="chart-container">
              <ChartComponent revenueData={revenueValues} profitData={profitValues} labels={chartLabels} />
            </div>
            <div className="chart-legend"><span className="dot purple"></span> Chi trả GV <span className="dot green"></span> Lợi nhuận</div>
          </div>
        </div>
      </div>

      <div className="card table-section">
        <div className="card-header">
          <h3 className="card-title">Doanh thu theo khóa học</h3>
          <div className="filter-group">
            <select className="filter-select">
              <option>Tất cả khóa học</option>
              <option>Frontend</option>
              <option>Backend</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" /></svg>
          </div>
        </div>
        <div className="card-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã khóa học</th><th>Khóa học</th><th>Giảng viên</th><th>Học viên</th><th>Doanh thu</th><th>Chi trả GV</th><th>Lợi nhuận</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c, idx) => (
                  <tr key={(c.id || 'course') + '-' + idx}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td><button className="link" onClick={() => router.push('/admin/giangvien')}>{c.instructor}</button></td>
                    <td>{c.students}</td>
                    <td>{currency(c.revenue)}</td>
                    <td>{currency(c.paid)}</td>
                    <td className="text-green">{currency((Number(c.revenue) || 0) - (Number(c.paid) || 0))}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-view" title="Xem chi tiết" onClick={() => router.push('/admin/qlythunhapgiangvien')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!courses || courses.length === 0) && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#6b7280' }}>Chưa có dữ liệu phân tích khóa học</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card table-section">
        <div className="card-header">
          <h3 className="card-title">Tổng hợp theo giảng viên</h3>
          <div className="filter-group">
            <select className="filter-select"><option>Tất cả giảng viên</option><option>Đang hoạt động</option></select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" /></svg>
          </div>
        </div>
        <div className="card-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã GV</th><th>Giảng viên</th><th>Số khóa học</th><th>Học viên</th><th>Tổng doanh thu</th><th>Chi trả GV</th><th>Lợi nhuận</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((i, idx) => (
                  <tr key={(i.id || 'ins') + '-' + idx}>
                    <td>{i.id}</td>
                    <td><button className="link" onClick={() => router.push('/admin/giangvien')}>{i.name}</button></td>
                    <td>{i.courseCount}</td>
                    <td>{i.students}</td>
                    <td>{currency(i.totalRevenue)}</td>
                    <td>{currency(i.totalPaid)}</td>
                    <td className="text-green">{currency((Number(i.totalRevenue) || 0) - (Number(i.totalPaid) || 0))}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-view" title="Xem chi tiết" onClick={() => router.push('/admin/qlythunhapgiangvien')}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!instructors || instructors.length === 0) && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: '#6b7280' }}>Chưa có dữ liệu tổng hợp giảng viên</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}