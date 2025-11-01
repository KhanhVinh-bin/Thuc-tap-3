'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import './chitietbinhluan.css';

export default function CommentDetail() {
  const [isVisible, setIsVisible] = useState(true);
  const [commentData, setCommentData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const searchParams = useSearchParams();
  const commentId = searchParams.get('id');

  // Sample comments data (in real app, this would come from API)
  const commentsDatabase = {
    'CMT001': {
      student: {
        name: 'Đặng Quang Thành',
        avatar: '/placeholder-user.jpg',
        email: 'thanhdt@example.com'
      },
      course: {
        name: 'Frontend Basic',
        id: 'CS001'
      },
      rating: 5,
      content: 'Khóa học rất hay và bổ ích. Giảng viên giảng dạy rất dễ hiểu, nội dung cô đọng và hiệu quả. Tôi đã học được rất nhiều kiến thức về Frontend từ cơ bản đến nâng cao từ khóa học này.',
      date: '20/04/2024',
      status: 'Đang chờ'
    },
    'CMT002': {
      student: {
        name: 'Nguyễn Hữu Tài',
        avatar: '/placeholder-user.jpg',
        email: 'tai.nguyen@example.com'
      },
      course: {
        name: 'JavaScript Nâng Cao',
        id: 'CS002'
      },
      rating: 4,
      content: 'Khóa học JavaScript nâng cao rất chất lượng. Nội dung được trình bày một cách logic và dễ hiểu. Tôi đã nắm vững được các khái niệm nâng cao của JavaScript.',
      date: '19/07/2024',
      status: 'Đã duyệt'
    },
    'CMT003': {
      student: {
        name: 'Nguyễn Hải Trường',
        avatar: '/placeholder-user.jpg',
        email: 'truong.nguyen@example.com'
      },
      course: {
        name: 'Node.js Backend Dev',
        id: 'CS003'
      },
      rating: 5,
      content: 'Khóa học Node.js rất tuyệt vời! Giảng viên hướng dẫn rất chi tiết từ cơ bản đến nâng cao. Sau khóa học tôi đã có thể xây dựng được các ứng dụng backend hoàn chỉnh.',
      date: '18/05/2024',
      status: 'Đã duyệt'
    },
    'CMT004': {
      student: {
        name: 'Phan Bích Như',
        avatar: '/placeholder-user.jpg',
        email: 'nhu.phan@example.com'
      },
      course: {
        name: 'Python cho Data Science',
        id: 'CS004'
      },
      rating: 3,
      content: 'Khóa học có nội dung tốt nhưng tốc độ giảng hơi nhanh. Một số phần cần được giải thích kỹ hơn. Tuy nhiên, nhìn chung vẫn học được nhiều kiến thức hữu ích.',
      date: '20/11/2024',
      status: 'Từ chối'
    }
  };

  useEffect(() => {
    if (commentId && commentsDatabase[commentId]) {
      setCommentData(commentsDatabase[commentId]);
    }
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
    // Handle delete logic here
    setShowDeleteModal(false);
    handleClose();
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
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
                </div>
              </div>
            </div>

            {/* Course Information */}
            <div className="info-section">
              <h3>Khóa học</h3>
              <div className="course-info">
                <div className="course-name">{commentData.course.name}</div>
                <div className="course-id">ID: {commentData.course.id}</div>
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
                {commentData.content}
              </div>
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
                  <span className="preview-label">Khóa học:</span>
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