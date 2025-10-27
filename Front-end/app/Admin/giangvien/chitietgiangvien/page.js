'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import './chitietgiangvien.css';

export default function InstructorDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'https://localhost:7166';
  const getToken = () => (
    typeof window !== 'undefined'
      ? (
          localStorage.getItem('admin_token') ||
          sessionStorage.getItem('admin_token') ||
          localStorage.getItem('token') ||
          sessionStorage.getItem('token') ||
          localStorage.getItem('auth_token') ||
          ''
        )
      : null
  );
  const apiFetch = (path, options = {}) => {
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(options.headers || {})
      },
      cache: 'no-store',
      mode: 'cors',
    });
  };

  const formatDate = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
  };
  const formatCurrency = (n) => {
    if (n == null) return '';
    try { return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n); } catch { return `${n} VND`; }
  };
  const mapStatusToVi = (s) => {
    if (!s) return '';
    const v = s.toLowerCase();
    if (v === 'active') return 'Đang hoạt động';
    if (v === 'locked' || v === 'inactive') return 'Bị khóa';
    if (v === 'deleted') return 'Đã xóa';
    if (v === 'pending') return 'Đang chờ';
    return s;
  };
  const mapCourseStatusToVi = (s) => {
    const t = String(s || '').toLowerCase();
    if (t === 'published') return 'Đang diễn ra';
    if (t === 'draft') return 'Nháp';
    if (t === 'completed' || t === 'archived') return 'Hoàn thành';
    return 'Không xác định';
  };
  
  const formatInstructorId = (id) => {
    if (id == null) return '';
    try {
      const num = Number(id);
      if (!Number.isNaN(num)) return `INS${String(num).padStart(3, '0')}`;
    } catch {}
    return String(id);
  };

  useEffect(() => {
    const instructorId = searchParams.get('id');
    if (!instructorId) {
      setError('Thiếu ID giảng viên');
      setLoading(false);
      return;
    }

    const fetchInstructor = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`/admin/instructors/${instructorId}`);
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Lỗi ${res.status}: Không thể tải thông tin giảng viên`);
        }
        
        const data = await res.json();
        
        setInstructor({
          id: formatInstructorId(data.id),
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phoneNumber || data.phone || '',
          address: data.address || '',
          specialty: data.expertise || '',
          education: data.education || '—',
          joinDate: data.createdAt ? formatDate(data.createdAt) : '',
          experience: data.experienceYears != null ? `${data.experienceYears} năm` : '',
          status: mapStatusToVi(data.status),
          statusRaw: data.status || 'active',
          courses: data.courses || [],
          rating: data.ratingAverage || 0,
          avatar: data.avatarUrl || '/placeholder-user.jpg',
          totalStudents: data.totalStudents || 0,
          totalCourses: data.totalCourses || 0
        });
      } catch (err) {
        setError(err.message || 'Không thể tải thông tin giảng viên');
      } finally {
        setLoading(false);
      }
    };
      
    fetchInstructor();
  }, [searchParams]);

  const handleBack = () => {
    router.push('/admin/giangvien');
  };
     
  return (
    <AdminLayout>
      <div className="student-detail-container">
        <div className="top-navigation">
          <button onClick={handleBack} className="back-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Quay lại danh sách giảng viên
          </button>
          <div className="page-title">
            <h1>Chi tiết giảng viên</h1>
            <p className="page-description">Xem và quản lý thông tin chi tiết của giảng viên</p>
          </div>
        </div>
        
        <div className="student-detail-main">
          <div className="student-detail-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Đang tải thông tin giảng viên...</p>
              </div>
            ) : error ? (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={handleBack} className="btn-primary">Quay lại danh sách</button>
              </div>
            ) : instructor && (
              <>
                <div className="student-info-section">
                  <div className="student-info-header">
                    <div className="student-avatar-container">
                      <img src={instructor.avatar} alt={instructor.name} className="student-avatar" />
                    </div>
                    <div className="student-header-details">
                      <h2 className="student-name">{instructor.name}</h2>
                      <div className="student-id">{instructor.id}</div>
                      <div className={`status-badge status-${instructor.statusRaw}`}>{instructor.status}</div>
                    </div>
                    <div className="student-actions">
                      {/* Đã xóa nút chỉnh sửa thông tin */}
                    </div>
                  </div>
                  
                  <div className="student-info-content">
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">Email</div>
                        <div className="info-value">{instructor.email}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Số điện thoại</div>
                        <div className="info-value">{instructor.phone || '—'}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Địa chỉ</div>
                        <div className="info-value">{instructor.address || '—'}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Chuyên môn</div>
                        <div className="info-value">{instructor.specialty || '—'}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Ngày tham gia</div>
                        <div className="info-value">{instructor.joinDate || '—'}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Kinh nghiệm</div>
                        <div className="info-value">{instructor.experience || '—'}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Trạng thái</div>
                        <div className="info-value">{instructor.status || '—'}</div>
                      </div>
                      <div className="info-item">
                        <div className="info-label">Đánh giá</div>
                        <div className="info-value">
                          {instructor.rating ? (
                            <div className="rating-display">
                              <span className="rating-value">{instructor.rating.toFixed(1)}</span>
                              <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} className={`star ${star <= Math.round(instructor.rating) ? 'filled' : ''}`}>★</span>
                                ))}
                              </div>
                            </div>
                          ) : '—'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="student-courses-section">
                  <h3 className="section-title">Khóa học đang dạy ({instructor.totalCourses || 0})</h3>
                  {instructor.courses && instructor.courses.length > 0 ? (
                    <div className="courses-table-container">
                      <table className="data-table courses-table">
                        <thead>
                          <tr>
                            <th>Tên khóa học</th>
                            <th>Ngày tạo</th>
                            <th>Số học viên</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instructor.courses.map((course, index) => (
                            <tr key={index}>
                              <td>{course.title || course.name}</td>
                              <td>{formatDate(course.createdAt)}</td>
                              <td>{course.totalStudents || 0}</td>
                              <td>
                                <span className={`status-badge status-${course.status?.toLowerCase() || 'active'}`}>
                                  {mapCourseStatusToVi(course.status)}
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <button className="btn-icon btn-view" title="Xem chi tiết">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                      <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <p>Giảng viên này chưa có khóa học nào.</p>
                    </div>
                  )}
                </div>
                

              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}