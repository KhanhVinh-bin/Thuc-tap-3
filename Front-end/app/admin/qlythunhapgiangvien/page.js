'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './qlythunhapgiangvien.css';
import Swal from 'sweetalert2';

export default function InstructorIncomeManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [instructorFilter, setInstructorFilter] = useState('ALL');
  const [instructors, setInstructors] = useState([]);
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');

  // API config + auth
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

  // Fetch instructors for filter dropdown
  const fetchInstructors = async () => {
    try {
      const data = await apiFetch(`/admin/instructors`);
      const list = Array.isArray(data) ? data.map((i) => ({ ID: i.ID, Ten: i.Ten })) : [];
      setInstructors([{ ID: 'ALL', Ten: 'Tất cả giảng viên' }, ...list]);
    } catch (e) {
      console.error(e);
      setInstructors([{ ID: 'ALL', Ten: 'Tất cả giảng viên' }]);
    }
  };

  // Mapping helpers
  const mapStatusLabel = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'processed' || s === 'paid') return 'Đã chi trả';
    if (s === 'pending') return 'Chờ chi trả';
    return 'Không xác định';
  };
  const mapStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'processed' || s === 'paid') return '#10B981';
    if (s === 'pending') return '#F59E0B';
    return '#3B82F6';
  };
  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('vi-VN').format(Number(amount || 0));
    } catch {
      return `${amount}`;
    }
  };

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [instructorIncomes, setInstructorIncomes] = useState([]);

  // Fetch payouts list
  const fetchPayouts = async () => {
    setLoading(true);
    setError('');
    try {
      // Gọi API không truyền status để tránh lệch “processed/paid”
      const path = instructorFilter && instructorFilter !== 'ALL'
        ? `/api/admin/payouts?instructorId=${encodeURIComponent(instructorFilter)}`
        : `/api/admin/payouts`;
      const data = await apiFetch(path);

      const mapped = Array.isArray(data)
          ? data.map((p) => {
              const statusRaw = p.Status ?? p.status;
              const instructorObj = p.Instructor ?? p.instructor ?? {};
              return {
                  id: p.PayoutId ?? p.payoutId ?? p.id ?? instructorObj.InstructorId ?? instructorObj.instructorId ?? null,
                  instructor: instructorObj.FullName ?? instructorObj.fullName ?? 'N/A',
                  email: instructorObj.Email ?? instructorObj.email ?? 'N/A',
                  // Hiển thị Amount từ bảng Payouts thay vì CourseRevenue
                  revenue: formatCurrency(p.Amount ?? p.amount ?? p.PayoutAmount ?? p.payoutAmount),
                  // Phí gửi = 30% của Amount
                  fee: (() => {
                    const amountVal = Number(p.Amount ?? p.amount ?? p.PayoutAmount ?? p.payoutAmount ?? 0);
                    return formatCurrency(amountVal * 0.30);
                  })(),
                  // Chi trả = Amount - Phí gửi (30% của Amount)
                  payout: (() => {
                    const amountVal = Number(p.Amount ?? p.amount ?? p.PayoutAmount ?? p.payoutAmount ?? 0);
                    const feeVal = amountVal * 0.30;
                    return formatCurrency(amountVal - feeVal);
                  })(),
                  status: mapStatusLabel(statusRaw),
                  statusColor: mapStatusColor(statusRaw),
                  instructorId: instructorObj.InstructorId ?? instructorObj.instructorId ?? null,
                  _statusRaw: (statusRaw || '').toLowerCase(),
                };
              })
          : [];
  
      // Lọc client-side theo searchTerm
      const term = (searchTerm || '').toLowerCase();
      let filtered = term
          ? mapped.filter((i) =>
              [i.instructor, i.email].some((f) => (f || '').toLowerCase().includes(term))
            )
          : mapped;
  
      // Lọc client-side theo trạng thái để hỗ trợ cả “paid” lẫn “processed”
      if (statusFilter && statusFilter !== 'Tất cả trạng thái') {
          if (statusFilter === 'Đã chi trả') {
              filtered = filtered.filter((i) => i._statusRaw === 'paid' || i._statusRaw === 'processed');
          } else if (statusFilter === 'Chờ chi trả') {
              filtered = filtered.filter((i) => i._statusRaw === 'pending');
          }
      }
  
      setInstructorIncomes(filtered);
    } catch (e) {
      console.error(e);
      setError('Không thể tải danh sách thu nhập giảng viên');
      setInstructorIncomes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter, searchTerm, instructorFilter]);

  useEffect(() => {
    fetchInstructors();
  }, []);

  // View detail -> pass instructorId as query
  const handleViewDetails = (instructorId) => {
    if (!instructorId) {
      Swal.fire('Thiếu dữ liệu', 'Không có mã giảng viên để xem chi tiết', 'warning');
      return;
    }
    router.push(`/admin/qlythunhapgiangvien/chitietthunhapgiangvien?id=${instructorId}`);
  };

  // Summary cards computed from payouts
  const totals = useMemo(() => {
    const sum = (arr, pick) => arr.reduce((acc, x) => acc + (Number(pick(x)) || 0), 0);
    const totalRevenue = sum(instructorIncomes, (x) => x.revenue.replace(/[^\d]/g, ''));
    const totalIncome = sum(instructorIncomes, (x) => x.payout.replace(/[^\d]/g, ''));
    const paidAmount = sum(instructorIncomes.filter((x) => x.status === 'Đã chi trả'), (x) => x.payout.replace(/[^\d]/g, ''));
    const pendingAmount = sum(instructorIncomes.filter((x) => x.status === 'Chờ chi trả'), (x) => x.payout.replace(/[^\d]/g, ''));
    return {
      totalRevenue: formatCurrency(totalRevenue),
      totalIncome: formatCurrency(totalIncome),
      paidAmount: formatCurrency(paidAmount),
      pendingAmount: formatCurrency(pendingAmount),
    };
  }, [instructorIncomes]);

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
            <div className="stat-value">{totals.totalRevenue}</div>
          </div>
        </div>
        <div className="stat-card instructor-income">
          <div className="stat-content">
            <h3>Tổng thu nhập GV</h3>
            <div className="stat-value">{totals.totalIncome}</div>
          </div>
        </div>
        <div className="stat-card paid-amount">
          <div className="stat-content">
            <h3>Đã chi trả</h3>
            <div className="stat-value">{totals.paidAmount}</div>
          </div>
        </div>
        <div className="stat-card pending-payment">
          <div className="stat-content">
            <h3>Chờ chi trả</h3>
            <div className="stat-value">{totals.pendingAmount}</div>
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
              placeholder="Tìm kiếm theo tên giảng viên, email..."
              className="main-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-controls">
          {/* Instructor filter (optional UI) */}
          <div className="filter-group">
            <select 
              className="filter-select"
              value={instructorFilter}
              onChange={(e) => setInstructorFilter(e.target.value)}
            >
              {instructors.length === 0 ? (
                <option value="ALL">Tất cả giảng viên</option>
              ) : (
                instructors.map((inst) => (
                  <option key={inst.ID} value={inst.ID}>{inst.Ten}</option>
                ))
              )}
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
            </select>
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>
      </div>

      {/* Error/Loading */}
      {error && (
        <div style={{ marginBottom: 12, color: '#DC2626' }}>
          {error}
        </div>
      )}
      {loading && (
        <div style={{ marginBottom: 12, color: '#374151' }}>
          Đang tải dữ liệu...
        </div>
      )}

      {/* Income Count */}
      <div className="income-count">
        <span>Danh sách: {instructorIncomes.length} mục</span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Giảng viên</th>
              <th>Amount</th>
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
                    <span className="instructor-name">{income.instructor}</span>
                    <span className="instructor-email">{income.email}</span>
                  </div>
                </td>
                <td><span className="revenue">{income.revenue}</span></td>
                <td><span className="fee">{income.fee}</span></td>
                <td><span className="payout">{income.payout}</span></td>
                <td>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: income.statusColor }}
                  >
                    {income.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      title="Xem chi tiết"
                      onClick={() => handleViewDetails(income.instructorId)}
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