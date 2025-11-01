'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import './thongkebaocao.css';

export default function ThongKeBaoCaoPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newStudents: 0,
    activeCourses: 0,
    averageOrderValue: 0
  });
  const [chartData, setChartData] = useState([]);

  // XÓA dữ liệu giả: const stats = { ... } và const chartData = [ ... ]
  // Chuyển sang lấy từ API thật và derive UI từ state bên dưới

  // API base + Authorization
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://localhost:7166';

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
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
          ...(options.headers || {}),
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        cache: 'no-store',
        mode: 'cors',
        credentials: 'include',
        ...options,
      });
  
      if (res.status === 401 || res.status === 403) {
        return null;
      }
      if (!res.ok) return null;
  
      const data = await res.json().catch(() => null);
      return data;
    } catch {
      return null;
    }
  };

  const formatCurrencyVND = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(value || 0));

  useEffect(() => {
    const fetchData = async () => {
      let path = '/api/admin/reports/revenue/combined';
      if (selectedPeriod === 'day') {
        path += '?period=day';
      } else if (selectedPeriod === 'month') {
        path += `?period=month&year=${year}`;
      } else {
        // 'year' -> quarterly trong backend
        path += `?period=quarterly&year=${year}`;
      }

      const res = await apiFetch(path);
      if (!res) return;

      // Chuẩn hóa dữ liệu biểu đồ
      const transformed = (res.Data || []).map((p) => {
        if (selectedPeriod === 'day') {
          const d = new Date(p.Date);
          return { label: d.toLocaleDateString('vi-VN'), value: Number(p.TotalAmount || 0) };
        }
        return { label: p.Label, value: Number(p.TotalAmount || 0) };
      });

      setChartData(transformed);

      // Tổng hợp chỉ số
      const s = res.Summary || {};
      setSummary({
        totalRevenue: Number(s.TotalRevenue || 0),
        totalOrders: Number(s.TotalOrders || 0),
        newStudents: Number(s.NewStudentsCount || 0),
        activeCourses: Number(s.ActiveCourseCount || 0),
        averageOrderValue: Number(s.AverageOrderValue || 0)
      });
    };

    fetchData();
  }, [selectedPeriod, year]);

  const maxValue = Math.max(...chartData.map(item => item.value)) || 1;

  // Derive UI stats từ summary (không dùng dữ liệu giả)
  const stats = {
    revenue: { value: formatCurrencyVND(summary.totalRevenue), change: '', trend: 'up' },
    orders: { value: String(summary.totalOrders || 0), subtitle: `Trung bình ${formatCurrencyVND(summary.averageOrderValue)}/đơn` },
    newStudents: { value: String(summary.newStudents || 0), subtitle: '—' },
    activeCourses: { value: String(summary.activeCourses || 0), subtitle: '—' }
  };

  return (
    <AdminLayout
      title="Thống kê & Báo cáo"
      description="Tổng quan doanh thu và hiệu suất kinh doanh"
    >
      <div className="reports-page">
        {/* Statistics Cards */}
        <div className="stats-grid">
          {/* Revenue Card */}
          <div className="stat-card revenue-card">
            <div className="stat-header">
              <div className="stat-icon revenue-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="stat-title">Tổng doanh thu</span>
            </div>
            <div className="stat-value">{stats.revenue.value}</div>
            <div className="stat-change positive">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {stats.revenue.change}
            </div>
          </div>

          {/* Orders Card */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon orders-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 17.4 18 18 18S19 17.6 19 17V13M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="stat-title">Đơn hàng</span>
            </div>
            <div className="stat-value">{stats.orders.value}</div>
            <div className="stat-subtitle">{stats.orders.subtitle}</div>
          </div>

          {/* New Students Card */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon students-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M12.5 11C14.9853 11 17 8.98528 17 6.5C17 4.01472 14.9853 2 12.5 2C10.0147 2 8 4.01472 8 6.5C8 8.98528 10.0147 11 12.5 11ZM22 11C22 13.2091 20.2091 15 18 15C15.7909 15 14 13.2091 14 11C14 8.79086 15.7909 7 18 7C20.2091 7 22 8.79086 22 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="stat-title">Học viên mới</span>
            </div>
            <div className="stat-value">{stats.newStudents.value}</div>
            <div className="stat-subtitle">{stats.newStudents.subtitle}</div>
          </div>

          {/* Active Courses Card */}
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon courses-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="stat-title">Khóa học hoạt động</span>
            </div>
            <div className="stat-value">{stats.activeCourses.value}</div>
            <div className="stat-subtitle">{stats.activeCourses.subtitle}</div>
          </div>
        </div>

        {/* Revenue Chart Section */}
        <div className="chart-section">
          <div className="chart-header">
            <div className="chart-title-section">
              <h3>Biểu đồ doanh thu</h3>
              <p>Theo dõi xu hướng doanh thu theo thời gian</p>
            </div>
            <div className="chart-filters">
              <div className="filter-dropdown">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="period-select"
                >
                  <option value="day">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                  <option value="year">Theo năm</option>
                </select>
                <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Thêm chọn năm để đổi dữ liệu cho tháng/quý */}
              <div className="filter-dropdown" style={{ marginLeft: 12 }}>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="period-select"
                >
                  {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-info">
              <div className="chart-legend">
                <span className="legend-item">
                  <span className="legend-color"></span>
                  Doanh thu: {formatCurrencyVND(summary.totalRevenue)}
                </span>
                <span className="legend-item">
                  <span className="legend-color"></span>
                  Đơn hàng: {summary.totalOrders}
                </span>
                <span className="legend-item">
                  <span className="legend-color"></span>
                  Học viên mới: {summary.newStudents}
                </span>
              </div>
            </div>

            <div className="chart-wrapper">
              <div className="chart-y-axis">
                <span>{formatCurrencyVND(maxValue)}</span>
                <span>{formatCurrencyVND(maxValue * 0.8)}</span>
                <span>{formatCurrencyVND(maxValue * 0.6)}</span>
                <span>{formatCurrencyVND(maxValue * 0.4)}</span>
                <span>{formatCurrencyVND(maxValue * 0.2)}</span>
                <span>{formatCurrencyVND(0)}</span>
              </div>

              <div className="chart-area">
                {chartData.length > 0 ? (
                  <svg className="revenue-chart" viewBox="0 0 800 300">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>

                    {/* Chart Line */}
                    <path
                      d={`M 50 ${300 - ((chartData[0]?.value || 0) / maxValue) * 250} ${chartData.map((item, index) =>
                        `L ${50 + (index * 60)} ${300 - ((item.value || 0) / maxValue) * 250}`
                      ).join(' ')}`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Chart Area */}
                    <path
                      d={`M 50 300 L 50 ${300 - ((chartData[0]?.value || 0) / maxValue) * 250} ${chartData.map((item, index) =>
                        `L ${50 + (index * 60)} ${300 - ((item.value || 0) / maxValue) * 250}`
                      ).join(' ')} L ${50 + ((chartData.length - 1) * 60)} 300 Z`}
                      fill="url(#areaGradient)"
                    />

                    {/* Data Points */}
                    {chartData.map((item, index) => (
                      <circle
                        key={index}
                        cx={50 + (index * 60)}
                        cy={300 - ((item.value || 0) / maxValue) * 250}
                        r="4"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
                ) : (
                  <div style={{ color: '#64748b' }}>Không có dữ liệu để hiển thị</div>
                )}
              </div>

              <div className="chart-x-axis">
                {chartData.map((item, index) => (
                  <span key={index}>{item.label}</span>
                ))}
              </div>
            </div>

            <div className="chart-footer">
              <span className="chart-currency">Doanh thu VND</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}