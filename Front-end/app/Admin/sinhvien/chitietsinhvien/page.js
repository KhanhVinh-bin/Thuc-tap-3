'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import './chitietsinhvien.css';

export default function StudentDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [student, setStudent] = useState(null);
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
    if (v === 'active') return 'Hoạt động';
    if (v === 'locked' || v === 'inactive') return 'Bị khóa';
    if (v === 'deleted') return 'Đã xóa';
    if (v === 'pending') return 'Đang chờ';
    return s;
  };
  const mapEnrollStatus = (s) => {
    if (!s) return 'Đang học';
    const v = s.toLowerCase();
    if (v.includes('complete')) return 'Hoàn thành';
    if (v.includes('progress') || v.includes('active') || v.includes('study')) return 'Đang học';
    if (v.includes('pause')) return 'Tạm dừng';
    return s;
  };
  const mapOrderStatus = (s) => {
    if (!s) return '';
    const v = s.toLowerCase();
    if (v.includes('paid') || v.includes('success')) return 'Đã thanh toán';
    if (v.includes('pending') || v.includes('processing')) return 'Đang xử lý';
    return s;
  };
  
  // Dữ liệu mẫu sinh viên
  const studentsData = [
    {
      id: 'STU001',
      name: 'Đặng Quang Thành',
      email: 'thanh12@gmail.com',
      phone: '0123456789',
      address: 'Trung Sơn, Bình Chánh',
      createdDate: '15/01/2024',
      status: 'Hoạt động',
      courses: [
        {
          name: 'React cơ bản',
          registrationDate: '20/01/2024',
          status: 'Đang học',
          progress: 80
        },
        {
          name: 'JavaScript nâng cao',
          registrationDate: '25/01/2024',
          status: 'Hoàn thành',
          progress: 100
        }
      ],
      payments: [
        {
          orderId: 'P0001',
          course: 'React cơ bản',
          amount: '1.500.000đ',
          date: '20/01/2024',
          status: 'Đã thanh toán'
        },
        {
          orderId: 'P0002',
          course: 'JavaScript nâng cao',
          amount: '2.500.000đ',
          date: '25/01/2024',
          status: 'Đã thanh toán'
        }
      ]
    },
    {
      id: 'STU002',
      name: 'Nguyễn Hữu Tài',
      email: 'tai12@gmail.com',
      phone: '0987654321',
      address: 'Quận 7, TP.HCM',
      createdDate: '10/01/2024',
      status: 'Hoạt động',
      courses: [
        {
          name: 'Node.js cơ bản',
          registrationDate: '15/01/2024',
          status: 'Đang học',
          progress: 60
        }
      ],
      payments: [
        {
          orderId: 'P0003',
          course: 'Node.js cơ bản',
          amount: '1.800.000đ',
          date: '15/01/2024',
          status: 'Đã thanh toán'
        }
      ]
    },
    {
      id: 'STU003',
      name: 'Nguyễn Hải Trường',
      email: 'truong12@gmail.com',
      phone: '0369852147',
      address: 'Quận 1, TP.HCM',
      createdDate: '05/01/2024',
      status: 'Hoạt động',
      courses: [
        {
          name: 'Python cơ bản',
          registrationDate: '10/01/2024',
          status: 'Hoàn thành',
          progress: 100
        },
        {
          name: 'Django Framework',
          registrationDate: '20/01/2024',
          status: 'Đang học',
          progress: 45
        }
      ],
      payments: [
        {
          orderId: 'P0004',
          course: 'Python cơ bản',
          amount: '1.200.000đ',
          date: '10/01/2024',
          status: 'Đã thanh toán'
        },
        {
          orderId: 'P0005',
          course: 'Django Framework',
          amount: '2.000.000đ',
          date: '20/01/2024',
          status: 'Đã thanh toán'
        }
      ]
    },
    {
      id: 'STU004',
      name: 'Phan Bích Như',
      email: 'nhu12@gmail.com',
      phone: '0147258369',
      address: 'Quận 3, TP.HCM',
      createdDate: '01/01/2024',
      status: 'CÚT',
      courses: [
        {
          name: 'HTML/CSS cơ bản',
          registrationDate: '05/01/2024',
          status: 'Tạm dừng',
          progress: 25
        }
      ],
      payments: [
        {
          orderId: 'P0006',
          course: 'HTML/CSS cơ bản',
          amount: '800.000đ',
          date: '05/01/2024',
          status: 'Đã thanh toán'
        }
      ]
    }
  ];

  useEffect(() => {
    const studentId = searchParams.get('id');
    if (!studentId) {
      setLoading(false);
      setError('Thiếu tham số id');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiFetch(`/admin/students/${studentId}`);
        if (res.status === 401 || res.status === 403) {
          setError('Vui lòng đăng nhập tài khoản Admin để xem chi tiết.');
          setLoading(false);
          return;
        }
        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Không tải được dữ liệu chi tiết.');
        }
        const s = await res.json();
        const view = {
          id: s.ID ?? s.Id ?? s.id ?? s.UserId ?? s.userId ?? null,
          name: s.FullName ?? s.fullName ?? s.Name ?? s.name ?? '',
          email: s.Email ?? s.email ?? '',
          phone: s.PhoneNumber ?? s.phoneNumber ?? '',
          address: s.Address ?? s.address ?? '',
          createdDate: formatDate(s.CreatedAt ?? s.createdAt),
          status: mapStatusToVi(s.Status ?? s.status),
          avatarUrl: s.AvatarUrl ?? s.avatarUrl ?? '',
          courses: (s.Enrollments ?? s.enrollments ?? []).map((e) => ({
            name: e.CourseTitle ?? e.courseTitle ?? '',
            registrationDate: formatDate(e.EnrollDate ?? e.enrollDate),
            status: mapEnrollStatus(e.Status ?? e.status),
            progress: 0
          })),
          payments: (s.Orders ?? s.orders ?? []).flatMap((o) => ((o.Items ?? o.items) || []).map((item) => ({
            orderId: o.OrderId ?? o.orderId,
            course: (item.CourseTitle ?? item.courseTitle) || '',
            amount: formatCurrency(o.TotalAmount ?? o.totalAmount),
            date: formatDate(o.OrderDate ?? o.orderDate),
            status: mapOrderStatus(o.Status ?? o.status)
          })))
        };
        setStudent(view);
      } catch (err) {
        setError(err.message || 'Lỗi không xác định');
      } finally {
        setLoading(false);
      }
    })();
  }, [searchParams]);

  const handleBackClick = () => {
    router.push('/admin/sinhvien');
  };

  if (!student) {
    return (
      <AdminLayout 
        title="Chi tiết sinh viên"
        description="Quản lý thông tin và các hoạt động của sinh viên"
      >
        <div className="loading-message">
          {loading ? (
            <p>Đang tải dữ liệu chi tiết sinh viên...</p>
          ) : (
            <p>{error || 'Không tìm thấy thông tin sinh viên.'}</p>
          )}
          <button className="back-button" onClick={handleBackClick}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Quay lại danh sách
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Chi tiết sinh viên"
      description="Quản lý thông tin và các hoạt động của sinh viên"
    >
      {/* Back button */}
      <div className="top-navigation">
        <button className="back-button" onClick={handleBackClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Chi tiết sinh viên
        </button>
        <p className="page-description">Quản lý thông tin và các hoạt động của sinh viên</p>
      </div>

      <div className="student-detail-content">
        {/* Student Header Section */}
        <div className="student-info-section">
          <div className="student-info-content">
            <div className="student-avatar-section">
              <img src={student.avatarUrl || '/placeholder-user.jpg'} alt="Student Avatar" className="student-detail-avatar" />
              <div className="student-basic-info">
                <h3>{student.name}</h3>
                <div className="student-id">Mã SV: {student.id}</div>
                <span className={`status-badge ${student.status === 'Hoạt động' ? 'active' : 'inactive'}`}>
                  {student.status}
                </span>
                <div className="student-stats">
                  <div className="stat-item">
                    <span className="stat-number">{student.courses.length}</span>
                    <span className="stat-label">Khóa học đăng ký</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{student.courses.filter(c => c.status === 'Hoàn thành').length}</span>
                    <span className="stat-label">Khóa học hoàn thành</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{student.payments.length}</span>
                    <span className="stat-label">Đơn hàng</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="student-details-grid">
              <div className="detail-item">
                <label>Họ và tên</label>
                <span>{student.name}</span>
              </div>
              <div className="detail-item">
                <label>Email</label>
                <span>{student.email}</span>
              </div>
              <div className="detail-item">
                <label>Số điện thoại</label>
                <span>{student.phone}</span>
              </div>
              <div className="detail-item">
                <label>Địa chỉ</label>
                <span>{student.address}</span>
              </div>
              <div className="detail-item">
                <label>Ngày tạo tài khoản</label>
                <span>{student.createdDate}</span>
              </div>
              <div className="detail-item">
                <label>Trạng thái</label>
                <span>{student.status}</span>
              </div>
            </div>
          </div>
        </div>

      {/* Course Registration History */}
        <div className="course-history-section">
          <div className="section-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Lịch sử đăng ký khóa học</h2>
          </div>
          
          <div className="course-list">
            {student.courses.map((course, index) => (
              <div key={index} className="course-item">
                <div className="course-info">
                  <h4>{course.name}</h4>
                  <p>Số học viên: 0 | Đánh giá: —</p>
                  <p>Đăng ký: {course.registrationDate}</p>
                </div>
                <div className="course-status">
                  <span className={`course-badge ${course.status === 'Hoàn thành' ? 'completed' : course.status === 'Đang học' ? 'studying' : 'paused'}`}>
                    {course.status}
                  </span>
                  <div className={`progress-text ${course.progress === 100 ? 'complete' : ''}`}>Tiến độ: {course.progress}%</div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{width: `${course.progress}%`}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div className="payment-history-section">
          <div className="section-header">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2>Lịch sử thanh toán</h2>
          </div>
          
          <div className="payment-table-container">
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Mã đơn hàng</th>
                  <th>Khóa học</th>
                  <th>Số tiền</th>
                  <th>Ngày thanh toán</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {student.payments.map((payment, index) => (
                  <tr key={index}>
                    <td>{payment.orderId}</td>
                    <td>{payment.course}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.date}</td>
                    <td>
                      <span className={`payment-badge ${payment.status === 'Đã thanh toán' ? 'success' : 'pending'}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}