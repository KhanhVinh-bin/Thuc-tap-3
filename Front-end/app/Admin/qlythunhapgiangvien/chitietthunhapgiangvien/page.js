'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import './chitietqlythunhapgiangvien.css';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function InstructorIncomeDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instructorId = searchParams.get('id');

  // Sample data - trong thực tế sẽ lấy từ API
  const [incomeData, setIncomeData] = useState({
    instructor: {
      id: 'GV001',
      name: 'TS. Đặng Quang Thành',
      avatar: '/placeholder-user.jpg'
    },
    course: {
      id: 'CRE001',
      name: 'Khóa học React',
      enrolledStudents: 142
    },
    statistics: {
      totalRevenue: 21000000,
      totalIncome: 14700000,
      paid: 14700000,
      pending: 0
    },
    revenueBreakdown: {
      courseRevenue: 39760000,
      instructorCommission: 27832000, // 70%
      platformFee: 11928000 // 30%
    }
  });

  // Hàm format số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Hàm quay lại trang danh sách
  const handleGoBack = () => {
    router.push('/admin/qlythunhapgiangvien');
  };

  // Hàm xuất Excel
  const handleExportExcel = () => {
    try {
      // Tạo dữ liệu cho Excel
      const excelData = [
        ['BÁO CÁO THU NHẬP GIẢNG VIÊN', '', '', ''],
        ['', '', '', ''],
        ['Thông tin giảng viên:', '', '', ''],
        ['Tên giảng viên:', incomeData.instructor.name, '', ''],
        ['Mã giảng viên:', incomeData.instructor.id, '', ''],
        ['', '', '', ''],
        ['Thông tin khóa học:', '', '', ''],
        ['Mã khóa học:', incomeData.course.id, '', ''],
        ['Tên khóa học:', incomeData.course.name, '', ''],
        ['Số học viên đã đăng ký:', incomeData.course.enrolledStudents, '', ''],
        ['', '', '', ''],
        ['Thống kê thu nhập:', '', '', ''],
        ['Tổng doanh thu:', formatCurrency(incomeData.statistics.totalRevenue) + 'đ', '', ''],
        ['Tổng thu nhập:', formatCurrency(incomeData.statistics.totalIncome) + 'đ', '', ''],
        ['Đã chi trả:', formatCurrency(incomeData.statistics.paid) + 'đ', '', ''],
        ['Chờ chi trả:', formatCurrency(incomeData.statistics.pending) + 'đ', '', ''],
        ['', '', '', ''],
        ['Phân bổ doanh thu:', '', '', ''],
        ['Doanh thu từ khóa học:', formatCurrency(incomeData.revenueBreakdown.courseRevenue) + 'đ', '', ''],
        ['Hoa hồng giảng viên (70%):', formatCurrency(incomeData.revenueBreakdown.instructorCommission) + 'đ', '', ''],
        ['Phí nền tảng (30%):', formatCurrency(incomeData.revenueBreakdown.platformFee) + 'đ', '', '']
      ];

      // Tạo workbook và worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);

      // Thiết lập độ rộng cột
      ws['!cols'] = [
        { width: 25 },
        { width: 20 },
        { width: 15 },
        { width: 15 }
      ];

      // Thêm worksheet vào workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Thu nhập giảng viên');

      // Xuất file
      const fileName = `Thu_nhap_${incomeData.instructor.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      // Hiển thị thông báo thành công
      Swal.fire({
        title: 'Xuất Excel thành công!',
        text: `File ${fileName} đã được tải xuống.`,
        icon: 'success',
        confirmButtonColor: '#16a34a'
      });

    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi xuất file Excel.',
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  return (
    <AdminLayout 
      title="Thu nhập giảng viên"
      description="Chi tiết thu nhập của giảng viên"
    >
      {/* Header với nút quay lại và xuất Excel */}
      <div className="income-header">
        <div className="header-left">
          <button className="back-button" onClick={handleGoBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="header-info">
            <h1>Thu nhập giảng viên</h1>
            <p>{incomeData.instructor.name}</p>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={handleExportExcel}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Xuất báo cáo Excel
        </button>
      </div>

      {/* Thẻ thống kê */}
      <div className="statistics-cards">
        <div className="stat-card total-revenue">
          <div className="stat-label">Tổng doanh thu</div>
          <div className="stat-value">{formatCurrency(incomeData.statistics.totalRevenue)}</div>
        </div>
        <div className="stat-card total-income">
          <div className="stat-label">Tổng thu nhập</div>
          <div className="stat-value">{formatCurrency(incomeData.statistics.totalIncome)}</div>
        </div>
        <div className="stat-card paid">
          <div className="stat-label">Đã chi trả</div>
          <div className="stat-value">{formatCurrency(incomeData.statistics.paid)}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">Chờ chi trả</div>
          <div className="stat-value">{formatCurrency(incomeData.statistics.pending)}</div>
        </div>
      </div>

      {/* Nội dung chính */}
      <div className="detail-content">
        {/* Thông tin khóa học */}
        <div className="card course-info-section">
          <div className="card-header">
            {/* Icon màn hình giống ảnh mẫu */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 16v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <h3>Thông tin khóa học</h3>
          </div>
          {/* Grid hai cột cho thông tin khóa học */}
          <div className="card-content">
            <div className="detail-grid">
              <div className="detail-item-row">
                <div className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="detail-text">
                  <label>Mã khóa học</label>
                  <span>{incomeData.course.id}</span>
                </div>
              </div>

              <div className="detail-item-row">
                <div className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="detail-text">
                  <label>Giảng viên</label>
                  <span>{incomeData.instructor.name}</span>
                </div>
              </div>

              <div className="detail-item-row">
                <div className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="detail-text">
                  <label>Tên khóa học</label>
                  <span>{incomeData.course.name}</span>
                </div>
              </div>

              <div className="detail-item-row">
                <div className="detail-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 10h14l4 6H7l-4-6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="detail-text">
                  <label>Số học viên đã đăng ký</label>
                  <span>{incomeData.course.enrolledStudents} học viên</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Phân bổ doanh thu */}
        <div className="card revenue-breakdown-section">
          <div className="card-header">
            {/* Ký hiệu $ giống ảnh mẫu */}
            <span className="section-icon">$</span>
            <h3>Phân bổ doanh thu</h3>
          </div>
          <div className="card-content revenue-details">
            {/* Tổng doanh thu */}
            <div className="revenue-summary">
              <label>Doanh thu từ khóa học</label>
              <span>{formatCurrency(incomeData.revenueBreakdown.courseRevenue)}đ</span>
            </div>
            {/* Hai box phần trăm */}
            <div className="revenue-grid">
              <div className="revenue-box commission">
                <div className="box-header">
                  <h4>Hoa hồng giảng viên</h4>
                  <span className="percent-badge">70%</span>
                </div>
                <div className="amount">{formatCurrency(incomeData.revenueBreakdown.instructorCommission)}đ</div>
              </div>
              <div className="revenue-box platform-fee">
                <div className="box-header">
                  <h4>Phí nền tảng</h4>
                  <span className="percent-badge green">30%</span>
                </div>
                <div className="amount green">{formatCurrency(incomeData.revenueBreakdown.platformFee)}đ</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}