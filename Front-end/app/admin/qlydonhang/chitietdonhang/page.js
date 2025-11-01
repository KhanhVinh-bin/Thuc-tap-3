'use client';

import Link from 'next/link';
import { useState } from 'react';
import './chitietdonhang.css';

export default function ChiTietDonHangPage() {
  const [orderData] = useState({
    orderId: 'ORD001',
    title: 'Chi tiết đơn hàng #ORD001',
    subtitle: 'Thông tin chi tiết về đơn hàng và tiến độ giao dịch',
    
    // Payment Status Card
    paymentStatus: {
      title: 'TT thanh toán',
      status: 'Đã thanh toán',
      statusColor: '#10B981',
      amount: '1.999.000'
    },
    
    // Course Status Card  
    courseStatus: {
      title: 'TT khóa học',
      status: 'Hoàn thành',
      statusColor: '#8B5CF6',
      totalAmount: '1.999.000'
    },
    
    // Student Info Card
    studentInfo: {
      title: 'Thông tin học viên',
      studentId: 'STU001',
      name: 'Đặng Quang Thành',
      email: 'thanh2@gmail.com'
    },
    
    // Course Info Card
    courseInfo: {
      title: 'Thông tin khóa học',
      courseId: 'CRD001',
      courseName: 'Khóa học React',
      instructor: 'TS Đặng Quang Thành'
    },
    
    // Payment Info
    paymentInfo: {
      title: 'Thông tin thanh toán',
      transactionId: 'TXN20240001',
      paymentMethod: 'Chuyển khoản ngân hàng',
      coursePrice: '1.999.000',
      paymentDate: '19/08/2025'
    },
    
    // Instructor Payment
    instructorPayment: {
      title: 'Chi trả giảng viên',
      rate: 'Tỷ lệ chia sẻ: 70% / Nền tảng: 30%',
      instructorAmount: '1.399.300',
      status: 'Trạng thái',
      statusValue: 'Hoàn tất',
      statusColor: '#10B981',
      paymentDate: '19/08/2025'
    },
    
    // Timeline
    timeline: [
      {
        id: 1,
        title: 'Đơn hàng được tạo',
        date: '2024-19-08 10:30 • Hệ thống',
        status: 'created'
      },
      {
        id: 2,
        title: 'Xác nhận thanh toán',
        date: '2024-19-08 14:30 • Admin người dùng',
        status: 'paid'
      },
      {
        id: 3,
        title: 'Đã nhận chuyển khoản',
        date: '',
        status: 'completed'
      },
      {
        id: 4,
        title: 'Khóa học hoàn thành',
        date: '2024-19-08 • Hệ thống',
        status: 'completed'
      },
      {
        id: 5,
        title: 'Đã chi trả giảng viên',
        date: '2024-19-08 14:30 • Admin người dùng',
        status: 'instructor_paid'
      },
      {
        id: 6,
        title: 'Chuyển khoản 70% = 1.399.300đ',
        date: '',
        status: 'completed'
      }
    ]
  });

  return (
    <div className="order-detail-container">
      {/* Header */}
      <div className="order-detail-header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <Link href="/admin/qlydonhang" className="back-button">
          ← Quay lại danh sách
        </Link>
        <div className="header-content">
          <h1>{orderData.title}</h1>
          <p>{orderData.subtitle}</p>
        </div>
      </div>

      <div className="order-detail-content">
        {/* Top Cards Row */}
        <div className="cards-row grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Payment Status Card */}
          <div className="info-card payment-card">
            <h3>{orderData.paymentStatus.title}</h3>
            <div className="status-badge" style={{backgroundColor: orderData.paymentStatus.statusColor}}>
              {orderData.paymentStatus.status}
            </div>
            <div className="amount">{orderData.paymentStatus.amount}</div>
          </div>

          {/* Course Status Card */}
          <div className="info-card course-card">
            <h3>{orderData.courseStatus.title}</h3>
            <div className="status-badge" style={{backgroundColor: orderData.courseStatus.statusColor}}>
              {orderData.courseStatus.status}
            </div>
            <div className="amount">{orderData.courseStatus.totalAmount}</div>
          </div>

          {/* Student Info Card */}
          <div className="info-card student-card">
            <h3>{orderData.studentInfo.title}</h3>
            <div className="info-item">
              <span className="label">Mã học viên</span>
              <span className="value">{orderData.studentInfo.studentId}</span>
            </div>
            <div className="info-item">
              <span className="label">Họ và tên</span>
              <span className="value">{orderData.studentInfo.name}</span>
            </div>
            <div className="info-item">
              <span className="label">Email</span>
              <span className="value">{orderData.studentInfo.email}</span>
            </div>
          </div>

          {/* Course Info Card */}
          <div className="info-card course-info-card">
            <h3>{orderData.courseInfo.title}</h3>
            <div className="info-item">
              <span className="label">Mã khóa học</span>
              <span className="value">{orderData.courseInfo.courseId}</span>
            </div>
            <div className="info-item">
              <span className="label">Tên khóa học</span>
              <span className="value">{orderData.courseInfo.courseName}</span>
            </div>
            <div className="info-item">
              <span className="label">Giảng viên</span>
              <span className="value">{orderData.courseInfo.instructor}</span>
            </div>
          </div>
        </div>

        {/* Bottom Cards Row */}
        <div className="cards-row grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Payment Info Card */}
          <div className="info-card payment-info-card">
            <h3>{orderData.paymentInfo.title}</h3>
            <div className="info-item">
              <span className="label">Mã giao dịch</span>
              <span className="value">{orderData.paymentInfo.transactionId}</span>
            </div>
            <div className="info-item">
              <span className="label">Hình thức thanh toán</span>
              <span className="value">{orderData.paymentInfo.paymentMethod}</span>
            </div>
            <div className="info-item">
              <span className="label">Giá khóa học</span>
              <span className="value">{orderData.paymentInfo.coursePrice}</span>
            </div>
            <div className="info-item">
              <span className="label">Ngày thanh toán</span>
              <span className="value">{orderData.paymentInfo.paymentDate}</span>
            </div>
          </div>

          {/* Instructor Payment Card */}
          <div className="info-card instructor-payment-card">
            <h3>{orderData.instructorPayment.title}</h3>
            <div className="info-item">
              <span className="label">{orderData.instructorPayment.rate}</span>
            </div>
            <div className="info-item">
              <span className="label">Số tiền giảng viên nhận</span>
              <span className="value amount-highlight">{orderData.instructorPayment.instructorAmount}</span>
            </div>
            <div className="info-item">
              <span className="label">{orderData.instructorPayment.status}</span>
              <div className="status-badge" style={{backgroundColor: orderData.instructorPayment.statusColor}}>
                {orderData.instructorPayment.statusValue}
              </div>
            </div>
            <div className="info-item">
              <span className="label">Ngày chi trả</span>
              <span className="value">{orderData.instructorPayment.paymentDate}</span>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="timeline-section bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3>📋 Nhật ký thay đổi trạng thái</h3>
          <p>Lịch sử các thay đổi và các mốc đơn hàng</p>
          
          <div className="timeline">
            {orderData.timeline.map((item, index) => (
              <div key={item.id} className={`timeline-item ${item.status}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-title">{item.title}</div>
                  {item.date && <div className="timeline-date">{item.date}</div>}
                </div>
                <div className="timeline-status">
                  {item.status === 'created' && 'created'}
                  {item.status === 'paid' && 'paid'}
                  {item.status === 'completed' && 'completed'}
                  {item.status === 'instructor_paid' && 'instructor_paid'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}