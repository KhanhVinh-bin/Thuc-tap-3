'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './thongkebaocao.css';

// Đảm bảo API_BASE đúng với cấu hình backend
const API_BASE = 'https://localhost:7028/api';
// Backup URL nếu cần thiết
const BACKUP_API_BASE = 'http://localhost:5000/api';

export default function ThongKeBaoCao() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    revenue: {
      value: '0 đ',
      change: '0% so với kỳ trước',
      trend: 'neutral'
    },
    orders: {
      value: '0',
      subtitle: 'Trung bình 0 đ/đơn'
    },
    newStudents: {
      value: '0',
      subtitle: 'Đã đăng kí trong kì'
    },
    activeCourses: {
      value: '0',
      subtitle: 'Trên tổng số 0'
    }
  });

  const token = React.useMemo(() => {
    try { return localStorage.getItem('admin_token') || ''; } catch { return ''; }
  }, []);

  const apiFetch = async (path, options = {}, useBackup = false) => {
    try {
      const baseUrl = useBackup ? BACKUP_API_BASE : API_BASE;
      console.log(`🔍 Gửi request đến: ${baseUrl}${path}`);
      
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
        cache: 'no-store',
        credentials: 'include',
      });
      
      if (res.status === 401 || res.status === 403) {
        console.error('⛔ Lỗi xác thực:', res.status);
        return null;
      }
      
      const data = await res.json().catch((err) => {
        console.error('❌ JSON parse error:', err);
        return null;
      });
      
      if (!res.ok) {
        console.error('❌ API Error:', res.status, data);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      
      if (!useBackup && error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network Error'))) {
        console.log('🔄 Thử lại với backup URL');
        return apiFetch(path, options, true);
      }
      
      return null;
    }
  };

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let endpoint = '';
        switch (selectedPeriod) {
          case 'day':
            endpoint = '/admin/reports/revenue/daily';
            break;
          case 'month':
            endpoint = '/admin/reports/revenue/monthly';
            break;
          case 'year':
            endpoint = '/admin/reports/revenue/quarterly';
            break;
          default:
            endpoint = '/admin/reports/revenue/monthly';
        }
        
        const reportRes = await apiFetch(endpoint);
        
        if (reportRes) {
          const periodParam = selectedPeriod === 'year' ? 'quarter' : selectedPeriod;
          const overviewRes = await apiFetch(`/admin/revenue/overview?period=${periodParam}`);
          const combined = overviewRes && overviewRes.Summary
            ? { ...reportRes, Summary: overviewRes.Summary }
            : reportRes;
          setReportData(combined);
          processReportData(combined);
        } else {
          // Sử dụng dữ liệu mẫu nếu API không hoạt động
          useMockData();
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu báo cáo:', err);
        setError('Không thể tải dữ liệu báo cáo. Vui lòng thử lại sau.');
        // Sử dụng dữ liệu mẫu khi có lỗi
        useMockData();
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, [selectedPeriod]);
  
  // Xử lý dữ liệu từ API
  const processReportData = (data) => {
    if (!data || !data.Data || !Array.isArray(data.Data)) {
      useMockData();
      return;
    }
    
    // Xử lý dữ liệu biểu đồ
    const chartItems = data.Data.map(item => {
      let label = '';
      if (selectedPeriod === 'day') {
        const date = new Date(item.Date);
        label = `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (selectedPeriod === 'month') {
        label = `Tháng ${item.Month}`;
      } else {
        label = item.Label || `Q${item.Quarter}-${item.Year}`;
      }
      
      return {
        label,
        value: item.TotalAmount
      };
    });
    
    setChartData(chartItems);
    
    // Tính toán thống kê
    const totalRevenue = chartItems.reduce((sum, i) => sum + i.value, 0);
    const totalOrders = data.Summary?.TotalOrders ?? chartItems.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const newStudents = data.Summary?.NewStudentsCount ?? Math.round(totalOrders * 0.7);
    const activeCourses = data.Summary?.ActiveCourseCount ?? 12;
    
    // Cập nhật thống kê
    setStats({
      revenue: {
        value: `${formatCurrency(totalRevenue)} đ`,
        change: calculateChange(totalRevenue),
        trend: totalRevenue > 0 ? 'up' : 'neutral'
      },
      orders: {
        value: totalOrders.toString(),
        subtitle: `Trung bình ${formatCurrency(averageOrderValue)} đ/đơn`
      },
      newStudents: {
        value: newStudents.toString(),
        subtitle: 'Đã đăng kí trong kì'
      },
      activeCourses: {
        value: activeCourses.toString(),
        subtitle: `Trên tổng số ${Math.round(totalOrders * 0.7)}`
      }
    });
  };
  
  // Dữ liệu mẫu khi không có API
  const useMockData = () => {
    let mockChartData = [];
    
    if (selectedPeriod === 'day') {
      mockChartData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          value: Math.floor(Math.random() * 1000000) + 500000
        };
      });
    } else if (selectedPeriod === 'month') {
      mockChartData = Array.from({ length: 7 }, (_, i) => ({
        label: `T${i + 1}`,
        value: Math.floor(Math.random() * 5000000) + 2000000
      }));
    } else {
      mockChartData = Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - (4 - i);
        return {
          label: year.toString(),
          value: Math.floor(Math.random() * 20000000) + 10000000
        };
      });
    }
    
    setChartData(mockChartData);
    
    const totalRevenue = mockChartData.reduce((sum, item) => sum + item.value, 0);
    
    setStats({
      revenue: {
        value: `${formatCurrency(totalRevenue)} đ`,
        change: '+15% so với kỳ trước',
        trend: 'up'
      },
      orders: {
        value: '124',
        subtitle: '16 đơn hàng mới trong kỳ này',
      },
      newStudents: {
        value: '48',
        subtitle: '11 học viên mới trong kỳ này',
      },
      activeCourses: {
        value: '12',
        subtitle: '2 khóa học mới trong kỳ này',
      }
    });
    
    return { chartData: mockChartData, stats };
  };
  
  // Hàm định dạng tiền tệ
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };
  
  // Tính toán phần trăm thay đổi
  const calculateChange = (currentValue, previousValue = 0) => {
    if (previousValue === 0) return '0% so với kỳ trước';
    const change = ((currentValue - previousValue) / previousValue) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}% so với kỳ trước`;
  };

  const maxValue = chartData.length > 0 ? Math.max(...chartData.map(item => item.value)) : 0;

  return (
    <AdminLayout 
      title="Thống kê & Báo cáo"
      description="Tổng quan doanh thu và hiệu suất kinh doanh"
    >
      {loading ? (
        <div className="loading-indicator">Đang tải dữ liệu báo cáo...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="stats-grid">
            {/* Revenue Card */}
            <div className="stat-card revenue-card">
              <div className="stat-header">
                <div className="stat-icon revenue-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="stat-title">Tổng doanh thu</span>
              </div>
              <div className="stat-value">{stats.revenue.value}</div>
              <div className={`stat-change ${stats.revenue.trend === 'up' ? 'positive' : stats.revenue.trend === 'down' ? 'negative' : 'neutral'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 14L12 9L17 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {stats.revenue.change}
              </div>
            </div>

            {/* Orders Card */}
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon orders-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 17.6 17.4 18 18 18S19 17.6 19 17V13M9 19.5C9.8 19.5 10.5 20.2 10.5 21S9.8 22.5 9 22.5 7.5 21.8 7.5 21 8.2 19.5 9 19.5ZM20 19.5C20.8 19.5 21.5 20.2 21.5 21S20.8 22.5 20 22.5 18.5 21.8 18.5 21 19.2 19.5 20 19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21M12.5 11C14.9853 11 17 8.98528 17 6.5C17 4.01472 14.9853 2 12.5 2C10.0147 2 8 4.01472 8 6.5C8 8.98528 10.0147 11 12.5 11ZM22 11C22 13.2091 20.2091 15 18 15C15.7909 15 14 13.2091 14 11C14 8.79086 15.7909 7 18 7C20.2091 7 22 8.79086 22 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <path d="M2 3H8C9.06087 3 10.0783 3.42143 10.8284 4.17157C11.5786 4.92172 12 5.93913 12 7V21C12 20.2044 11.6839 19.4413 11.1213 18.8787C10.5587 18.3161 9.79565 18 9 18H2V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 3H16C14.9391 3 13.9217 3.42143 13.1716 4.17157C12.4214 4.92172 12 5.93913 12 7V21C12 20.2044 12.3161 19.4413 12.8787 18.8787C13.4413 18.3161 14.2044 18 15 18H22V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-info">
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color"></span>
                    Doanh thu: {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))} đ
                  </span>
                  <span className="legend-item">
                    <span className="legend-color"></span>
                    Đơn hàng: {stats.orders.value}
                  </span>
                  <span className="legend-item">
                    <span className="legend-color"></span>
                    Học viên: {stats.newStudents.value}
                  </span>
                </div>
              </div>

              <div className="chart-wrapper">
                <div className="chart-y-axis">
                  <span>{formatCurrency(maxValue)}</span>
                  <span>{formatCurrency(maxValue * 0.8)}</span>
                  <span>{formatCurrency(maxValue * 0.6)}</span>
                  <span>{formatCurrency(maxValue * 0.4)}</span>
                  <span>{formatCurrency(maxValue * 0.2)}</span>
                  <span>0</span>
                </div>
                
                <div className="chart-area">
                  <svg className="revenue-chart" viewBox="0 0 800 300">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05"/>
                      </linearGradient>
                    </defs>
                    
                    {/* Chart Line */}
                    {chartData.length > 0 && (
                      <path
                        d={`M 50 ${300 - (chartData[0].value / maxValue) * 250} ${chartData.map((item, index) => 
                          `L ${50 + (index * 60)} ${300 - (item.value / maxValue) * 250}`
                        ).join(' ')}`}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    
                    {/* Chart Area */}
                    {chartData.length > 0 && (
                      <path
                        d={`M 50 300 L 50 ${300 - (chartData[0].value / maxValue) * 250} ${chartData.map((item, index) => 
                          `L ${50 + (index * 60)} ${300 - (item.value / maxValue) * 250}`
                        ).join(' ')} L ${50 + ((chartData.length - 1) * 60)} 300 Z`}
                        fill="url(#areaGradient)"
                      />
                    )}
                    
                    {/* Data Points */}
                    {chartData.map((item, index) => (
                      <circle
                        key={index}
                        cx={50 + (index * 60)}
                        cy={300 - (item.value / maxValue) * 250}
                        r="4"
                        fill="#3b82f6"
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    ))}
                  </svg>
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
        </>
      )}
      </AdminLayout>
    );
  }