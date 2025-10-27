'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import AdminLayout from '../components/AdminLayout';
import './khoahoc.css';

const API_BASE = 'https://localhost:7166';

export default function CourseManagement() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const token = useMemo(() => {
    try { return localStorage.getItem('admin_token') || ''; } catch { return ''; }
  }, []);

  const apiFetch = async (path, options = {}) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
        cache: 'no-store',
      });
      
      console.log('Response status:', res.status);
      
      if (res.status === 401 || res.status === 403) {
        router.push('/admin/login');
        return null;
      }
      if (res.status === 204) return null;
      
      const data = await res.json().catch((err) => {
        console.error('JSON parse error:', err);
        return null;
      });
      
      if (!res.ok) {
        console.error('API Error:', res.status, data);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    
    try {
      // Sử dụng trực tiếp API endpoint
      const url = 'https://localhost:7166/admin/courses';
      console.log('Fetching courses from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        cache: 'no-store'
      });
      
      console.log('Response status:', response.status);
      
      if (response.status === 401 || response.status === 403) {
        router.push('/admin/login');
        return;
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Cập nhật state với dữ liệu từ API
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  
  const handleViewCourse = (courseId) => {
    router.push(`/admin/khoahoc/chitietkhoahoc?id=${courseId}`);
  };

  const handleSeedData = async () => {
    try {
      const url = 'https://localhost:7166/admin/courses/seed';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (response.ok) {
        const res = await response.json();
        Swal.fire({
          title: 'Thành công!',
          text: res.message || 'Đã tạo dữ liệu mẫu thành công',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        fetchCourses(); // Refresh the list
      } else {
        throw new Error('Failed to seed data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi tạo dữ liệu mẫu.',
        icon: 'error'
      });
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa khóa học',
      text: `Bạn có chắc chắn muốn xóa khóa học "${courseName}"? Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      const url = `https://localhost:7166/admin/courses/${courseId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      Swal.fire({
        title: 'Đã xóa!',
        text: `Khóa học "${courseName}" đã được xóa thành công.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      // Cập nhật danh sách khóa học sau khi xóa
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
      Swal.fire({
        title: 'Lỗi!',
        text: 'Có lỗi xảy ra khi xóa khóa học.',
        icon: 'error'
      });
    }
  };




  return (
    <AdminLayout 
      title="Quản lý khóa học"
      description="Quản lý thông tin và các hoạt động của khóa học"
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
                  placeholder="Tìm kiếm theo tên khóa học, giảng viên..."
                  className="main-search-input"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchCourses(); }}
                />
              </div>
            </div>

            <div className="filter-controls">
              <div className="filter-group">
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    // Trigger search when filter changes
                    setTimeout(() => fetchCourses(), 100);
                  }}
                >
                  <option>Tất cả trạng thái</option>
                  <option>Đang diễn ra</option>
                  <option>Sắp bắt đầu</option>
                  <option>Đã kết thúc</option>
                </select>
                <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <button 
                className="search-button"
                onClick={fetchCourses}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          {/* Course Count */}
          <div className="course-count">
            <span>Danh sách khóa học ({courses.length})</span>
            {courses.length === 0 && (
              <button 
                onClick={handleSeedData}
                style={{
                  marginLeft: '20px',
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Tạo dữ liệu mẫu
              </button>
            )}
          </div>

          {/* Course Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã khóa học</th>
                  <th>Tên khóa học</th>
                  <th>Giảng viên</th>
                  <th>Thời lượng</th>
                  <th>Số học viên</th>
                  <th>Ngày bắt đầu</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>Đang tải...</td>
                  </tr>
                ) : courses.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center' }}>Không có dữ liệu khóa học</td>
                  </tr>
                ) : (
                  courses.map((course) => (
                    <tr key={course.id}>
                      <td>{course.id}</td>
                      <td>{course.tenKhoaHoc}</td>
                      <td>{course.giangVien || '-'}</td>
                      <td>{course.thoiLuong || '-'}</td>
                      <td>{course.soHocVien ?? 0}</td>
                      <td>{course.ngayBatDau ? new Date(course.ngayBatDau).toLocaleDateString('vi-VN') : '-'}</td>
                      <td>
                        <span className={`status-badge ${course.status === 'published' ? 'status-active' : course.status === 'draft' ? 'status-pending' : 'status-inactive'}`}>
                          {course.status === 'published' ? 'Đã xuất bản' : 
                           course.status === 'draft' ? 'Bản nháp' : 
                           course.status || '-'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleViewCourse(course.id)}
                            className="icon-btn view-btn"
                            title="Xem chi tiết"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course.id, course.tenKhoaHoc)}
                            className="icon-btn delete-btn"
                            title="Xóa khóa học"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
    </AdminLayout>
  );
}