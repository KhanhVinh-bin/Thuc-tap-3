'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './qlythunhapgiangvien.css';
import Swal from 'sweetalert2';

export default function InstructorIncomeManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('Tất cả giảng viên');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

  // Function to handle view details
  const handleViewDetails = (instructorId) => {
    router.push('/admin/qlythunhapgiangvien/chitietthunhapgiangvien');
  };

  // Sample instructor income data
  const instructorIncomes = [
    {
      id: 1,
      instructor: 'TS. Đặng Quang Thành',
      email: 'thanh2@gmail.com',
      course: 'Khóa học React',
      revenue: '12.500.000đ',
      commission: '70%',
      fee: '30%',
      payout: '8.750.000đ',
      status: 'Đã chi trả',
      statusColor: '#10B981'
    },
    {
      id: 2,
      instructor: 'ThS. Nguyễn Hữu Tài',
      email: 'tai14@gmail.com',
      course: 'Lập trình Web',
      revenue: '9.000.000đ',
      commission: '70%',
      fee: '30%',
      payout: '6.300.000đ',
      status: 'Chờ chi trả',
      statusColor: '#F59E0B'
    },
    {
      id: 3,
      instructor: 'KS. Nguyễn Hải Trường',
      email: 'truong12@gmail.com',
      course: 'Digital Marketing',
      revenue: '11.000.000đ',
      commission: '70%',
      fee: '30%',
      payout: '7.700.000đ',
      status: 'Đang xử lý',
      statusColor: '#3B82F6'
    },
    {
      id: 4,
      instructor: 'TS. Phan Bích Như',
      email: 'nhu12@gmail.com',
      course: 'Tất cả khóa học',
      revenue: '16.000.000đ',
      commission: '70%',
      fee: '30%',
      payout: '11.200.000đ',
      status: 'Đã chi trả',
      statusColor: '#10B981'
    }
  ];

  return (
    <AdminLayout 
      title="Quản lý thu nhập giảng viên"
      description="Quản lý hoa hồng, chi trả và báo cáo thu nhập cho giảng viên"
    >
      {/* Stats Cards */}
      <div className="stats-grid">
            <div className="stat-card total-revenue">
              <div className="stat-content">
                <h3>Tổng doanh thu</h3>
                <div className="stat-value">71.000.000</div>
              </div>
            </div>
            <div className="stat-card instructor-income">
              <div className="stat-content">
                <h3>Tổng thu nhập GV</h3>
                <div className="stat-value">49.700.000</div>
              </div>
            </div>
            <div className="stat-card paid-amount">
              <div className="stat-content">
                <h3>Đã chi trả</h3>
                <div className="stat-value">24.500.000</div>
              </div>
            </div>
            <div className="stat-card pending-payment">
              <div className="stat-content">
                <h3>Chờ chi trả</h3>
                <div className="stat-value">17.500.000</div>
              </div>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="controls-section">
            <div className="search-controls">
              <div className="main-search">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Tìm kiếm theo giảng viên, khóa học..."
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
                  value={instructorFilter}
                  onChange={(e) => setInstructorFilter(e.target.value)}
                >
                  <option>Tất cả giảng viên</option>
                  <option>TS. Đặng Quang Thành</option>
                  <option>ThS. Nguyễn Hữu Tài</option>
                  <option>KS. Nguyễn Hải Trường</option>
                  <option>TS. Phan Bích Như</option>
                </select>
                <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div className="filter-group">
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>Tất cả trạng thái</option>
                  <option>Đã chi trả</option>
                  <option>Chờ chi trả</option>
                  <option>Đang xử lý</option>
                </select>
                <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Income Count */}
          <div className="income-count">
            <span>Danh sách chi trả ({instructorIncomes.length})</span>
          </div>

          {/* Instructor Income Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Giảng viên</th>
                  <th>Khóa học</th>
                  <th>Doanh thu</th>
                  <th>Hoa hồng</th>
                  <th>Phí gửi</th>
                  <th>Chi trả</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {instructorIncomes.map((income) => (
                  <tr key={income.id}>
                    <td>
                      <div className="instructor-info">
                        <div className="instructor-name">{income.instructor}</div>
                        <div className="instructor-email">{income.email}</div>
                      </div>
                    </td>
                    <td className="course-name">{income.course}</td>
                    <td className="revenue">{income.revenue}</td>
                    <td className="commission">{income.commission}</td>
                    <td className="fee">{income.fee}</td>
                    <td className="payout">{income.payout}</td>
                    <td>
                      <span 
                        className="status-badge" 
                        style={{backgroundColor: income.statusColor}}
                      >
                        {income.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="icon-btn view-btn"
                          title="Xem chi tiết"
                          onClick={() => handleViewDetails(income.id)}
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