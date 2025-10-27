'use client';

import Sidebar from './Sidebar';
import '../shared-styles.css';

export default function AdminLayout({ children, title, description }) {
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {/* Page Header */}
          {(title || description) && (
            <div className="page-header">
              {title && <h1>{title}</h1>}
              {description && <p>{description}</p>}
            </div>
          )}

          {/* Page Content */}
          <div className="page-content">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}