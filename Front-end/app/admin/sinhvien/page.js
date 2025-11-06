'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';import LockIcon from '../giangvien/LockIcon';
import './sinhvien.css';
import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, Eye, Trash2, Lock, Unlock } from 'lucide-react';
import { RefreshCw } from 'lucide-react';

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
    const Swal = (await import('sweetalert2')).default;
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

  const Swal = (await import('sweetalert2')).default;
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

    const Swal = (await import('sweetalert2')).default;
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

  // Add actions and stats INSIDE the component
  

  const handleRefresh = () => {
    fetchStudents();
  };

  const totalCount = students.length;
  const activeCount = students.filter(s => s.statusRaw === 'active').length;
  const lockedCount = students.filter(s => s.statusRaw === 'inactive').length;
  const pendingCount = students.filter(s => s.statusRaw === 'pending').length;

  useEffect(() => {
    const t = setTimeout(() => fetchStudents(), 300);
    return () => clearTimeout(t);
  }, [keyword, statusFilter, dateRange]);

  return (
    // Remove AdminLayout wrapper and render a standard page-header
    <>
      <div className="page-header">
        <div className="header-left">
          <h1>Quản lý sinh viên</h1>
          <p className="page-description">Quản lý thông tin và các hoạt động của sinh viên</p>
          <div className="stat-chips">
            <div className="chip chip-total">Tổng: {totalCount}</div>
            <div className="chip chip-active">Hoạt động: {activeCount}</div>
            <div className="chip chip-inactive">Bị khóa: {lockedCount}</div>
            <div className="chip chip-pending">Đang chờ: {pendingCount}</div>
          </div>
        </div>
        <div className="header-right">
          <div className="actions">
            
            <button className="btn-secondary" onClick={handleRefresh}>
              <RefreshCw size={16} /> Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        {/* Search controls */}
        <div className="search-controls w-full md:w-auto flex-grow">
          <div className="main-search">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, email hoặc mã sinh viên,..."
              className="main-search-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        {/* Filter controls */}
        <div className="filter-controls w-full md:w-auto flex flex-col sm:flex-row items-center gap-4">
          <div className="filter-group">
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>Tất cả trạng thái</option>
              <option>Hoạt động</option>
              <option>Bị khóa</option>
              <option>Đang chờ</option>
            </select>
            <SlidersHorizontal className="dropdown-arrow" />
          </div>
        </div>
      </div>

      {/* Student Count */}
      <div className="student-count">
        <span>Danh sách sinh viên ({students.length})</span>
      </div>

      {/* Student Table */}
      <div className="table-container overflow-x-auto">
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
                    <button
                      className="btn-icon btn-view"
                      onClick={() => handleViewStudent(student.id)}
                      title="Xem chi tiết"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      className={`btn-icon ${student.isLocked ? 'btn-unlock' : 'btn-lock'}`}
                      title={student.isLocked ? 'Mở khóa' : 'Khóa'}
                      onClick={() => handleToggleLockAccount(student.id)}
                    >
                      {student.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      title="Xóa"
                      onClick={() => handleDeleteAccount(student.id)}
                    >
                      <Trash2 size={18} />
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