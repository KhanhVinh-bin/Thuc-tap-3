'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './giangvien.css';
import { Search, SlidersHorizontal, Eye, Trash2, Lock, Unlock, Download, RefreshCw } from 'lucide-react';

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

const normalizeStatus = (s) => {
  const t = String(s || '').trim().toLowerCase();
  if (!t) return '';
  if (t === 'locked' || t === 'block' || t === 'banned') return 'inactive';
  return t;
};

const mapStatusToVi = (s) => {
  switch (normalizeStatus(s)) {
    case 'active': return 'Đang hoạt động';
    case 'inactive': return 'Bị khóa';
    case 'pending': return 'Đang chờ';
    default: return 'Không xác định';
  }
};

const formatInstructorId = (id) => {
  if (id == null) return '';
  try {
    const num = Number(id);
    if (!Number.isNaN(num)) return `INS${String(num).padStart(3, '0')}`;
  } catch {}
  return String(id);
};

export default function InstructorManagement() {
  const router = useRouter();

  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [keyword, setKeyword] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('Tất cả chuyên môn');
  const [expertiseOptions, setExpertiseOptions] = useState(['Tất cả chuyên môn']);

  const buildQuery = () => {
    const params = new URLSearchParams();
    const kw = keyword.trim();
    if (kw) {
      // Nếu là số, ưu tiên lọc theo id; ngược lại lọc theo name
      const maybeId = Number(kw.replace(/[^0-9]/g, ''));
      if (!Number.isNaN(maybeId) && kw.match(/^ins?/i)) {
        params.set('id', String(maybeId));
      } else if (!Number.isNaN(Number(kw)) && kw.length <= 8) {
        params.set('id', String(Number(kw)));
      } else {
        params.set('name', kw);
      }
    }
    if (expertiseFilter && expertiseFilter !== 'Tất cả chuyên môn') {
      params.set('expertise', expertiseFilter);
    }
    return params.toString();
  };

  const fetchInstructors = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = buildQuery();
      const res = await apiFetch(`/admin/instructors${qs ? `?${qs}` : ''}`);
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
      const mapped = list.map((u) => {
        const id = u.ID ?? u.Id ?? u.id ?? u.InstructorId ?? u.UserId ?? null;
        const name = u.Ten ?? u.ten ?? u.FullName ?? u.Name ?? '';
        const email = u.Email ?? u.email ?? '';
        const specialty = u.ChuyenMon ?? u.chuyenMon ?? u.Expertise ?? '';
        const createdRaw = u.NgayTao ?? u.ngayTao ?? u.CreatedAt ?? null;
        const createdDate = createdRaw ? new Date(createdRaw).toLocaleDateString('vi-VN') : '';
        const soKhoaHoc = u.SoKhoaHoc ?? u.soKhoaHoc ?? u.TotalCourses ?? 0;
        return {
          id,
          idDisplay: formatInstructorId(id),
          name,
          email,
          specialty,
          createdDate,
          totalCourses: soKhoaHoc,
          statusRaw: 'pending',
          status: 'Đang chờ',
          isLocked: false,
        };
      });

      // Lấy trạng thái từ API chi tiết (đồng thời)
      const detailPromises = mapped.map((i) => apiFetch(`/admin/instructors/${i.id}`));
      const details = await Promise.allSettled(detailPromises);
      const withStatus = mapped.map((i, idx) => {
        const r = details[idx];
        if (r.status === 'fulfilled' && r.value.ok) {
          return r.value.json().then((d) => {
            const st = d.Status ?? d.status ?? '';
            const norm = normalizeStatus(st);
            return {
              ...i,
              statusRaw: norm,
              status: mapStatusToVi(norm),
              isLocked: norm === 'inactive',
            };
          });
        }
        return Promise.resolve(i);
      });
      const final = await Promise.all(withStatus);

      // Tạo options chuyên môn từ dữ liệu
      const uniqueExpertises = Array.from(new Set(final.map((x) => x.specialty).filter(Boolean)));
      setExpertiseOptions(['Tất cả chuyên môn', ...uniqueExpertises]);

      setInstructors(final);
    } catch (e) {
      setError(e.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchInstructors(), 300);
    return () => clearTimeout(t);
  }, [keyword, expertiseFilter]);

  // Thêm: nút làm mới danh sách
  const handleRefresh = () => {
    fetchInstructors();
  };

  // Thêm: xuất Excel danh sách giảng viên
  const handleExportExcel = async () => {
    try {
      // Import thư viện xlsx
      const XLSX = await import('xlsx');
      
      // Tạo dữ liệu cho worksheet
      const worksheetData = [
        ['Mã GV', 'Tên', 'Email', 'Ngày tạo', 'Chuyên môn', 'Số khóa học', 'Trạng thái'],
        ...instructors.map(i => [
          i.idDisplay,
          i.name,
          i.email,
          i.createdDate,
          i.specialty || '',
          i.totalCourses ?? 0,
          i.status
        ])
      ];

      // Tạo worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Tạo workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách giảng viên');
      
      // Xuất file Excel
      const fileName = `Danh-sach-giang-vien-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
    } catch (error) {
      console.error('Lỗi xuất Excel:', error);
      alert('Có lỗi xảy ra khi xuất file Excel. Vui lòng thử lại.');
    }
  };

  // Thêm: các chỉ số nhanh cho header
  const totalCount = instructors.length;
  const lockedCount = instructors.filter(i => i.isLocked).length;
  const pendingCount = instructors.filter(i => i.statusRaw === 'pending').length;

  const handleViewInstructor = (instructorId) => {
    router.push(`/admin/giangvien/chitietgiangvien?id=${instructorId}`);
  };

  const handleToggleLockAccount = async (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    const instructorName = instructor ? instructor.name : `ID ${instructorId}`;

    // Lấy trạng thái hiện tại từ API chi tiết
    let currentStatus = instructor && (instructor.isLocked ? 'locked' : 'active');
    try {
      const dRes = await apiFetch(`/admin/instructors/${instructorId}`);
      if (dRes.ok) {
        const d = await dRes.json();
        currentStatus = d.Status ?? d.status ?? currentStatus;
      }
    } catch {}
    const isCurrentlyLocked = normalizeStatus(currentStatus) === 'inactive';
    const actionTitle = isCurrentlyLocked ? 'Mở khóa' : 'Khóa';
    const actionText = isCurrentlyLocked ? 'mở khóa' : 'khóa';

  const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: `${actionTitle} tài khoản "${instructorName}"?`,
      text: `Bạn có chắc chắn muốn ${actionText} tài khoản của giảng viên "${instructorName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isCurrentlyLocked ? '#16a34a' : '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: actionTitle,
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/instructors/${instructorId}/lock`, { method: 'PATCH' });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Không thể cập nhật trạng thái');
      }
      await Swal.fire({ title: `Đã ${actionText}!`, text: `Tài khoản của ${instructorName} đã được ${actionText}.`, icon: 'success' });
      fetchInstructors();
    } catch (err) {
      await Swal.fire({ title: 'Lỗi', text: err.message || `Không thể ${actionText} tài khoản. Vui lòng thử lại.`, icon: 'error' });
    }
  };

  const handleDeleteAccount = async (instructorId) => {
    const instructor = instructors.find(i => i.id === instructorId);
    const instructorName = instructor ? instructor.name : `ID ${instructorId}`;

    const Swal = (await import('sweetalert2')).default;
    const result = await Swal.fire({
      title: `Xóa tài khoản "${instructorName}"?`,
      text: `Bạn có chắc chắn muốn xóa tài khoản của giảng viên "${instructorName}"? Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await apiFetch(`/admin/instructors/${instructorId}`, { method: 'DELETE' });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Xóa thất bại');
      }
      await Swal.fire({ title: 'Đã xóa!', text: `Tài khoản của ${instructorName} đã được xóa.`, icon: 'success' });
      fetchInstructors();
    } catch (err) {
      await Swal.fire({ title: 'Lỗi', text: err.message || 'Không thể xóa tài khoản. Vui lòng thử lại.', icon: 'error' });
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="header-left">
          <h1>Quản lý giảng viên</h1>
          <p>Quản lý thông tin và các hoạt động giảng dạy</p>
          <div className="stat-chips">
            <span className="stat-chip total">Tổng: {totalCount}</span>
            <span className="stat-chip locked">Bị khóa: {lockedCount}</span>
            <span className="stat-chip pending">Đang chờ: {pendingCount}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-export" onClick={handleExportExcel}>
            <Download size={16} className="btn-icon" /> Xuất Excel
          </button>
          <button className="btn-refresh" onClick={handleRefresh}>
            <RefreshCw size={16} className="btn-icon" /> Làm mới
          </button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="search-controls w-full md:w-auto flex-grow">
          <div className="main-search">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo ID, tên, email hoặc chuyên môn,..."
              className="main-search-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-controls w-full md:w-auto flex items-center gap-4">
          <div className="filter-group">
            <select className="filter-select" value={expertiseFilter} onChange={(e) => setExpertiseFilter(e.target.value)}>
              {expertiseOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <SlidersHorizontal className="dropdown-arrow" />
          </div>
        </div>
      </div>

      {/* Instructor Count */}
      <div className="instructor-count">
        <span>Danh sách giảng viên ({instructors.length})</span>
      </div>

      {/* Instructor Table */}
      <div className="table-container overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Mã GV</th>
              <th>Tên giảng viên</th>
              <th>Email</th>
              <th>Ngày tạo</th>
              <th>Chuyên môn</th>
              <th>Số khóa học</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="8">Đang tải...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan="8" style={{ color: 'red' }}>{error}</td></tr>
            )}
            {!loading && !error && instructors.length === 0 && (
              <tr><td colSpan="8">Không có dữ liệu</td></tr>
            )}
            {!loading && !error && instructors.map((instructor, idx) => (
              <tr key={instructor.id || instructor.email || idx}>
                <td>{instructor.idDisplay}</td>
                <td>{instructor.name}</td>
                <td>{instructor.email}</td>
                <td>{instructor.createdDate}</td>
                <td>{instructor.specialty || '—'}</td>
                <td>{instructor.totalCourses ?? 0}</td>
                <td>
                  <span className={`status-badge ${instructor.statusRaw === 'active' ? 'status-active' : instructor.statusRaw === 'pending' ? 'status-pending' : 'status-inactive'}`}>
                    {instructor.status} 
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-icon btn-view"
                      title="Xem chi tiết"
                      onClick={() => handleViewInstructor(instructor.id)}
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className={`btn-icon ${instructor.isLocked ? 'btn-unlock' : 'btn-lock'}`}
                      title={instructor.isLocked ? 'Mở khóa' : 'Khóa'}
                      onClick={() => handleToggleLockAccount(instructor.id)}
                    >
                      {instructor.isLocked ? <Unlock size={18} /> : <Lock size={18} />}
                    </button>

                    <button
                      className="btn-icon btn-delete"
                      title="Xóa"
                      onClick={() => handleDeleteAccount(instructor.id)}
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