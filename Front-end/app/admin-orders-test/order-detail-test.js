'use client';

import { useState } from 'react';

export default function OrderDetailTestPage() {
  const [testData, setTestData] = useState(null);
  const [orderId, setOrderId] = useState('1');

  // Dữ liệu test đầy đủ phù hợp với mockdata
  const generateTestData = (id) => {
    return {
      orderId: parseInt(id),
      order: {
        orderId: parseInt(id),
        orderDate: "2024-12-20T10:30:00.000Z",
        totalAmount: 1299000,
        status: "paid",
        createdAt: "2024-12-20T10:30:00.000Z"
      },
      student: {
        userId: 4,
        fullName: "Hồ Khánh",
        email: "khanh.ho@student.vn",
        phoneNumber: "0987654321",
        createdAt: "2024-11-15T08:00:00.000Z"
      },
      latestPayment: {
        paymentId: 1,
        paymentMethod: "VNPay",
        transactionId: "TXN123456789",
        amount: 1299000,
        paymentStatus: "success",
        paidAt: "2024-12-20T12:16:49.138Z"
      },
      orderDetails: [
        {
          orderDetailId: 1,
          courseId: 101,
          price: 799000,
          quantity: 1,
          course: {
            courseId: 101,
            title: "Lập trình JavaScript từ cơ bản đến nâng cao",
            description: "Khóa học JavaScript toàn diện cho người mới bắt đầu",
            price: 799000,
            duration: "45",
            level: "beginner",
            language: "vi",
            instructor: {
              userId: 5,
              fullName: "Nguyễn Văn Minh",
              email: "minh.nguyen@instructor.vn"
            },
            category: {
              categoryId: 2,
              name: "Lập trình Frontend"
            }
          }
        },
        {
          orderDetailId: 2,
          courseId: 102,
          price: 500000,
          quantity: 1,
          course: {
            courseId: 102,
            title: "CSS và Responsive Design",
            description: "Thiết kế giao diện web responsive chuyên nghiệp",
            price: 500000,
            duration: "30",
            level: "intermediate",
            language: "vi",
            instructor: {
              userId: 6,
              fullName: "Trần Thị Lan",
              email: "lan.tran@instructor.vn"
            },
            category: {
              categoryId: 2,
              name: "Lập trình Frontend"
            }
          }
        }
      ],
      verifications: [
        {
          verifiedAt: "2024-12-20T12:16:49.139Z",
          status: "verified",
          verifiedBy: "Admin System",
          notes: "Giao dịch hợp lệ - Thanh toán qua VNPay thành công"
        }
      ]
    };
  };

  // Dữ liệu test với format PascalCase (để test tương thích)
  const generateTestDataPascalCase = (id) => {
    return {
      OrderId: parseInt(id),
      Order: {
        OrderId: parseInt(id),
        OrderDate: "2024-12-20T10:30:00.000Z",
        TotalAmount: 1299000,
        Status: "paid",
        CreatedAt: "2024-12-20T10:30:00.000Z"
      },
      Student: {
        UserId: 4,
        FullName: "Hồ Khánh",
        Email: "khanh.ho@student.vn",
        PhoneNumber: "0987654321",
        CreatedAt: "2024-11-15T08:00:00.000Z"
      },
      LatestPayment: {
        PaymentId: 1,
        PaymentMethod: "VNPay",
        TransactionId: "TXN123456789",
        Amount: 1299000,
        PaymentStatus: "success",
        PaidAt: "2024-12-20T12:16:49.138Z"
      },
      OrderDetails: [
        {
          OrderDetailId: 1,
          CourseId: 101,
          Price: 799000,
          Quantity: 1,
          Course: {
            CourseId: 101,
            Title: "Lập trình JavaScript từ cơ bản đến nâng cao",
            Description: "Khóa học JavaScript toàn diện cho người mới bắt đầu",
            Price: 799000,
            Duration: "45",
            Level: "beginner",
            Language: "vi",
            Instructor: {
              UserId: 5,
              FullName: "Nguyễn Văn Minh",
              Email: "minh.nguyen@instructor.vn"
            },
            Category: {
              CategoryId: 2,
              Name: "Lập trình Frontend"
            }
          }
        },
        {
          OrderDetailId: 2,
          CourseId: 102,
          Price: 500000,
          Quantity: 1,
          Course: {
            CourseId: 102,
            Title: "CSS và Responsive Design",
            Description: "Thiết kế giao diện web responsive chuyên nghiệp",
            Price: 500000,
            Duration: "30",
            Level: "intermediate",
            Language: "vi",
            Instructor: {
              UserId: 6,
              FullName: "Trần Thị Lan",
              Email: "lan.tran@instructor.vn"
            },
            Category: {
              CategoryId: 2,
              Name: "Lập trình Frontend"
            }
          }
        }
      ],
      Verifications: [
        {
          VerifiedAt: "2024-12-20T12:16:49.139Z",
          Status: "verified",
          VerifiedBy: "Admin System",
          Notes: "Giao dịch hợp lệ - Thanh toán qua VNPay thành công"
        }
      ]
    };
  };

  const handleTestCamelCase = () => {
    const data = generateTestData(orderId);
    setTestData(data);
    console.log('Test Data (camelCase):', data);
  };

  const handleTestPascalCase = () => {
    const data = generateTestDataPascalCase(orderId);
    setTestData(data);
    console.log('Test Data (PascalCase):', data);
  };

  const handleCopyToClipboard = () => {
    if (testData) {
      navigator.clipboard.writeText(JSON.stringify(testData, null, 2));
      alert('Đã copy dữ liệu test vào clipboard!');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Order Detail Test Data Generator</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Order ID:</label>
        <input
          type="number"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleTestCamelCase}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Generate camelCase Data
        </button>
        
        <button
          onClick={handleTestPascalCase}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Generate PascalCase Data
        </button>

        {testData && (
          <button
            onClick={handleCopyToClipboard}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            📋 Copy to Clipboard
          </button>
        )}
      </div>

      {testData && (
        <div>
          <h2>📊 Generated Test Data:</h2>
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3>📋 Summary:</h3>
            <ul>
              <li><strong>Order ID:</strong> {testData.orderId || testData.OrderId}</li>
              <li><strong>Student:</strong> {testData.student?.fullName || testData.Student?.FullName}</li>
              <li><strong>Total Amount:</strong> {(testData.latestPayment?.amount || testData.LatestPayment?.Amount)?.toLocaleString('vi-VN')} ₫</li>
              <li><strong>Payment Status:</strong> {testData.latestPayment?.paymentStatus || testData.LatestPayment?.PaymentStatus}</li>
              <li><strong>Courses:</strong> {(testData.orderDetails || testData.OrderDetails)?.length} khóa học</li>
            </ul>
          </div>

          <h3>🔍 Raw JSON Data:</h3>
          <pre style={{
            backgroundColor: '#f1f3f4',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '12px',
            border: '1px solid #ccc'
          }}>
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <h3>📝 Hướng dẫn sử dụng:</h3>
        <ol>
          <li>Nhập Order ID muốn test</li>
          <li>Chọn format dữ liệu (camelCase hoặc PascalCase)</li>
          <li>Copy dữ liệu và sử dụng trong API test</li>
          <li>Dữ liệu bao gồm đầy đủ: Order, Student, Payment, OrderDetails, Verifications</li>
        </ol>
        
        <h4>🔗 API Endpoints để test:</h4>
        <ul>
          <li><code>GET /api/admin/orders/test/{orderId}</code> - API test với dữ liệu mẫu</li>
          <li><code>GET /api/admin/orders/{orderId}</code> - API thực từ database</li>
        </ul>
      </div>
    </div>
  );
}