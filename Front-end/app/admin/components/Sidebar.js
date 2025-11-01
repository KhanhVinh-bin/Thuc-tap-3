'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../shared-styles.css';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  // Initialize sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      const collapsed = JSON.parse(savedState);
      setIsCollapsed(collapsed);
    }
    setIsInitialized(true);
  }, []);

  // Update the admin layout class when sidebar state changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const adminLayout = document.querySelector('.admin-layout');
    if (adminLayout) {
      if (isCollapsed) {
        adminLayout.classList.add('sidebar-collapsed');
      } else {
        adminLayout.classList.remove('sidebar-collapsed');
      }
    }
  }, [isCollapsed, isInitialized]);

  // Prevent flash of unstyled content
  if (!isInitialized) {
    return null;
  }
  return (
    <>
      {/* Toggle Button */}
      <button 
        type="button"
        className={`sidebar-toggle ${isCollapsed ? 'collapsed' : ''}`}
        onClick={toggleSidebar}
        title={isCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
        aria-label={isCollapsed ? 'Mở sidebar' : 'Đóng sidebar'}
        aria-controls="admin-sidebar"
        aria-expanded={!isCollapsed}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <aside id="admin-sidebar" className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <ul>
          <li className={`nav-item ${pathname === '/admin/dashboard' ? 'active' : ''}`}>
            <Link href="/admin/dashboard">
              <span className="nav-icon">📊</span>
              Tổng Quan
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/sinhvien' ? 'active' : ''}`}>
            <Link href="/admin/sinhvien">
              <span className="nav-icon">👥</span>
              Quản lý sinh viên
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/giangvien' ? 'active' : ''}`}>
            <Link href="/admin/giangvien">
              <span className="nav-icon">🎓</span>
              Quản lý giảng viên
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/khoahoc' ? 'active' : ''}`}>
            <Link href="/admin/khoahoc">
              <span className="nav-icon">📚</span>
              Quản lý khóa học
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/thongkebaocao' ? 'active' : ''}`}>
            <Link href="/admin/thongkebaocao">
              <span className="nav-icon">💰</span>
              Quản lý doanh thu & báo cáo
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/binhluan" className={pathname === '/admin/binhluan' ? 'active' : ''}>
              <span className="nav-icon">⭐</span>
              Quản lý bình luận & đánh giá
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/banner' ? 'active' : ''}`}>
            <Link href="/admin/banner">
              <span className="nav-icon">🎯</span>
              Quản lý nội dung & banner
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/qlydonhang' ? 'active' : ''}`}>
            <Link href="/admin/qlydonhang">
              <span className="nav-icon">📝</span>
              Quản lý đơn hàng / thanh toán
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/qlythunhapgiangvien' ? 'active' : ''}`}>
            <Link href="/admin/qlythunhapgiangvien">
              <span className="nav-icon">🎨</span>
              Quản lý thu nhập giảng viên
            </Link>
          </li>
          <li className={`nav-item ${pathname === '/admin/qlythunhap' ? 'active' : ''}`}>
            <Link href="/admin/qlythunhap">
              <span className="nav-icon">👨‍💼</span>
              Quản lý thu nhập
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img src="/placeholder-user.jpg" alt="User" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">người dùng 1</span>
            <span className="user-role">Admin</span>
          </div>
        </div>
        <div className="sidebar-actions">
          <button className="logout-btn">🚪 Đăng xuất</button>
        </div>
      </div>
    </aside>
    </>
  );
}