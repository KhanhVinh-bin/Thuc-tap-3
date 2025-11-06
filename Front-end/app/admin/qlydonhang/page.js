
'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '../components/AdminLayout';
import { getAdminOrders, getAdminOrdersSummary, getAdminPayments, confirmOrderPayment } from '../../../lib/api';
import './qlydonhang.css';

export default function QuanLyDonHangPage() {
  // Khởi tạo state cần thiết
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedOrders: 0,
    pendingInstructorPayouts: 0
  });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [filters, setFilters] = useState({
    studentName: '',
    courseTitle: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: ''
  });

  // Fetch data functions
  const fetchSummary = async (filterParams = {}) => {
    try {
      const data = await getAdminOrdersSummary(filterParams);
      if (data) {
        setSummary({
          totalRevenue: Number((data.TotalRevenue ?? data.totalRevenue) ?? 0),
          pendingPayments: Number((data.PendingPayments ?? data.pendingPayments) ?? 0),
          completedOrders: Number((data.CompletedOrders ?? data.completedOrders) ?? 0),
          pendingInstructorPayouts: Number((data.PendingInstructorPayouts ?? data.pendingInstructorPayouts) ?? 0),
        });
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      if (String(error?.message || '').includes('401')) setAuthError(true);
    }
  };

  const fetchOrders = async (filterParams = {}) => {
    setLoading(true);
    try {
      const data = await getAdminOrders(filterParams);
      const normalized = Array.isArray(data)
        ? data.map(o => ({
            orderId: o.orderId ?? o.OrderId,
            student: o.student ?? o.Student,
            studentEmail: o.studentEmail ?? o.StudentEmail,
            instructors: o.instructors ?? o.Instructors ?? [],
            courses: o.courses ?? o.Courses ?? [],
            price: Number((o.price ?? o.Price) ?? 0),
            paymentStatus: o.paymentStatus ?? o.PaymentStatus,
            courseStatus: o.courseStatus ?? o.CourseStatus,
            createdAt: o.createdAt ?? o.CreatedAt
          }))
        : [];
      setOrders(normalized);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
      if (String(error?.message || '').includes('401')) setAuthError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async (filterParams = {}) => {
    setPaymentsLoading(true);
    try {
      const data = await getAdminPayments(filterParams);
      // Hiển thị tối đa 10 giao dịch gần đây
      setPayments(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setPayments([]);
      if (String(error?.message || '').includes('401')) setAuthError(true);
    } finally {
      setPaymentsLoading(false);
    }
  };

  // Event handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    const filterParams = {};
    
    // Only add non-empty filters
    if (filters.studentName.trim()) filterParams.studentName = filters.studentName.trim();
    if (filters.courseTitle.trim()) filterParams.courseTitle = filters.courseTitle.trim();
    if (filters.paymentStatus) filterParams.paymentStatus = filters.paymentStatus;
    if (filters.dateFrom) filterParams.dateFrom = filters.dateFrom;
    if (filters.dateTo) filterParams.dateTo = filters.dateTo;

    fetchOrders(filterParams);
    fetchSummary(filterParams);
    fetchPayments(filterParams);
  };

  const handleClearFilters = () => {
    setFilters({
      studentName: '',
      courseTitle: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: ''
    });
    fetchOrders();
    fetchSummary();
    fetchPayments();
  };

  // Initial data load
  useEffect(() => {
    fetchSummary();
    fetchOrders();
    fetchPayments();
  }, []);

  const handleConfirmPayment = async (orderId) => {
    try {
      setActionLoadingId(orderId);
      await confirmOrderPayment(orderId, { VerificationNotes: 'Xác nhận từ trang quản lý đơn hàng' });
      await Promise.all([
        fetchOrders(filters.paymentStatus ? { paymentStatus: filters.paymentStatus } : {}),
        fetchSummary(),
        fetchPayments(),
      ]);
      alert('Đã xác nhận thanh toán cho đơn #' + orderId);
    } catch (e) {
      console.error('Confirm payment failed:', e);
      alert('Xác nhận thanh toán thất bại');
    } finally {
      setActionLoadingId(null);
    }
  };

  
  
  return (
      <AdminLayout title="Quản Lý Đơn Hàng" description="Theo dõi, tìm kiếm và quản lý tất cả các đơn hàng.">
        <div className="qlydonhang-page">
          {authError && (
            <div className="auth-warning" style={{
              background: '#fff7ed',
              border: '1px solid #fdba74',
              color: '#9a3412',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 16
            }}>
              Bạn chưa đăng nhập quản trị. Vui lòng <Link href="/admin-login" style={{ textDecoration: 'underline', color: '#9a3412' }}>đăng nhập</Link> để xem dữ liệu.
            </div>
          )}
          <div className="stats-grid">
            <div className="stat-card revenue">
              <div className="stat-content">
                <h3>Tổng Doanh Thu</h3>
                <p className="stat-value">{summary.totalRevenue.toLocaleString('vi-VN')} ₫</p>
              </div>
            </div>
            <div className="stat-card pending-payment">
              <div className="stat-content">
                <h3>Thanh Toán Chờ Xử Lý</h3>
                <p className="stat-value">{summary.pendingPayments}</p>
              </div>
            </div>
            <div className="stat-card completed-courses">
              <div className="stat-content">
                <h3>Đơn Hàng Hoàn Tất</h3>
                <p className="stat-value">{summary.completedOrders}</p>
              </div>
            </div>
            <div className="stat-card pending-instructor">
              <div className="stat-content">
                <h3>Chờ Thanh Toán cho Giảng Viên</h3>
                <p className="stat-value">{summary.pendingInstructorPayouts}</p>
              </div>
            </div>
          </div>

          {/* Revenue overview additional metrics */}
          
  
          <div className="controls-section">
            <div className="search-controls">
              <input
                type="text"
                name="studentName"
                placeholder="Tìm theo tên học viên..."
                value={filters.studentName}
                onChange={handleFilterChange}
                className="search-input"
              />
              <input
                type="text"
                name="courseTitle"
                placeholder="Tìm theo tên khóa học..."
                value={filters.courseTitle}
                onChange={handleFilterChange}
                className="search-input"
              />
            </div>
            <div className="filter-controls">
              <select
                name="paymentStatus"
                value={filters.paymentStatus}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Đã thanh toán</option>
                <option value="pending">Chờ thanh toán</option>
              </select>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
                className="filter-input"
                placeholder="Đến ngày"
              />
              <button onClick={handleSearch} className="btn btn-primary">
                Tìm kiếm
              </button>
              <button onClick={handleClearFilters} className="btn btn-secondary">
                Xóa bộ lọc
              </button>
            </div>
          </div>
  
          <div className="order-count">
            <span>Hiển thị {orders.length} đơn hàng</span>
            {loading && <span className="loading-text">Đang tải...</span>}
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã Đơn Hàng</th>
                  <th>Học Viên</th>
                  <th>Giảng Viên</th>
                  <th>Khóa Học</th>
                  <th>Ngày Đặt</th>
                  <th>Tổng Tiền</th>
                  <th>Trạng Thái Thanh Toán</th>
                  <th>Trạng Thái Khóa Học</th>
                  <th>Thao Tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map(order => (
                    <tr key={order.orderId}>
                      <td>#{order.orderId}</td>
                      <td>
                        <div className="student-info">
                          <span className="student-name">{order.student || 'N/A'}</span>
                          <span className="student-email">{order.studentEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <div className="instructor-info">
                          {order.instructors && order.instructors.length > 0 ? (
                            order.instructors.map((instructor, index) => (
                              <span key={index} className="instructor-name">
                                {instructor}
                                {index < order.instructors.length - 1 && ', '}
                              </span>
                            ))
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="course-info">
                          {order.courses && order.courses.length > 0 ? (
                            order.courses.map((course, index) => (
                              <span key={index} className="course-name">
                                {course}
                                {index < order.courses.length - 1 && ', '}
                              </span>
                            ))
                          ) : (
                            <span>N/A</span>
                          )}
                        </div>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="price">{Number(order.price || 0).toLocaleString('vi-VN')} ₫</td>
                      <td>
                        <span className={`status-badge ${order.paymentStatus === 'Paid' ? 'status-paid' : 'status-pending'}`}>
                          {order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${order.courseStatus === 'Completed' ? 'status-completed' : 'status-incomplete'}`}>
                          {order.courseStatus === 'Completed' ? 'Hoàn thành' : 'Chưa hoàn thành'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link 
                            href={`/admin/qlydonhang/chitietdonhang?id=${order.orderId}`}
                            className="btn btn-detail"
                          >
                            Xem chi tiết
                          </Link>
                          {order.paymentStatus !== 'Paid' && (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleConfirmPayment(order.orderId)}
                              disabled={actionLoadingId === order.orderId}
                            >
                              {actionLoadingId === order.orderId ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}
                            </button>
                          )}
                          </div>
                        </td>
                      </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                      Không có đơn hàng nào để hiển thị.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recent payments */}
          <div className="table-container" style={{ marginTop: 20 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Mã Giao Dịch</th>
                  <th>Đơn Hàng</th>
                  <th>Học Viên</th>
                  <th>Số Tiền</th>
                  <th>Phương Thức</th>
                  <th>Trạng Thái</th>
                  <th>Thời Gian</th>
                </tr>
              </thead>
              <tbody>
                {paymentsLoading ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      Đang tải giao dịch...
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map(p => (
                    <tr key={(p.PaymentId ?? p.paymentId)}>
                      <td>#{(p.PaymentId ?? p.paymentId)}</td>
                      <td>#{(p.OrderId ?? p.orderId)}</td>
                      <td>{((p.Student ?? p.student) ?? 'N/A')}</td>
                      <td className="price">{Number(((p.Amount ?? p.amount) ?? 0)).toLocaleString('vi-VN')} ₫</td>
                      <td>{((p.Method ?? p.method) ?? 'N/A')}</td>
                      <td>
                        <span className={`status-badge ${((((p.Status ?? p.status) ?? '').toLowerCase()) === 'success') ? 'status-paid' : 'status-pending'}`}>
                          {((((p.Status ?? p.status) ?? '').toLowerCase()) === 'success') ? 'Thành công' : ((p.Status ?? p.status) ?? 'N/A')}
                        </span>
                      </td>
                      <td>{p.PaidAt ? new Date(p.PaidAt).toLocaleString('vi-VN') : (p.paidAt ? new Date(p.paidAt).toLocaleString('vi-VN') : '—')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      Không có giao dịch nào gần đây.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminLayout>    
  );
}