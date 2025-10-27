'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import Swal from 'sweetalert2';
import LockIcon from '../giangvien/LockIcon';
import './sinhvien.css';
import { useEffect, useState } from 'react';

export default function StudentManagement() {
  const router = useRouter();
  
  const handleViewStudent = (studentId) => {
    router.push(`/admin/sinhvien/chitietsinhvien?id=${studentId}`);
  };

  const normalizeStatus = (s) => {
    const t = String(s || '').trim().toLowerCase();
    if (!t) return '';
    if (t === 'locked' || t === 'block' || t === 'banned') return 'inactive';
    return t;
  };
  const mapStatusToVi = (s) => {
    switch (normalizeStatus(s)) {
      case 'active': return 'Hoạt động';
      case 'inactive': return 'Bị khóa';
      case 'pending': return 'Đang chờ';
      default: return 'Không xác định';
    }
  };

  const handleUpdateStatus = async (studentId, newStatus) => {
    const statusNorm = normalizeStatus(newStatus);
    if (!['active', 'inactive', 'pending'].includes(statusNorm)) {
      await Swal.fire({ title: 'Lỗi', text: 'Trạng thái không hợp lệ', icon: 'error' });
      return;
    }
    const result = await Swal.fire({
      title: 'Cập nhật trạng thái?',
      text: `Bạn có chắc muốn đặt trạng thái thành "${mapStatusToVi(statusNorm)}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Cập nhật',
      cancelButtonText: 'Hủy'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/admin/students/${studentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: statusNorm })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Không thể cập nhật trạng thái');
      }
      await Swal.fire({ title: 'Thành công', text: 'Đã cập nhật trạng thái', icon: 'success' });
      fetchStudents();
    } catch (err) {
      await Swal.fire({ title: 'Lỗi', text: err.message || 'Cập nhật trạng thái thất bại', icon: 'error' });
    }
  };

const handleToggleLockAccount = async (studentId) => {
  const student = students.find(s => s.id === studentId);
  const studentName = student ? student.name : `ID ${studentId}`;

  // Lấy trạng thái hiện tại từ dữ liệu đã map
  let currentStatus = student && (student.isLocked ? 'inactive' : 'active');
  try {
    const dRes = await apiFetch(`/admin/students/${studentId}`);
    if (dRes.ok) {
      const d = await dRes.json();
      const dStatus = normalizeStatus(d.Status ?? d.status ?? d.TrangThai);
      if (dStatus) currentStatus = dStatus; // active | inactive | pending
    }
  } catch {}

  // Xác định đang bị khóa khi trạng thái chuẩn hóa là inactive
  const isCurrentlyLocked = normalizeStatus(currentStatus) === 'inactive';
  const action = isCurrentlyLocked ? 'mở khóa' : 'khóa';
  const actionTitle = isCurrentlyLocked ? 'Mở khóa' : 'Khóa';
  const confirmTitle = isCurrentlyLocked ? 'Xác nhận mở tài khoản' : 'Xác nhận khóa tài khoản';

  const result = await Swal.fire({
    title: `${confirmTitle}`,
    text: `Bạn có chắc chắn muốn ${action} tài khoản của sinh viên "${studentName}"?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: isCurrentlyLocked ? '#28a745' : '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: actionTitle,
    cancelButtonText: 'Hủy'
  });

  if (result.isConfirmed) {
    try {
      const res = await apiFetch(`/admin/students/${studentId}/lock`, { method: 'PATCH' });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Không thể cập nhật trạng thái');
      }
      await Swal.fire({
        title: `Đã ${action}!`,
        text: `Tài khoản của ${studentName} đã được ${action}.`,
        icon: 'success'
      });
      fetchStudents();
    } catch (err) {
      await Swal.fire({
        title: 'Lỗi',
        text: err.message || `Không thể ${action} tài khoản. Vui lòng thử lại.`,
        icon: 'error'
      });
    }
  }
};

  const handleDeleteAccount = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    const studentName = student ? student.name : `ID ${studentId}`;

    const result = await Swal.fire({
      title: `Xóa tài khoản "${studentName}"?`,
      text: `Bạn có chắc chắn muốn xóa tài khoản của sinh viên "${studentName}"? Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        const res = await apiFetch(`/admin/students/${studentId}`, { method: 'DELETE' });
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Xóa thất bại');
        }
        await Swal.fire({
          title: 'Đã xóa!',
          text: `Tài khoản của ${studentName} đã được xóa.`,
          icon: 'success'
        });
        fetchStudents();
      } catch (err) {
        await Swal.fire({
          title: 'Lỗi',
          text: err.message || 'Không thể xóa tài khoản. Vui lòng thử lại.',
          icon: 'error'
        });
      }
    }
  };
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
      ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    return fetch(`${API_BASE}${path}` , {
      ...options,
      headers,
      cache: 'no-store',
      mode: 'cors',
    });
  };

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [dateRange, setDateRange] = useState('Tất cả');

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (statusFilter === 'Hoạt động') params.set('status', 'active');
    else if (statusFilter === 'Bị khóa') params.set('status', 'inactive');
    else if (statusFilter === 'Đang chờ') params.set('status', 'pending');
    if (dateRange === '7 ngày qua' || dateRange === '30 ngày qua') {
      const days = dateRange === '7 ngày qua' ? 7 : 30;
      const now = new Date();
      const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      params.set('createdFrom', from.toISOString());
      params.set('createdTo', now.toISOString());
    }
    return params.toString();
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = buildQuery();
      const res = await apiFetch(`/admin/students/danhsachsinhvien${qs ? `?${qs}` : ''}`);
      if (res.status === 401 || res.status === 403) {
        setError('Vui lòng đăng nhập tài khoản Admin để xem danh sách.');
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Lỗi tải danh sách (${res.status})`);
      }
      const list = await res.json();

      const getId = (u) => (
        (u && (u.ID ?? u.Id ?? u.id ?? u.UserId ?? u.UserID ?? u.StudentId ?? u.SinhVienId ?? u.MaSV)) || null
      );

      const mapped = list
        .map((u) => {
          const id = getId(u);
          if (!id) return null;
          const name = u.ten ?? u.Ten ?? u.FullName ?? u.Name ?? u.HoTen ?? '';
          const email = u.email ?? u.Email ?? u.Mail ?? '';
          const createdRaw = u.ngayTao ?? u.NgayTao ?? u.CreatedAt ?? u.CreateDate ?? u.NgayTaoSinhVien ?? null;
          const createdDate = createdRaw ? new Date(createdRaw).toLocaleDateString('vi-VN') : '';
          const statusRaw = u.status ?? u.Status ?? u.StatusNormalized ?? u.TrangThai ?? '';
          const statusNorm = normalizeStatus(statusRaw);
          const isLocked = (u.IsLocked ?? u.isLocked ?? (statusNorm === 'inactive')) ? true : false;
          return {
            id,
            name,
            email,
            createdDate,
            status: mapStatusToVi(statusNorm),
            statusRaw: statusNorm,
            isLocked,
          };
        })
        .filter(Boolean);

      setStudents(mapped);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(), 300);
    return () => clearTimeout(t);
  }, [keyword, statusFilter, dateRange]);

  return (
    <AdminLayout 
      title="Quản lý sinh viên"
      description="Quản lý thông tin và các hoạt động của sinh viên"
    >
      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-controls">
          <div className="main-search">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email hoặc mã sinh viên,..."
              className="main-search-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Tất cả trạng thái</option>
              <option>Hoạt động</option>
              <option>Bị khóa</option>
              <option>Đang chờ</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="filter-group">
            <select className="filter-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option>Tất cả</option>
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Student Count */}
      <div className="student-count">
        <span>Danh sách sinh viên ({students.length})</span>
      </div>

      {/* Student Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Mã SV</th>
              <th>Tên sinh viên</th>
              <th>Email</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="6">Đang tải...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan="6" style={{ color: 'red' }}>{error}</td></tr>
            )}
            {!loading && !error && students.length === 0 && (
              <tr><td colSpan="6">Không có dữ liệu</td></tr>
            )}
            {!loading && !error && students.map((student, i) => (
              <tr key={student.id || student.email || i}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.createdDate}</td>
                <td>
                  <span className={`status-badge ${student.statusRaw === 'active' ? 'status-active' : student.statusRaw === 'pending' ? 'status-pending' : 'status-inactive'}`}>
                    {student.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    {/* Xem chi tiết */}
                    <button
                      className="btn-icon btn-view"
                      onClick={() => handleViewStudent(student.id)}
                      title="Xem chi tiết"
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C3.5 7 8 4 12 4C16 4 20.5 7 23 12C20.5 17 16 20 12 20C8 20 3.5 17 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </button>

                    {/* Khóa/Mở khóa */}
                    <LockIcon
                      isLocked={student.isLocked}
                      size="small"
                      title={student.isLocked ? 'Mở khóa' : 'Khóa'}
                      className="lock-state-icon"
                      onClick={() => handleToggleLockAccount(student.id)}
                    />
                    {/* Xóa */}
                    <button
                      className="btn-icon btn-delete"
                      title="Xóa"
                      onClick={() => handleDeleteAccount(student.id)}
                    >
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M19 6L18.2 20.2C18.0895 21.8165 16.7412 23 15.1205 23H8.87947C7.2588 23 5.91053 21.8165 5.80005 20.2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 11V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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