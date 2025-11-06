'use client';

import { useState, createContext, useContext, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import './shared-styles.css';

// Mở rộng context để quản lý cả header của trang
const AdminLayoutContext = createContext({
  isSidebarCollapsed: false,
  setIsSidebarCollapsed: () => {},
  headerState: {},
  setHeaderState: () => {},
});

export const useAdminLayout = () => useContext(AdminLayoutContext);

export default function AdminRouteLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [headerState, setHeaderState] = useState({});

  // Sử dụng useMemo để tránh re-render không cần thiết
  const contextValue = useMemo(() => ({
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    headerState,
    setHeaderState,
  }), [isSidebarCollapsed, headerState]);

  return (
    <AdminLayoutContext.Provider value={contextValue}>
      <div className={`admin-layout ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Rocket effects container */}
        <div className="rocket-container">
          <div className="rocket rocket-1">
            <div className="rocket-particles"></div>
          </div>
          <div className="rocket rocket-2">
            <div className="rocket-particles"></div>
          </div>
          <div className="rocket rocket-3">
            <div className="rocket-particles"></div>
          </div>
          <div className="rocket rocket-4">
            <div className="rocket-particles"></div>
          </div>
          <div className="rocket rocket-5">
            <div className="rocket-particles"></div>
          </div>
          <div className="rocket rocket-6">
            <div className="rocket-particles"></div>
          </div>
          <div className="rocket rocket-7">
            <div className="rocket-particles"></div>
          </div>
          <div className="rocket rocket-8">
            <div className="rocket-particles"></div>
          </div>
        </div>
        
        <Sidebar />
        <main className="main-content" role="main">
          <div className="content-wrapper">
            {/* Phần Header của trang, được điều khiển bởi các trang con thông qua context */}
            {(headerState.title || headerState.description || headerState.headerLeftExtras || headerState.headerRightActions) && (
              <div className="page-header">
                <div className="header-left">
                  {headerState.title && <h1>{headerState.title}</h1>}
                  {headerState.description && <p className="page-description">{headerState.description}</p>}
                  {headerState.headerLeftExtras}
                </div>
                <div className="header-right">
                  <div className="actions">
                    {headerState.headerRightActions}
                  </div>
                </div>
              </div>
            )}
            <div className="page-content">
              {children}
            </div>
          </div>
        </main>
      </div>
    </AdminLayoutContext.Provider>
  );
}