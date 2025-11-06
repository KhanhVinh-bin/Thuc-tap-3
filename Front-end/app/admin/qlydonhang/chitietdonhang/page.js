'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getAdminOrderDetail, confirmOrderPayment } from '../../../../lib/api';
import './chitietdonhang.css';

export default function ChiTietDonHangPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDetail = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminOrderDetail(orderId);
      console.log('API Response:', result); // Debug log
      
      if (!result) {
        throw new Error('Không có dữ liệu trả về từ API');
      }
      
      setData(result);
    } catch (e) {
      console.error('Lỗi khi tải chi tiết đơn:', e);
      setError(e.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [orderId]);

  const handleConfirmPayment = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      await confirmOrderPayment(orderId, {
        PaymentMethod: 'Manual',
        VerificationNotes: 'Xác nhận từ trang chi tiết đơn',
      });
      // Reload detail
      await loadDetail();
    } catch (e) {
      console.warn('Xác nhận thất bại:', e.message || e);
      setError('Xác nhận thanh toán thất bại: ' + (e.message || e));
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <div className="header-left">
          <Link href="/admin/qlydonhang" className="back-button">
            ← Quay lại danh sách
          </Link>
          <h1>Chi tiết đơn hàng #{orderId}</h1>
        </div>
        <div className="header-right">
          <span className={`status-badge ${(data?.latestPayment?.paymentStatus || data?.LatestPayment?.PaymentStatus) === 'success' ? 'status-paid' : 'status-pending'}`}>
            {(data?.latestPayment?.paymentStatus || data?.LatestPayment?.PaymentStatus) === 'success' ? 'Đã thanh toán' : 'Chờ thanh toán'}
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ 
          backgroundColor: '#FEE2E2', 
          color: '#DC2626', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '16px',
          border: '1px solid #FECACA'
        }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span>Đang tải chi tiết đơn hàng...</span>
        </div>
      )}
      
      {!loading && data && (
        <div className="order-detail-content">
          {/* Quick Stats Row */}
          <div className="quick-stats-row">
            <div className="quick-stat-card payment-status">
              <div className="stat-icon">💳</div>
              <div className="stat-content">
                <h4>Trạng thái thanh toán</h4>
                <span className={`status-badge ${(data.latestPayment?.paymentStatus || data.LatestPayment?.PaymentStatus) === 'success' ? 'status-paid' : 'status-pending'}`}>
                  {(data.latestPayment?.paymentStatus || data.LatestPayment?.PaymentStatus) === 'success' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                </span>
              </div>
            </div>
            
            <div className="quick-stat-card order-amount">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h4>Tổng tiền</h4>
                <div className="amount">{(Number(data.latestPayment?.amount || data.LatestPayment?.Amount || 0)).toLocaleString('vi-VN')} ₫</div>
              </div>
            </div>
            
            <div className="quick-stat-card order-date">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h4>Ngày đặt hàng</h4>
                <div className="date-value">{(data.order?.createdAt || data.Order?.CreatedAt) ? new Date(data.order?.createdAt || data.Order?.CreatedAt).toLocaleDateString('vi-VN') : 'N/A'}</div>
              </div>
            </div>
            
            <div className="quick-stat-card course-count">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h4>Số khóa học</h4>
                <div className="count-value">{(data.orderDetails || data.OrderDetails)?.length || 0} khóa học</div>
              </div>
            </div>

            {/* Course Info Card - Show main course if only one course */}
            {(data.orderDetails || data.OrderDetails) && (data.orderDetails || data.OrderDetails).length === 1 && (
              <div className="quick-stat-card course-info">
                <div className="stat-icon">🎓</div>
                <div className="stat-content">
                  <h4>Khóa học</h4>
                  <div className="course-name">{(data.orderDetails || data.OrderDetails)[0]?.course?.title || (data.orderDetails || data.OrderDetails)[0]?.Course?.Title || 'Chưa có tên khóa học'}</div>
                  <div className="instructor-name">GV: {(data.orderDetails || data.OrderDetails)[0]?.course?.instructor?.fullName || (data.orderDetails || data.OrderDetails)[0]?.Course?.Instructor?.FullName || 'Chưa có thông tin'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="cards-row">
            {/* Student Information Card */}
            <div className="info-card student-card">
              <h3>👤 Thông tin học viên</h3>
              <div className="student-details">
                <div className="info-item">
                  <span className="label">Họ và tên</span>
                  <span className="value">{data.student?.fullName || data.Student?.FullName || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email</span>
                  <span className="value">{data.student?.email || data.Student?.Email || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Số điện thoại</span>
                  <span className="value">{data.student?.phoneNumber || data.Student?.PhoneNumber || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Ngày tham gia</span>
                  <span className="value">{(data.student?.createdAt || data.Student?.CreatedAt) ? new Date(data.student?.createdAt || data.Student?.CreatedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="info-card payment-info-card">
              <h3>💳 Thông tin thanh toán</h3>
              <div className="info-item">
                <span className="label">Mã giao dịch</span>
                <span className="value">{data.latestPayment?.transactionId || data.LatestPayment?.TransactionId || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Hình thức thanh toán</span>
                <span className="value">{data.latestPayment?.paymentMethod || data.LatestPayment?.PaymentMethod || 'N/A'}</span>
              </div>
              <div className="info-item">
                <span className="label">Số tiền</span>
                <span className="value amount-highlight">{(Number(data.latestPayment?.amount || data.LatestPayment?.Amount || 0)).toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="info-item">
                <span className="label">Ngày thanh toán</span>
                <span className="value">{(data.latestPayment?.paidAt || data.LatestPayment?.PaidAt) ? new Date(data.latestPayment?.paidAt || data.LatestPayment?.PaidAt).toLocaleString('vi-VN') : 'Chưa thanh toán'}</span>
              </div>
              <div className="info-item">
                <span className="label">Trạng thái</span>
                <span className={`status-badge ${(data.latestPayment?.paymentStatus || data.LatestPayment?.PaymentStatus) === 'success' ? 'status-paid' : 'status-pending'}`}>
                  {(data.latestPayment?.paymentStatus || data.LatestPayment?.PaymentStatus) === 'success' ? 'Thành công' : 'Đang xử lý'}
                </span>
              </div>
            </div>
          </div>

          {/* Course Details Section */}
          <div className="courses-section">
            <h3>📚 Chi tiết khóa học</h3>
            <div className="courses-grid">
              {(data.orderDetails || data.OrderDetails) && (data.orderDetails || data.OrderDetails).length > 0 ? (
                (data.orderDetails || data.OrderDetails).map((detail, index) => (
                  <div key={index} className="course-detail-card">
                    <div className="course-header">
                      <h4>{detail.course?.title || detail.Course?.Title || 'Chưa có tên khóa học'}</h4>
                      <span className="course-price">{(Number(detail.course?.price || detail.Course?.Price || 0)).toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="course-info">
                      <div className="info-item">
                        <span className="label">Mã khóa học</span>
                        <span className="value">{detail.course?.courseId || detail.Course?.CourseId || detail.courseId || detail.CourseId || 'Chưa có mã'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Tên khóa học</span>
                        <span className="value">{detail.course?.title || detail.Course?.Title || 'Chưa có tên khóa học'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Giảng viên</span>
                        <span className="value">{detail.course?.instructor?.fullName || detail.Course?.Instructor?.FullName || 'Chưa có thông tin giảng viên'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Danh mục</span>
                        <span className="value">{detail.course?.category?.name || detail.Course?.Category?.Name || 'Chưa có danh mục'}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Thời lượng</span>
                        <span className="value">{detail.course?.duration || detail.Course?.Duration || 'Chưa có thông tin'} {(detail.course?.duration || detail.Course?.Duration) ? 'giờ' : ''}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Cấp độ</span>
                        <span className="value">{detail.course?.level || detail.Course?.Level || 'Chưa có thông tin'}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-courses">
                  <div className="no-courses-icon">📚</div>
                  <h4>Chưa có thông tin khóa học</h4>
                  <p>Đơn hàng này chưa có thông tin chi tiết về khóa học. Vui lòng kiểm tra lại dữ liệu hoặc liên hệ bộ phận kỹ thuật.</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-section">
            <div className="action-buttons-row">
              {(data.latestPayment?.paymentStatus || data.LatestPayment?.PaymentStatus) !== 'success' && (
                <button 
                  onClick={handleConfirmPayment} 
                  className="btn btn-confirm"
                  disabled={loading}
                >
                  ✅ Xác nhận thanh toán
                </button>
              )}
              
              
              
              <button 
                onClick={loadDetail} 
                className="btn btn-refresh"
                disabled={loading}
              >
                🔄 Làm mới dữ liệu
              </button>
            </div>
          </div>

          {/* Timeline / Verifications */}
          {(data.verifications || data.Verifications) && (data.verifications || data.Verifications).length > 0 && (
            <div className="timeline-section">
              <h3>📋 Lịch sử xác minh thanh toán</h3>
              <div className="timeline">
                {(data.verifications || data.Verifications).map((v, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <div className="timeline-title">{v.status || v.Status}</div>
                      <div className="timeline-date">
                        {(v.verifiedAt || v.CreatedAt) ? new Date(v.verifiedAt || v.CreatedAt).toLocaleString('vi-VN') : ''}
                      </div>
                      {(v.notes || v.Notes) && <div className="timeline-notes">{v.notes || v.Notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}