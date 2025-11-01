'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './qlydonhang.css';
import Swal from 'sweetalert2';

export default function OrderManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

  // Sample order data
  const orders = [
    {
      id: 'ORD001',
      instructor: 'Đặng Quang Thành',
      email: 'thanh12@gmail.com',
      course: 'Khóa học React',
      courseBy: 'GV: Đặng Quang Thành',
      price: '1.999.000 đ',
      paymentStatus: 'Đã thanh toán',
      courseStatus: 'Hoàn thành',
      date: '20/04/2024'
    },
    {
      id: 'ORD002',
      instructor: 'Nguyễn Hữu Tài',
      email: 'tai14@gmail.com',
      course: 'Lập trình Web',
      courseBy: 'GV: Nguyễn Hữu Tài',
      price: '1.499.000 đ',
      paymentStatus: 'Đã thanh toán',
      courseStatus: 'Đang học',
      date: '11/04/2024'
    },
    {
      id: 'ORD003',
      instructor: 'Nguyễn Hải Trường',
      email: 'truong12@gmail.com',
      course: 'Digital Marketing',
      courseBy: 'GV: Nguyễn Hải Trường',
      price: '999.000 đ',
      paymentStatus: 'Chờ thanh toán',
      courseStatus: 'Chưa bắt đầu',
      date: '13/04/2024'
    },
    {
      id: 'ORD004',
      instructor: 'Phan Bích Như',
      email: 'nhu12@gmail.com',
      course: 'Tất cả khóa học',
      courseBy: 'GV: Phan Bích Như',
      price: '1.899.000 đ',
      paymentStatus: 'Thất bại',
      courseStatus: 'Chưa bắt đầu',
      date: '25/03/2024'
    }
  ];

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
    <AdminLayout 
      title="Quản lý đơn hàng"
      description="Quản lý đơn hàng, xác nhận thanh toán và chi trả giảng viên"
    >
      {/* Stats Cards */}
      <div className="stats-grid">
            <div className="stat-card revenue">
              <div className="stat-content">
                <h3>Tổng doanh thu</h3>
                <div className="stat-value">9.300.000</div>
              </div>
            </div>
            <div className="stat-card pending-payment">
              <div className="stat-content">
                <h3>Chờ thanh toán</h3>
                <div className="stat-value">1</div>
              </div>
            </div>
            <div className="stat-card completed-courses">
              <div className="stat-content">
                <h3>Khóa học hoàn thành</h3>
                <div className="stat-value">2</div>
              </div>
            </div>
            <div className="stat-card pending-instructor">
              <div className="stat-content">
                <h3>Chờ chi trả GV</h3>
                <div className="stat-value">0</div>
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
                        <div className="instructor-name">{order.instructor}</div>
                        <div className="instructor-email">{order.email}</div>
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
                          className="icon-btn view-btn"
                          title="Xem chi tiết"
                          onClick={() => router.push('/admin/qlydonhang/chitietdonhang')}
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
      </AdminLayout>
    );
  }