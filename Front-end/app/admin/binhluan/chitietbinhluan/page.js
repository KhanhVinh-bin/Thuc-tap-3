'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import './chitietbinhluan.css';

export default function CommentDetail() {
  const [isVisible, setIsVisible] = useState(true);
  const [commentData, setCommentData] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [loadingExtras, setLoadingExtras] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [newComment, setNewComment] = useState('');
  const searchParams = useSearchParams();
  const commentId = searchParams.get('id');
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
    return fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      cache: 'no-store',
      mode: 'cors',
    });
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!commentId) return;
      try {
        const res = await apiFetch(`/admin/reviews/${commentId}`);
        if (!res.ok) {
          // Nếu unauthorized hoặc not found, đóng modal
          setIsVisible(false);
          return;
        }
        const d = await res.json();
        const student = {
          id: d?.HocVien?.UserId ?? d?.hocVien?.userId ?? d?.hocVien?.UserId ?? null,
          name: d?.HocVien?.FullName ?? d?.hocVien?.fullName ?? d?.hocVien?.FullName ?? '',
          avatar: '/placeholder-user.jpg',
          email: d?.HocVien?.Email ?? d?.hocVien?.email ?? d?.hocVien?.Email ?? ''
        };
        const course = {
          id: d?.KhoaHoc?.CourseId ?? d?.khoaHoc?.courseId ?? d?.khoaHoc?.CourseId ?? null,
          name: d?.KhoaHoc?.Title ?? d?.khoaHoc?.title ?? d?.khoaHoc?.Title ?? ''
        };
        const rating = d?.DiemDanhGia ?? d?.diemDanhGia ?? 0;
        const content = d?.NoiDung ?? d?.noiDung ?? '';
        const dateRaw = d?.NgayGui ?? d?.ngayGui ?? null;
        const date = dateRaw ? new Date(dateRaw).toLocaleDateString('vi-VN') : '';
        const status = content ? 'Hiển thị' : 'Đã ẩn';
        const base = { student, course, rating, content, date, status };
        setCommentData(base);

        // Tải thêm chi tiết học viên và khóa học
        if (student.id || course.id) {
          setLoadingExtras(true);
          try {
            const promises = [];
            if (student.id) promises.push(apiFetch(`/admin/students/${student.id}`));
            else promises.push(Promise.resolve(null));
            if (course.id) promises.push(apiFetch(`/admin/courses/${course.id}`));
            else promises.push(Promise.resolve(null));

            const [stuRes, courseRes] = await Promise.all(promises);
            if (stuRes && stuRes.ok) {
              const sd = await stuRes.json();
              setStudentDetail(sd);
              setCommentData(prev => ({
                ...prev,
                student: {
                  ...prev.student,
                  avatar: sd?.AvatarUrl || prev.student.avatar,
                  phone: sd?.PhoneNumber || '',
                  status: sd?.Status || '',
                }
              }));
            }
            if (courseRes && courseRes.ok) {
              const cd = await courseRes.json();
              setCourseDetail(cd);
              setCommentData(prev => ({
                ...prev,
                course: {
                  ...prev.course,
                  category: cd?.DanhMuc || '',
                  instructor: cd?.GiangVien || '',
                  price: cd?.Gia ?? null,
                  courseStatus: cd?.TrangThai || '',
                  revenue: cd?.DoanhThu ?? null,
                }
              }));
            }
          } catch (e) {
            // ignore extras loading errors
          } finally {
            setLoadingExtras(false);
          }
        }
      } catch (e) {
        setIsVisible(false);
      }
    };
    fetchDetail();
  }, [commentId]);

  const handleClose = () => {
    setIsVisible(false);
    // Navigate back or close modal
    window.history.back();
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    const doDelete = async () => {
      try {
        const res = await apiFetch(`/admin/reviews/${commentId}`, { method: 'DELETE' });
        setShowDeleteModal(false);
        if (!res.ok) {
          handleClose();
          return;
        }
        handleClose();
      } catch (e) {
        setShowDeleteModal(false);
        handleClose();
      }
    };
    doDelete();
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleHideToggle = async () => {
    if (!commentId) return;
    try {
      setIsHiding(true);
      const hide = !!commentData?.content; // nếu có content => ẩn; nếu đang ẩn => hiện
      const body = hide
        ? { Hide: true }
        : { Hide: false, NewComment: newComment };
      const res = await apiFetch(`/admin/reviews/${commentId}/hide`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        setIsHiding(false);
        return;
      }
      const r = await res.json();
      // Cập nhật UI theo trạng thái mới
      if (hide) {
        setCommentData(prev => ({ ...prev, content: '', status: 'Đã ẩn' }));
      } else {
        setCommentData(prev => ({ ...prev, content: newComment, status: 'Hiển thị' }));
        setNewComment('');
      }
      setIsHiding(false);
    } catch (e) {
      setIsHiding(false);
    }
  };

  if (!isVisible || !commentData) return null;

  return (
    <>
      <div className="comment-detail-overlay">
        <div className="comment-detail-modal">
          {/* Header with close button */}
          <div className="modal-header">
            <h2>Chi tiết bình luận</h2>
            <button className="close-btn" onClick={handleClose}>
              ×
            </button>
          </div>

          <div className="modal-content">
            <p className="modal-subtitle">Thông tin chi tiết về bình luận và đánh giá</p>

            {/* Student Information */}
            <div className="info-section">
              <h3>Thông tin học viên</h3>
              <div className="student-info">
                <img 
                  src={commentData.student.avatar} 
                  alt={commentData.student.name}
                  className="student-avatar"
                />
                <div className="student-details">
                  <div className="student-name">{commentData.student.name}</div>
                  <div className="student-email">{commentData.student.email}</div>
                  {commentData.student.phone && (
                    <div className="student-email">SĐT: {commentData.student.phone}</div>
                  )}
                  {commentData.student.status && (
                    <div className="student-email">Trạng thái: {commentData.student.status}</div>
                  )}
                </div>
              </div>
              {studentDetail && (
                <div className="additional-info" style={{ marginTop: 12 }}>
                  <div className="info-row">
                    <span className="info-label">Đăng ký</span>
                    <span className="info-value">{studentDetail?.StudentStats?.EnrollmentCount ?? 0}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Hoàn thành</span>
                    <span className="info-value">{studentDetail?.StudentStats?.CompletedCourses ?? 0}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Chứng chỉ</span>
                    <span className="info-value">{studentDetail?.StudentStats?.TotalCertificates ?? 0}</span>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 8 }}>
                {commentData.student.id && (
                  <a href={`/admin/sinhvien/chitietsinhvien?id=${commentData.student.id}`} className="link" style={{ fontSize: 13 }}>
                    Xem chi tiết học viên
                  </a>
                )}
              </div>
            </div>

            {/* Course Information */}
            <div className="info-section">
              <h3>Khóa học</h3>
              <div className="course-info">
                <div className="course-name">{commentData.course.name}</div>
                <div className="course-id">ID: {commentData.course.id}</div>
                {commentData.course.category && (
                  <div className="course-id">Danh mục: {commentData.course.category}</div>
                )}
                {commentData.course.instructor && (
                  <div className="course-id">Giảng viên: {commentData.course.instructor}</div>
                )}
                {commentData.course.price !== null && (
                  <div className="course-id">Giá: {Number(commentData.course.price).toLocaleString('vi-VN')}₫</div>
                )}
                {commentData.course.courseStatus && (
                  <div className="course-id">Trạng thái: {commentData.course.courseStatus}</div>
                )}
                {commentData.course.revenue !== null && (
                  <div className="course-id">Doanh thu: {Number(commentData.course.revenue).toLocaleString('vi-VN')}₫</div>
                )}
              </div>
              <div style={{ marginTop: 8 }}>
                {commentData.course.id && (
                  <a href={`/admin/khoahoc/chitietkhoahoc?id=${commentData.course.id}`} className="link" style={{ fontSize: 13 }}>
                    Xem chi tiết khóa học
                  </a>
                )}
              </div>
            </div>

            {/* Rating Section */}
            <div className="info-section">
              <h3>Đánh giá</h3>
              <div className="rating-display">
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`star ${star <= commentData.rating ? 'filled' : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="rating-text">{commentData.rating}/5</span>
              </div>
            </div>

            {/* Comment Content */}
            <div className="info-section">
              <h3>Nội dung bình luận</h3>
              <div className="comment-content">
                {commentData.content || (
                  <span style={{ color: '#6b7280' }}>Bình luận đang bị ẩn</span>
                )}
              </div>
              {!commentData.content && (
                <div className="additional-info" style={{ marginTop: 12 }}>
                  <div className="info-row">
                    <span className="info-label">Hiện lại bình luận</span>
                  </div>
                  <textarea
                    placeholder="Nhập nội dung mới để hiện lại bình luận"
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    style={{ width: '100%', minHeight: 80, padding: 8, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  />
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="info-section">
              <h3>Thông tin khác</h3>
              <div className="additional-info">
                <div className="info-row">
                  <span className="info-label">Ngày gửi</span>
                  <span className="info-value">{commentData.date}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Trạng thái</span>
                  <span className="status-badge active">{commentData.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button className="btn-close" onClick={handleHideToggle} disabled={isHiding}>
              {commentData.content ? 'Ẩn bình luận' : 'Hiện bình luận'}
            </button>
            <button className="btn-delete" onClick={handleDelete}>
              Xóa bình luận
            </button>
            <button className="btn-close" onClick={handleClose}>
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-header">
              <h3>Xác nhận xóa bình luận</h3>
              <button className="delete-close-btn" onClick={cancelDelete}>
                ×
              </button>
            </div>
            
            <div className="delete-modal-content">
              <p>Bạn có chắc chắn muốn xóa bình luận này không?</p>
              <p className="delete-warning">Hành động này không thể hoàn tác.</p>
              
              <div className="comment-preview">
                <div className="preview-item">
                  <span className="preview-label">Học viên:</span>
                  <span className="preview-value">{commentData.student.name}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Khóa học:</span>
                  <span className="preview-value">{commentData.course.name}</span>
                </div>
                <div className="preview-item">
                  <span className="preview-label">Bình luận:</span>
                  <span className="preview-content">"{commentData.content.length > 100 ? commentData.content.substring(0, 100) + '...' : commentData.content}"</span>
                </div>
              </div>
            </div>
            
            <div className="delete-modal-actions">
              <button className="btn-confirm-delete" onClick={confirmDelete}>
                Xóa mãi mãi
              </button>
              <button className="btn-cancel" onClick={cancelDelete}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}