'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './binhluan.css';
import Swal from 'sweetalert2';

export default function CommentManagement() {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState('Tất cả khóa học');
  const [selectedRating, setSelectedRating] = useState('Tất cả đánh giá');
  const [selectedStatus, setSelectedStatus] = useState('Tất cả đánh giá');

  // Sample data for comments
  const comments = [
    {
      id: 'CMT001',
      author: 'Đặng Quang Thành',
      avatar: '/placeholder-user.jpg',
      course: 'Frontend Basic',
      content: 'Khóa học cơ bản về frontend rất hay và dễ hiểu',
      rating: 5,
      createdDate: '20/04/2024',
      status: 'Chờ duyệt',
      statusColor: 'pending'
    },
    {
      id: 'CMT002',
      author: 'Nguyễn Hữu Tài',
      avatar: '/placeholder-user.jpg',
      course: 'JavaScript Nâng Cao',
      content: 'Nội dung khóa học rất chất lượng',
      rating: 4,
      createdDate: '19/07/2024',
      status: 'Đã duyệt',
      statusColor: 'approved'
    },
    {
      id: 'CMT003',
      author: 'Nguyễn Hải Trường',
      avatar: '/placeholder-user.jpg',
      course: 'Node.js Backend Dev',
      content: 'Khóa học IOL rất bổ ích cho người mới bắt đầu',
      rating: 5,
      createdDate: '18/05/2024',
      status: 'Đã duyệt',
      statusColor: 'approved'
    },
    {
      id: 'CMT004',
      author: 'Phan Bích Như',
      avatar: '/placeholder-user.jpg',
      course: 'Python cho Data Science',
      content: 'Khóa học không như mong đợi',
      rating: 3,
      createdDate: '20/11/2024',
      status: 'Đã ẩn',
      statusColor: 'rejected'
    }
  ];

  // Handler functions
  const handleViewComment = (commentId) => {
    router.push(`/admin/binhluan/chitietbinhluan?id=${commentId}`);
  };

  const handleApproveComment = async (commentId) => {
    const comment = comments.find(c => c.id === commentId);
    const result = await Swal.fire({
      title: 'Duyệt bình luận?',
      text: `Bạn có chắc chắn muốn duyệt bình luận của ${comment?.author}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Duyệt',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: 'Đã duyệt!',
        text: 'Bình luận đã được duyệt thành công.',
        icon: 'success'
      });
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

    if (result.isConfirmed) {
      await Swal.fire({
        title: 'Đã ẩn!',
        text: 'Bình luận đã được ẩn thành công.',
        icon: 'success'
      });
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
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: 'Đã xóa!',
        text: 'Bình luận đã được xóa thành công.',
        icon: 'success'
      });
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
    <AdminLayout 
      title="Quản lý bình luận & đánh giá"
      description="Quản lý và kiểm duyệt bình luận, đánh giá từ học viên"
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
              placeholder="Tìm kiếm bình luận theo nội dung, tác giả..."
              className="main-search-input"
            />
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <select className="filter-select">
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
            <select className="filter-select">
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
                      className="btn btn-icon btn-view"
                      title="Xem chi tiết"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleApproveComment(comment.id)}
                      className="btn btn-icon btn-approve"
                      title="Duyệt bình luận"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleHideComment(comment.id)}
                      className="btn btn-icon btn-hide"
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
                      className="btn btn-icon btn-delete"
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
    </AdminLayout>
  );
}