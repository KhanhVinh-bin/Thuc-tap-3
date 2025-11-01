'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminTopbar from '../components/AdminTopbar';

import './qlydonhang.css';
import Swal from 'sweetalert2';

export default function QuanLyDonHangPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

  // Thay dữ liệu mẫu bằng state từ API
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    TotalRevenue: 0,
    PendingPayments: 0,
    CompletedOrders: 0,
    PendingInstructorPayouts: 0
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://localhost:7166';
  const getToken = () =>
    typeof window !== 'undefined'
      ? (localStorage.getItem('admin_token') ||
         localStorage.getItem('token') ||
         sessionStorage.getItem('admin_token') ||
         sessionStorage.getItem('auth_token'))
      : null;

  async function apiFetch(path, options = {}) {
    const token = getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
    const res = await fetch(`${API_BASE}/api/admin/orders${path}`, {
      ...options,
      headers,
      cache: 'no-store',
      mode: 'cors'
    });
    if (!res.ok) {
      // Nếu chưa đăng nhập admin, điều hướng về trang đăng nhập
      if (res.status === 401) {
        Swal.fire('Yêu cầu đăng nhập', 'Vui lòng đăng nhập tài khoản Admin', 'warning');
        // chờ người dùng đóng alert rồi chuyển hướng
        setTimeout(() => {
          window.location.href = '/admin-login';
        }, 800);
      }
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json();
  }

  useEffect(() => {
    (async () => {
      try {
        const [list, stats] = await Promise.all([
          apiFetch(''),
          apiFetch('/summary')
        ]);

        const normalized = (list || []).map(o => ({
          id: o.OrderId,
          studentName: o.Student || '',
          studentEmail: o.StudentEmail || '',
          course: Array.isArray(o.Courses) && o.Courses.length ? o.Courses[0] : 'N/A',
          courseBy: Array.isArray(o.Instructors) && o.Instructors.length ? `GV: ${o.Instructors[0]}` : '',
          price: (o.Price ?? 0).toLocaleString('vi-VN'),
          paymentStatus: o.PaymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán',
          courseStatus: o.CourseStatus === 'Completed' ? 'Hoàn thành' : 'Đang học',
          date: o.CreatedAt ? new Date(o.CreatedAt).toLocaleDateString('vi-VN') : ''
        }));

        setOrders(normalized);
        setSummary(stats || { TotalRevenue: 0, PendingPayments: 0, CompletedOrders: 0, PendingInstructorPayouts: 0 });
      } catch (err) {
        Swal.fire('Lỗi', 'Không tải được dữ liệu đơn hàng', 'error');
      }
    })();
  }, []);

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'status-paid';
      case 'Chờ thanh toán':
        return 'status-pending';
      case 'Thất bại':
        return 'status-failed';
      default:
        return '';
    }
  };

  const getCourseStatusClass = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'status-completed';
      case 'Đang học':
        return 'status-learning';
      case 'Chưa bắt đầu':
        return 'status-not-started';
      default:
        return '';
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h1>Quản lý đơn hàng</h1>
        <p>Quản lý đơn hàng, xác nhận thanh toán và chi trả giảng viên</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card revenue">
          <div className="stat-content">
            <h3>Tổng doanh thu</h3>
            <div className="stat-value">{summary.TotalRevenue.toLocaleString('vi-VN')}</div>
          </div>
        </div>
        <div className="stat-card pending-payment">
          <div className="stat-content">
            <h3>Chờ thanh toán</h3>
            <div className="stat-value">{summary.PendingPayments}</div>
          </div>
        </div>
        <div className="stat-card completed-courses">
          <div className="stat-content">
            <h3>Khóa học hoàn thành</h3>
            <div className="stat-value">{summary.CompletedOrders}</div>
          </div>
        </div>
        <div className="stat-card pending-instructor">
          <div className="stat-content">
            <h3>Chờ chi trả GV</h3>
            <div className="stat-value">{summary.PendingInstructorPayouts}</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="controls-section">
        <div className="search-controls">
          <div className="main-search">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo mã đơn, học viên, khóa học,..."
              className="main-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select 
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>Tất cả trạng thái</option>
              <option>Đã thanh toán</option>
              <option>Chờ thanh toán</option>
              <option>Thất bại</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="filter-group">
            <select className="filter-select">
              <option>Tất cả trạng thái</option>
              <option>Hoàn thành</option>
              <option>Đang học</option>
              <option>Chưa bắt đầu</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Order Count */}
      <div className="order-count">
        <span>Danh sách đơn hàng ({orders.length})</span>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Học viên</th>
              <th>Tiêu đề</th>
              <th>Giá</th>
              <th>TT Thanh toán</th>
              <th>TT Khóa học</th>
              <th>Ngày đặt</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <div className="instructor-info">
                    <div className="instructor-name">{order.studentName}</div>
                    <div className="instructor-email">{order.studentEmail}</div>
                  </div>
                </td>
                <td>
                  <div className="course-info">
                    <div className="course-name">{order.course}</div>
                    <div className="course-by">{order.courseBy}</div>
                  </div>
                </td>
                <td className="price">{order.price}</td>
                <td>
                  <span className={`status-badge ${getPaymentStatusClass(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getCourseStatusClass(order.courseStatus)}`}>
                    {order.courseStatus}
                  </span>
                </td>
                <td>{order.date}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon btn-view"
                      title="Xem chi tiết"
                      onClick={() => router.push(`/admin/qlydonhang/chitietdonhang?id=${order.id}`)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}