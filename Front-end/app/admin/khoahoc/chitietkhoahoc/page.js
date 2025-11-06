'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout'; // bỏ để tránh đè layout
import './chitietkhoahoc.css';

// Đảm bảo API_BASE đúng với cấu hình backend (không dùng tiền tố /api)
const API_BASE = 'https://localhost:7166/admin';
// Backup URL nếu cần thiết
const BACKUP_API_BASE = 'http://localhost:5000/admin';

export default function ChiTietKhoaHoc() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('id');
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useMemo(() => {
    try {
      return (
        localStorage.getItem('admin_token') ||
        sessionStorage.getItem('admin_token') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('token') ||
        localStorage.getItem('auth_token') ||
        ''
      );
    } catch {
      return '';
    }
  }, []);

  const apiFetch = async (path, options = {}, useBackup = false) => {
    try {
      const baseUrl = useBackup ? BACKUP_API_BASE : API_BASE;
      console.log(`🔍 Gửi request đến: ${baseUrl}${path}`);
      console.log('🔑 Token:', token ? 'Có token' : 'Không có token');
      
      // Thêm log để debug
      console.log(`🔄 Đang kết nối đến API: ${baseUrl}${path}`);
      
      const res = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
        cache: 'no-store',
        // Thêm credentials để đảm bảo cookie được gửi đi
        credentials: 'include',
      });
      
      console.log(`📊 Status code: ${res.status}`);
      console.log(`📋 Response headers:`, Object.fromEntries([...res.headers.entries()]));
      
      if (res.status === 401 || res.status === 403) {
        console.error('⛔ Lỗi xác thực:', res.status);
        return null;
      }
      
      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json().catch((err) => {
          console.error('❌ JSON parse error:', err);
          return null;
        });
      }
      if (!res.ok) {
        console.error('❌ API Error:', res.status, data);
        return null;
      }
      console.log('✅ Dữ liệu nhận được:', data);
      return data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      
      // Nếu lỗi kết nối và chưa dùng backup URL, thử lại với backup URL
      if (!useBackup && error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network Error'))) {
        console.log('🔄 Thử lại với backup URL');
        return apiFetch(path, options, true);
      }
      
      return null;
    }
  };

  useEffect(() => {
    const fetchCourseDetail = async (retryCount = 0) => {
      if (!courseId) {
        setError('Không tìm thấy ID khóa học');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Thử lấy dữ liệu từ API (đường dẫn chuẩn /api/admin/courses/:id)
        const apiData = await apiFetch(`/courses/${courseId}`);

        if (apiData) {
          console.log('✅ Dữ liệu từ API:', apiData);
          const normalized = {
            id: apiData.ID ?? apiData.id ?? null,
            tieuDe: apiData.TieuDe ?? apiData.tieuDe ?? '',
            moTa: apiData.MoTa ?? apiData.moTa ?? '',
            danhMuc: apiData.DanhMuc ?? apiData.danhMuc ?? null,
            giangVien: apiData.GiangVien ?? apiData.giangVien ?? null,
            thoiLuong: apiData.ThoiLuong ?? apiData.Duration ?? apiData.thoiLuong ?? null,
            gia: apiData.Gia ?? apiData.gia ?? null,
            trangThai: apiData.TrangThai ?? apiData.status ?? apiData.trangThai ?? null,
            createdAt: apiData.CreatedAt ?? apiData.createdAt ?? null,
            updatedAt: apiData.UpdatedAt ?? apiData.updatedAt ?? null,
            hocVienDangKy: (apiData.HocVienDangKy ?? apiData.hocVienDangKy) || [],
            doanhThu: apiData.DoanhThu ?? apiData.doanhThu ?? null,
          };
          setCourseData(normalized);
        } else {
          // Dữ liệu mẫu để hiển thị khi API không hoạt động
          const mockData = {
            id: 1,
            tieuDe: "Khoá Lập Trình Web: HTML/CSS/JS từ cơ bản đến nâng cao",
            moTa: "Khóa học thực hành xây dựng website, làm project thực tế, phù hợp cho người mới.",
            danhMuc: "Lập trình",
            giangVien: "Lê Thị Linh",
            thoiLuong: "3 tháng",
            gia: 499000,
            trangThai: "published",
            createdAt: "2025-10-20T12:16:49.092",
            updatedAt: null,
            hocVienDangKy: [
              {
                userId: 4,
                hoTen: "Hồ Khánh",
                email: "khanh.ho@student.vn",
                ngayDangKy: "2025-10-20T12:16:49.111",
                trangThaiDangKy: "active"
              },
              {
                userId: 5,
                hoTen: "Nguyễn Thị Hòa",
                email: "hoa.nguyen@student.vn",
                ngayDangKy: "2025-10-20T12:16:49.111",
                trangThaiDangKy: "active"
              }
            ],
            doanhThu: 998000
          };
          
          // Sử dụng dữ liệu mẫu để hiển thị
          console.log('⚠️ Sử dụng dữ liệu mẫu để hiển thị');
          setCourseData(mockData);
        }
      } catch (err) {
        console.error('❌ Lỗi khi tải thông tin khóa học:', err);
        setError(`Lỗi: ${err.message || 'Không thể tải thông tin khóa học'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  return (
    <>
      <div className="course-detail-container">
        {/* Header theo thiết kế chi tiết giảng viên */}
        <div className="top-navigation">
          <button className="back-button" onClick={() => router.push('/admin/khoahoc')}>
            ← Quay lại danh sách
          </button>
          <div className="page-title">
            <h1>Chi tiết khóa học</h1>
            <p>Thông tin chi tiết và thống kê của khóa học</p>
          </div>
        </div>

        {error ? (
          <div className="error-message">{error}</div>
        ) : courseData ? (
          <div className="content-grid">
            {/* Left Column - Course Info */}
            <div className="course-info-column">
              <div className="course-info-card">
                <div className="course-header">
                  <h2>Thông tin khóa học</h2>
                </div>
                
                <div className="course-title-section">
                  <h3>{courseData.tieuDe}</h3>
                  <p className="course-description">
                    {courseData.moTa}
                  </p>
                </div>

                <div className="course-details-grid">
                  <div className="detail-row">
                    <span className="label">Mã khóa học</span>
                    <span className="value">{courseData.id}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Trạng thái</span>
                    <span className={`status-badge ${courseData.trangThai === 'active' || courseData.trangThai === 'published' ? 'active' : courseData.trangThai === 'pending' ? 'pending' : 'inactive'}`}>
                      {courseData.trangThai}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Danh mục</span>
                    <span className="value">{courseData.danhMuc || 'Chưa phân loại'}</span>
                  </div>

                  <div className="detail-row">
                    <span className="label">Thời lượng</span>
                    <span className="value">{courseData.thoiLuong || 'Chưa cập nhật'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Số học viên</span>
                    <span className="value">{courseData.hocVienDangKy?.length || 0} học viên</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Ngày tạo</span>
                    <span className="value">{courseData.createdAt ? new Date(courseData.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="label">Cập nhật lần cuối</span>
                    <span className="value">{courseData.updatedAt ? new Date(courseData.updatedAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</span>
                  </div>
                </div>

                <div className="instructor-section">
                  <span className="label">Giảng viên phụ trách</span>
                  <div className="instructor-info">
                    <img src="/placeholder-user.jpg" alt="Instructor" className="instructor-avatar" />
                    <div className="instructor-details">
                      <span className="instructor-name">{courseData.giangVien || 'Chưa phân công'}</span>
                    </div>
                  </div>
                </div>

                <div className="pricing-section">
                  <div className="price-row">
                    <span className="label">Giá khóa học</span>
                    <span className="value price">{courseData.gia?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  <div className="price-row">
                    <span className="label">Doanh thu</span>
                    <span className="value price">{courseData.doanhThu?.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Students */}
            <div className="students-column">
              <div className="students-card">
                <div className="students-header">
                  <h2>Danh sách học viên ({courseData.hocVienDangKy?.length || 0})</h2>
                </div>
                
                <div className="students-table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>Ngày đăng ký</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseData.hocVienDangKy && courseData.hocVienDangKy.length > 0 ? (
                        courseData.hocVienDangKy.map((student) => (
                          <tr key={student.userId}>
                            <td>{student.userId}</td>
                            <td>{student.hoTen}</td>
                            <td>{student.email}</td>
                            <td>{new Date(student.ngayDangKy).toLocaleDateString('vi-VN')}</td>
                            <td>
                              <span className={`status-badge ${student.trangThaiDangKy === 'active' ? 'active' : 'inactive'}`}>
                                {student.trangThaiDangKy}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="empty-table">Chưa có học viên đăng ký</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="not-found">Không tìm thấy thông tin khóa học</div>
        )}
      </div>
    </>
  );
}