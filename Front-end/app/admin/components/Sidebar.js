'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import '../shared-styles.css';
import './Sidebar.css';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      // Import SweetAlert2 dynamically
      const Swal = (await import('sweetalert2')).default;
      
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Đăng xuất',
        text: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Đăng xuất',
        cancelButtonText: 'Hủy'
      });

      if (result.isConfirmed) {
        // Clear all authentication tokens
        localStorage.removeItem('admin_token');
        localStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('admin_token');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('auth_token');
        
        // Clear any other admin-related data
        localStorage.removeItem('admin_user');
        localStorage.removeItem('user_data');
        sessionStorage.removeItem('admin_user');
        sessionStorage.removeItem('user_data');

        // Show success message
        await Swal.fire({
          title: 'Đã đăng xuất!',
          text: 'Bạn đã đăng xuất thành công.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // Redirect to admin login page
        router.push('/admin-login');
      }
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      // Fallback logout without confirmation
      localStorage.clear();
      sessionStorage.clear();
      router.push('/admin-login');
    }
  };
  // Define navigation items centrally
  const navItems = [
    { href: '/admin/dashboard', label: 'Tổng Quan', icon: '📊' },
    { href: '/admin/sinhvien', label: 'Quản lý sinh viên', icon: '👥' },
    { href: '/admin/giangvien', label: 'Quản lý giảng viên', icon: '🎓' },
    { href: '/admin/khoahoc', label: 'Quản lý khóa học', icon: '📚' },
    { href: '/admin/thongkebaocao', label: 'Quản lý doanh thu & báo cáo', icon: '📈' },
    
    { href: '/admin/binhluan', label: 'Quản lý bình luận & đánh giá', icon: '⭐' },
    { href: '/admin/banner', label: 'Quản lý nội dung & banner', icon: '🎯' },
    { href: '/admin/qlydonhang', label: 'Quản lý đơn hàng / thanh toán', icon: '📝' },
    { href: '/admin/qlythunhapgiangvien', label: 'Quản lý thu nhập giảng viên', icon: '🎨' },
    { href: '/admin/qlythunhap', label: 'Quản lý thu nhập', icon: '👨‍💼' }
  ];

  const isActive = (href) => pathname && pathname.startsWith(href);

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
      <nav className="sidebar-nav" role="navigation" aria-label="Admin Navigation">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className={`nav-item ${isActive(item.href) ? 'active' : ''}`}>
              <Link href={item.href}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
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
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}