'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import AdminTopbar from '../components/AdminTopbar';
import './binhluan.css';
import Swal from 'sweetalert2';

export default function CommentManagement() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [selectedRating, setSelectedRating] = useState('Tất cả đánh giá');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả trạng thái');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const buildQuery = () => {
    const params = new URLSearchParams();
    const kw = keyword.trim();
    if (kw) {
      // Ưu tiên tìm theo tên học viên; có thể mở rộng thêm courseTitle nếu cần
      params.set('studentName', kw);
    }
    if (selectedStatus === 'Đã duyệt') params.set('status', 'visible');
    else if (selectedStatus === 'Đã ẩn') params.set('status', 'hidden');
    // 'Chờ duyệt' không có trên backend, bỏ qua filter

    if (selectedRating && selectedRating !== 'Tất cả đánh giá') {
      const r = Number(String(selectedRating).replace(/[^0-9]/g, ''));
      if (!Number.isNaN(r) && r >= 1 && r <= 5) {
        params.set('ratingMin', String(r));
        params.set('ratingMax', String(r));
      }
    }
    return params.toString();
  };

  const fetchComments = async () => {
    setLoading(true);
    setError('');
    try {
      const qs = buildQuery();
      const res = await apiFetch(`/admin/reviews${qs ? `?${qs}` : ''}`);
      if (res.status === 401 || res.status === 403) {
        setError('Vui lòng đăng nhập Admin và tin cậy chứng chỉ HTTPS backend.');
        setComments([]);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `Lỗi tải bình luận (${res.status})`);
      }
      const list = await res.json();
      const mapped = (list || []).map((c) => {
        const id = c.ID ?? c.Id ?? c.ReviewId ?? c.id;
        const author = c.HocVien ?? c.hocVien ?? c.UserName ?? '';
        const course = c.KhoaHoc ?? c.khoaHoc ?? c.CourseTitle ?? '';
        const content = c.NoiDung ?? c.noiDung ?? '';
        const rating = c.DiemDanhGia ?? c.diemDanhGia ?? c.Rating ?? 0;
        const createdRaw = c.NgayGui ?? c.ngayGui ?? c.CreatedAt ?? null;
        const createdDate = createdRaw ? new Date(createdRaw).toLocaleDateString('vi-VN') : '';
        const isVisible = content != null && String(content).trim() !== '';
        const status = isVisible ? 'Đã duyệt' : 'Đã ẩn';
        return {
          id,
          author,
          avatar: '/placeholder-user.jpg',
          course,
          content: content || '',
          rating: Number(rating) || 0,
          createdDate,
          status,
          statusColor: isVisible ? 'approved' : 'rejected',
        };
      });
      setComments(mapped);
    } catch (e) {
      setError(e.message || 'Đã xảy ra lỗi khi tải bình luận');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => fetchComments(), 300);
    return () => clearTimeout(t);
  }, [keyword, selectedRating, selectedStatus]);

  // Handler functions
  const handleViewComment = (commentId) => {
    router.push(`/admin/binhluan/chitietbinhluan?id=${commentId}`);
  };

  const handleApproveComment = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    const { value: newContent, isConfirmed } = await Swal.fire({
      title: 'Duyệt/hiện bình luận',
      input: 'textarea',
      inputLabel: `Nhập nội dung để hiện lại bình luận của ${comment?.author}`,
      inputPlaceholder: 'Nội dung bình luận...',
      inputValue: comment?.content || '',
      inputAttributes: { 'aria-label': 'Nội dung bình luận' },
      showCancelButton: true,
      confirmButtonText: 'Hiện bình luận',
      cancelButtonText: 'Hủy'
    });

    if (!isConfirmed) return;
    try {
      const res = await apiFetch(`/admin/reviews/${commentId}/hide`, {
        method: 'PATCH',
        body: JSON.stringify({ Hide: false, NewComment: newContent || '' })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Không thể hiện bình luận');
      }
      await Swal.fire({ title: 'Thành công', text: 'Đã hiện bình luận.', icon: 'success' });
      fetchComments();
    } catch (err) {
      await Swal.fire({ title: 'Lỗi', text: err.message || 'Duyệt bình luận thất bại', icon: 'error' });
    }
  };

  const handleHideComment = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    const result = await Swal.fire({
      title: 'Ẩn bình luận?',
      text: `Bạn có chắc chắn muốn ẩn bình luận của ${comment?.author}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ẩn',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/admin/reviews/${commentId}/hide`, {
        method: 'PATCH',
        body: JSON.stringify({ Hide: true })
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Không thể ẩn bình luận');
      }
      await Swal.fire({ title: 'Đã ẩn!', text: 'Bình luận đã được ẩn.', icon: 'success' });
      fetchComments();
    } catch (err) {
      await Swal.fire({ title: 'Lỗi', text: err.message || 'Ẩn bình luận thất bại', icon: 'error' });
    }
  };

  const handleDeleteComment = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    const result = await Swal.fire({
      title: 'Xóa bình luận?',
      text: `Bạn có chắc chắn muốn xóa bình luận của ${comment?.author}? Hành động này không thể hoàn tác!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;
    try {
      const res = await apiFetch(`/admin/reviews/${commentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Xóa bình luận thất bại');
      }
      await Swal.fire({ title: 'Đã xóa!', text: 'Bình luận đã được xóa.', icon: 'success' });
      fetchComments();
    } catch (err) {
      await Swal.fire({ title: 'Lỗi', text: err.message || 'Không thể xóa bình luận', icon: 'error' });
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={`star ${index < rating ? 'filled' : ''}`}>
        ⭐
      </span>
    ));
  };

  return (
    <>
      <div className="page-header">
        <h1>Quản lý bình luận & đánh giá</h1>
        <p>Theo dõi, duyệt và quản lý bình luận của học viên</p>
      </div>
      {/* Stats, Filters, Table */}
      <div className="controls-section">
        <div className="search-controls">
          <div className="main-search">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input 
              type="text" 
              placeholder="Tìm kiếm bình luận theo nội dung, tác giả..."
              className="main-search-input"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select className="filter-select" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option>Tất cả trạng thái</option>
              <option>Đã duyệt</option>
              <option>Chờ duyệt</option>
              <option>Đã ẩn</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="filter-group">
            <select className="filter-select" value={selectedRating} onChange={(e) => setSelectedRating(e.target.value)}>
              <option>Tất cả đánh giá</option>
              <option>5 sao</option>
              <option>4 sao</option>
              <option>3 sao</option>
              <option>2 sao</option>
              <option>1 sao</option>
            </select>
            <svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Comments Count */}
      <div className="comments-count">
        <span>Danh sách bình luận & đánh giá ({comments.length})</span>
        {loading && <span style={{ marginLeft: 12 }}>Đang tải...</span>}
        {error && <span style={{ marginLeft: 12, color: 'red' }}>{error}</span>}
      </div>

      {/* Comments Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tác giả</th>
              <th>Khóa học</th>
              <th>Nội dung</th>
              <th>Đánh giá</th>
              <th>Ngày tạo</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((comment) => (
              <tr key={comment.id}>
                <td>{comment.id}</td>
                <td>{comment.author}</td>
                <td>{comment.course}</td>
                <td className="comment-content">{comment.content}</td>
                <td>
                  <div className="rating">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < comment.rating ? 'star filled' : 'star'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                </td>
                <td>{comment.createdDate}</td>
                <td>
                  <span className={`status-badge ${comment.status === 'Đã duyệt' ? 'status-active' : comment.status === 'Chờ duyệt' ? 'status-pending' : 'status-inactive'}`}>
                    {comment.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      onClick={() => handleViewComment(comment.id)}
                      className="btn-icon btn-view"
                      title="Xem chi tiết"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleApproveComment(comment.id)}
                      className="btn-icon btn-edit"
                      title="Duyệt bình luận"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleHideComment(comment.id)}
                      className="btn-icon btn-lock"
                      title="Ẩn bình luận"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.58 10.58A2 2 0 1 0 13.42 13.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="btn-icon btn-delete"
                      title="Xóa bình luận"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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