'use client';
import '../shared-styles.css';

export default function AdminTopbar() {
  return (
    <header className="topbar" role="banner">
      <div className="topbar-left">
        <span className="brand">Quản trị hệ thống</span>
      </div>
      <div className="topbar-right">
        <div className="topbar-actions">
          <button className="topbar-btn" aria-label="Thông báo">🔔</button>
          <button className="topbar-btn" aria-label="Cài đặt">⚙️</button>
        </div>
      </div>
    </header>
  );
}