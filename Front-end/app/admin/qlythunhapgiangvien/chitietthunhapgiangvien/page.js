'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './chitietqlythunhapgiangvien.css';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

export default function InstructorIncomeDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const instructorId = searchParams.get('id');

  // Cấu hình API + Auth (Bearer token)
  const API_BASE = 'https://localhost:7166';
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
    });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        Swal.fire('Yêu cầu đăng nhập', 'Vui lòng đăng nhập tài khoản Admin', 'warning');
        setTimeout(() => {
          window.location.href = '/admin-login';
        }, 800);
      }
      const msg = await res.text().catch(() => '');
      throw new Error(msg || `HTTP ${res.status}`);
    }
    return res.json();
  };

  // Thay dữ liệu giả bằng state thực từ API
  const [incomeData, setIncomeData] = useState({
    instructor: { id: '', name: '', avatar: '/placeholder-user.jpg' },
    course: { id: 'ALL', name: 'Tất cả khóa học', enrolledStudents: 0 },
    statistics: { totalRevenue: 0, totalIncome: 0, paid: 0, pending: 0 },
    revenueBreakdown: { courseRevenue: 0, instructorCommission: 0, platformFee: 0 }
  });

  useEffect(() => {
    let cancelled = false;
    const loadDetail = async () => {
      if (!instructorId) {
        Swal.fire('Thiếu dữ liệu', 'Không có mã giảng viên', 'warning');
        return;
      }
      try {
        const data = await apiFetch(`/api/admin/payouts/instructor/${instructorId}`);
        if (cancelled || !data) return;

        const instructor = data.Instructor || data.instructor || {};
        const summary = data.Summary || data.summary || {};
        const payouts = data.PayoutHistory || data.payoutHistory || [];
        const courses = data.CourseRevenues || data.courseRevenues || [];

        const totalRevenue = Number(summary.TotalRevenue || summary.totalRevenue || 0);

        const paid = payouts
            .filter((p) => {
                const s = (p.Status || p.status || '').toLowerCase();
                return s === 'processed' || s === 'paid';
            })
            .reduce((acc, p) => acc + Number(p.NetAmount || p.netAmount || 0), 0);

        const pending = payouts
            .filter((p) => (p.Status || p.status || '').toLowerCase() === 'pending')
            .reduce((acc, p) => acc + Number(p.NetAmount || p.netAmount || 0), 0);

        const totalIncome = paid + pending;
        const platformFee = payouts.reduce((acc, p) => acc + Number(p.PlatformFee || p.platformFee || 0), 0);
        const enrolledStudents = courses.reduce((acc, c) => acc + Number(c.TotalOrders || c.totalOrders || 0), 0);

        setIncomeData({
            instructor: {
                id: instructor.InstructorId ?? instructor.instructorId ?? instructorId,
                name: instructor.FullName ?? instructor.fullName ?? 'Giảng viên',
                avatar: '/placeholder-user.jpg'
            },
            course: {
                id: 'ALL',
                name: 'Tất cả khóa học',
                enrolledStudents
            },
            statistics: {
                totalRevenue,
                totalIncome,
                paid,
                pending
            },
            revenueBreakdown: {
                courseRevenue: totalRevenue,
                instructorCommission: totalIncome,
                platformFee
            }
        });
      } catch (e) {
        console.error(e);
        Swal.fire('Lỗi', 'Không thể tải chi tiết thu nhập giảng viên', 'error');
      }
    };
    loadDetail();
    return () => { cancelled = true; };
  }, [instructorId]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleGoBack = () => {
    router.push('/admin/qlythunhapgiangvien');
  };

      const handleExportExcel = () => {
        try {
          const excelData = [
            ['BÁO CÁO THU NHẬP GIẢNG VIÊN'],
            [''],
            ['Thông tin giảng viên'],
            ['Tên giảng viên', incomeData.instructor.name],
            ['Mã giảng viên', incomeData.instructor.id],
            [''],
            ['Thông tin khóa học'],
            ['Học viên đăng ký', incomeData.course.enrolledStudents],
            [''],
            ['Thống kê thu nhập'],
            ['Tổng doanh thu', formatCurrency(incomeData.statistics.totalRevenue)],
            ['Tổng thu nhập', formatCurrency(incomeData.statistics.totalIncome)],
            ['Đã chi trả', formatCurrency(incomeData.statistics.paid)],
            ['Chờ chi trả', formatCurrency(incomeData.statistics.pending)],
          ];

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(excelData);
      ws['!cols'] = [{ width: 30 }, { width: 30 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Thu nhập');
      const fileName = `Thu_nhap_${incomeData.instructor.name.replace(/\s+/g, '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);

      Swal.fire({
        title: 'Xuất Excel thành công!',
        text: `File ${fileName} đã được tải xuống.`,
        icon: 'success'
      });
    } catch (error) {
      Swal.fire({
        title: 'Lỗi!',
        text: 'Không thể xuất Excel!',
        icon: 'error'
      });
    }
  };

  return (
    <>
      <div className="income-header">
        <div className="header-left">
          <button className="back-button" onClick={handleGoBack}>
            ←
          </button>
          <div className="header-info">
            <h1>Thu nhập giảng viên</h1>
            <p>{incomeData.instructor.name}</p>
          </div>
        </div>

        <button className="export-button" onClick={handleExportExcel}>
          🧾 <span>Xuất Excel</span>
        </button>
      </div>

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

      <div className="detail-content">
        <div className="card course-info-section">
          <div className="section-header">
            <span className="section-icon">📘</span>
            <h3>Thông tin khóa học</h3>
          </div>

          <div className="course-details">
            <div className="detail-grid">
              <div className="detail-item-row">
                <div className="detail-icon">👨‍🏫</div>
                <div className="detail-text">
                  <label>Giảng viên</label>
                  <span>{incomeData.instructor.name}</span>
                </div>
              </div>

              <div className="detail-item-row">
                <div className="detail-icon">👥</div>
                <div className="detail-text">
                  <label>Số học viên</label>
                  <span>{incomeData.course.enrolledStudents} học viên</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card revenue-breakdown-section">
          <div className="section-header">
            <span className="section-icon">💰</span>
            <h3>Phân bổ doanh thu</h3>
          </div>

          {(() => {
            const total = Number(incomeData.revenueBreakdown.courseRevenue || 0) || 0;
            const commission = Number(incomeData.revenueBreakdown.instructorCommission || 0) || 0;
            const commissionPct = total > 0 ? Math.round((commission / total) * 100) : 0;
            const platformFee = Number(incomeData.revenueBreakdown.platformFee || 0) || 0;
            const feePct = total > 0 ? Math.round((platformFee / total) * 30) : 0;
            return (
              <div className="revenue-details">
                <div className="revenue-summary">
                  <label>Tổng doanh thu khóa học</label>
                  <span>{formatCurrency(total)} ₫</span>
                </div>
                <div className="revenue-grid">
                  <div className="revenue-box">
                    <div className="box-header">
                      <h4>Hoa hồng giảng viên</h4>
                      <span className={`percent-badge ${commissionPct >= 0 ? 'green' : ''}`}>{commissionPct}%</span>
                    </div>
                    <div className="amount">{formatCurrency(commission)} ₫</div>
                  </div>
                  <div className="revenue-box">
                    <div className="box-header">
                      <h4>Phí gửi nền tảng</h4>
                      <span className={`percent-badge ${feePct >= 0 ? 'green' : ''}`}>{feePct}%</span>
                    </div>
                    <div className="amount">{formatCurrency(platformFee)} ₫</div>
                  </div>
                  <div className="revenue-box">
                    <div className="box-header">
                      <h4>Doanh thu khóa học</h4>
                      <span className="percent-badge">100%</span>
                    </div>
                    <div className="amount">{formatCurrency(total)} ₫</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
