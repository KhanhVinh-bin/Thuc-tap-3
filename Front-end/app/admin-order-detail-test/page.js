'use client';

import { useState } from 'react';
import { getAdminOrderDetail, confirmOrderPayment, payoutInstructorsForOrder } from '../../lib/api';

export default function AdminOrderDetailTestPage() {
  const [orderId, setOrderId] = useState('');
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const testGetOrderDetail = async () => {
    if (!orderId.trim()) {
      setError('Vui lòng nhập Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await getAdminOrderDetail(orderId);
      setOrderDetail(result);
      setSuccess('Lấy chi tiết đơn hàng thành công!');
    } catch (err) {
      setError('Lỗi khi lấy chi tiết đơn hàng: ' + (err.message || err));
      setOrderDetail(null);
    } finally {
      setLoading(false);
    }
  };

  const testConfirmPayment = async () => {
    if (!orderId.trim()) {
      setError('Vui lòng nhập Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await confirmOrderPayment(orderId, {
        PaymentMethod: 'Manual',
        VerificationNotes: 'Test xác nhận từ trang test'
      });
      setSuccess('Xác nhận thanh toán thành công!');
      // Reload order detail
      await testGetOrderDetail();
    } catch (err) {
      setError('Lỗi khi xác nhận thanh toán: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const testPayoutInstructors = async () => {
    if (!orderId.trim()) {
      setError('Vui lòng nhập Order ID');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      await payoutInstructorsForOrder(orderId, true);
      setSuccess('Chi trả giảng viên thành công!');
      // Reload order detail
      await testGetOrderDetail();
    } catch (err) {
      setError('Lỗi khi chi trả giảng viên: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Test Admin Order Detail API</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Order ID:
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Nhập Order ID để test"
            style={{
              marginLeft: '10px',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '200px'
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={testGetOrderDetail}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Đang tải...' : 'Lấy Chi Tiết Đơn Hàng'}
        </button>

        <button
          onClick={testConfirmPayment}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
        </button>

        <button
          onClick={testPayoutInstructors}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Đang xử lý...' : 'Chi Trả Giảng Viên'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #f5c6cb'
        }}>
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '20px',
          border: '1px solid #c3e6cb'
        }}>
          <strong>Thành công:</strong> {success}
        </div>
      )}

      {orderDetail && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h2>Chi Tiết Đơn Hàng #{orderDetail.OrderId}</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <h3>Thông tin học viên:</h3>
            <p><strong>Tên:</strong> {orderDetail.Student?.FullName || 'N/A'}</p>
            <p><strong>Email:</strong> {orderDetail.Student?.Email || 'N/A'}</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3>Thông tin thanh toán:</h3>
            <p><strong>Trạng thái:</strong> {orderDetail.LatestPayment?.PaymentStatus || 'N/A'}</p>
            <p><strong>Số tiền:</strong> {orderDetail.LatestPayment?.Amount ? Number(orderDetail.LatestPayment.Amount).toLocaleString('vi-VN') : 'N/A'}</p>
            <p><strong>Phương thức:</strong> {orderDetail.LatestPayment?.PaymentMethod || 'N/A'}</p>
            <p><strong>Mã giao dịch:</strong> {orderDetail.LatestPayment?.TransactionId || 'N/A'}</p>
            <p><strong>Ngày thanh toán:</strong> {orderDetail.LatestPayment?.PaidAt ? new Date(orderDetail.LatestPayment.PaidAt).toLocaleString('vi-VN') : 'N/A'}</p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3>Lịch sử xác minh:</h3>
            {orderDetail.Verifications && orderDetail.Verifications.length > 0 ? (
              <ul>
                {orderDetail.Verifications.map((v, idx) => (
                  <li key={idx}>
                    <strong>{v.Status}</strong> - {new Date(v.VerifiedAt).toLocaleString('vi-VN')}
                    {v.VerifiedBy && ` (bởi ${v.VerifiedBy})`}
                    {v.Notes && ` - ${v.Notes}`}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Chưa có xác minh nào</p>
            )}
          </div>

          <div>
            <h3>Raw Data:</h3>
            <pre style={{
              backgroundColor: '#e9ecef',
              padding: '10px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {JSON.stringify(orderDetail, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}