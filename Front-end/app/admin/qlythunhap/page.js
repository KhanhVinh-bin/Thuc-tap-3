'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './qlythunhap.css';

export default function IncomeManagementPage() {
  const router = useRouter();

  const courses = [
    { id: 'CS001', name: 'Khóa học React', instructor: 'Đặng Quang Thành', students: 217, revenue: 39000000, paid: 27300000 },
    { id: 'CS002', name: 'Lập trình Web', instructor: 'Nguyễn Hữu Tài', students: 198, revenue: 24120000, paid: 16884000 },
    { id: 'CS003', name: 'Digital Marketing', instructor: 'Nguyễn Hải Trường', students: 231, revenue: 21560000, paid: 15092000 },
    { id: 'CS004', name: 'Tất cả khóa học', instructor: 'Phan Bích Như', students: 236, revenue: 22500000, paid: 16000000 }
  ];

  const instructors = [
    { id: 'INS001', name: 'Đặng Quang Thành', courseCount: 2, students: 217, totalRevenue: 39000000, totalPaid: 27300000 },
    { id: 'INS002', name: 'Nguyễn Hữu Tài', courseCount: 1, students: 198, totalRevenue: 24120000, totalPaid: 16884000 },
    { id: 'INS003', name: 'Nguyễn Hải Trường', courseCount: 1, students: 231, totalRevenue: 21560000, totalPaid: 15092000 },
    { id: 'INS004', name: 'Phan Bích Như', courseCount: 1, students: 236, totalRevenue: 22500000, totalPaid: 16000000 }
  ];

  const stats = useMemo(() => {
    const totalRevenue = courses.reduce((s, c) => s + c.revenue, 0);
    const totalPaid = courses.reduce((s, c) => s + c.paid, 0);
    const profit = totalRevenue - totalPaid;
    const totalStudents = courses.reduce((s, c) => s + c.students, 0);
    return { totalRevenue, totalPaid, profit, totalStudents, activeCourses: courses.length };
  }, [courses]);

  const currency = (n) => n.toLocaleString('vi-VN') + ' đ';

  const exportToExcel = () => {
    const rows1 = [['Mã khóa học','Khóa học','Giảng viên','Học viên','Doanh thu','Chi trả GV','Lợi nhuận']]
      .concat(courses.map(c => [c.id,c.name,c.instructor,c.students,currency(c.revenue),currency(c.paid),currency(c.revenue-c.paid)]));
    const rows2 = [['Mã GV','Giảng viên','Số khóa học','Học viên','Tổng doanh thu','Chi trả GV','Lợi nhuận']]
      .concat(instructors.map(i => [i.id,i.name,i.courseCount,i.students,currency(i.totalRevenue),currency(i.totalPaid),currency(i.totalRevenue-i.totalPaid)]));
    const toCSV = (rows) => rows.map(r => r.map(v => `"${String(v).replace(/"/g,'\"')}"`).join(',')).join('\n');
    const blob = new Blob([`Bảng doanh thu theo khóa học\n`+toCSV(rows1)+'\n\n'+`Tổng hợp theo giảng viên\n`+toCSV(rows2)], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'bao-cao-thu-nhap.csv'; a.click(); URL.revokeObjectURL(a.href);
  };

  const exportToPDF = () => { window.print(); };

  const linePointsRevenue = '0,150 50,140 100,135 150,120 200,130 250,110 300,115 350,105 400,120 450,100 500,95 550,85';
  const linePointsProfit  = '0,180 50,175 100,170 150,165 200,160 250,158 300,155 350,150 400,148 450,146 500,145 550,143';
  const barsCost = [26,18,15,12,14,16,19,21,20,22,25,28];
  const barsProfit = [11,7,6,5,6,7,8,9,8,10,12,14];

  return (
    <AdminLayout 
      title="Quản lý doanh thu & Thu nhập"
      description="Thống kê tổng hợp doanh thu, chi phí và lợi nhuận của nền tảng"
    >
      <div className="controls-section">
        <div></div>
        <div className="action-buttons">
          <button className="btn btn-secondary" onClick={exportToExcel}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2"/><path d="M7 10l5 5l5-5" stroke="currentColor" strokeWidth="2"/></svg>
            Xuất Excel
          </button>
          <button className="btn btn-primary" onClick={exportToPDF}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2"/></svg>
            Xuất PDF
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card total-revenue"><div className="stat-label">Tổng doanh thu</div><div className="stat-value">{currency(stats.totalRevenue)}</div></div>
        <div className="stat-card paid"><div className="stat-label">Chi trả giảng viên</div><div className="stat-value">{currency(stats.totalPaid)}</div></div>
        <div className="stat-card profit"><div className="stat-label">Lợi nhuận thực</div><div className="stat-value">{currency(stats.profit)}</div></div>
        <div className="stat-card total-students"><div className="stat-label">Tổng học viên</div><div className="stat-value">{stats.totalStudents}</div></div>
        <div className="stat-card active-courses"><div className="stat-label">Số khóa học</div><div className="stat-value">{stats.activeCourses}</div></div>
      </div>

      <div className="chart-grid">
        <div className="card chart-card">
          <div className="card-header"><h3 className="card-title">Doanh thu theo thời gian</h3><span className="chip">Theo tháng</span></div>
          <div className="card-content">
            <svg className="line-chart" viewBox="0 0 560 200" preserveAspectRatio="none">
              <polyline points={linePointsRevenue} fill="none" stroke="#3b82f6" strokeWidth="2" />
              <polyline points={linePointsProfit} fill="none" stroke="#22c55e" strokeWidth="2" />
            </svg>
            <div className="chart-legend"><span className="dot blue"></span> Doanh thu <span className="dot green"></span> Lợi nhuận</div>
          </div>
        </div>
        <div className="card chart-card">
          <div className="card-header"><h3 className="card-title">Chi phí & Lợi nhuận</h3><span className="chip">Theo tháng</span></div>
          <div className="card-content">
            <div className="bar-chart">
              {barsCost.map((v, i) => (
                <div key={'c'+i} className="bar-group">
                  <div className="bar cost" style={{height: v*3}}></div>
                  <div className="bar profit" style={{height: barsProfit[i]*3}}></div>
                  <div className="bar-label">T{i+1}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend"><span className="dot purple"></span> Chi trả GV <span className="dot green"></span> Lợi nhuận</div>
          </div>
        </div>
      </div>

      <div className="card table-section">
        <div className="card-header"><h3 className="card-title">Doanh thu theo khóa học</h3><div className="filter-group"><select className="filter-select"><option>Tất cả khóa học</option><option>Frontend</option><option>Backend</option></select><svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"/></svg></div></div>
        <div className="card-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã khóa học</th><th>Khóa học</th><th>Giảng viên</th><th>Học viên</th><th>Doanh thu</th><th>Chi trả GV</th><th>Lợi nhuận</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id}</td>
                    <td>{c.name}</td>
                    <td><button className="link" onClick={() => router.push('/admin/giangvien')}>{c.instructor}</button></td>
                    <td>{c.students}</td>
                    <td>{currency(c.revenue)}</td>
                    <td>{currency(c.paid)}</td>
                    <td className="text-green">{currency(c.revenue - c.paid)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon btn-view" onClick={() => router.push('/admin/qlythunhapgiangvien')}>Chi tiết</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card table-section">
        <div className="card-header"><h3 className="card-title">Tổng hợp theo giảng viên</h3><div className="filter-group"><select className="filter-select"><option>Tất cả giảng viên</option><option>Đang hoạt động</option></select><svg className="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5"/></svg></div></div>
        <div className="card-content">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Mã GV</th><th>Giảng viên</th><th>Số khóa học</th><th>Học viên</th><th>Tổng doanh thu</th><th>Chi trả GV</th><th>Lợi nhuận</th><th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((i) => (
                  <tr key={i.id}>
                    <td>{i.id}</td>
                    <td><button className="link" onClick={() => router.push('/admin/giangvien')}>{i.name}</button></td>
                    <td>{i.courseCount}</td>
                    <td>{i.students}</td>
                    <td>{currency(i.totalRevenue)}</td>
                    <td>{currency(i.totalPaid)}</td>
                    <td className="text-green">{currency(i.totalRevenue - i.totalPaid)}</td>
                    <td><div className="action-buttons"><button className="btn-icon btn-view" onClick={() => router.push('/admin/qlythunhapgiangvien')}>Chi tiết</button></div></td>
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