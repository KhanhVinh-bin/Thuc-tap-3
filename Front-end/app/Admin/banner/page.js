'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../components/AdminLayout';
import './banner.css';
import Swal from 'sweetalert2';

export default function BannerManagement() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả vị trí');
  const [sortFilter, setSortFilter] = useState('Tất cả trạng thái');

  // Sample banner data
  const banners = [
    {
      id: 'BN001',
      image: '/react-course.png',
      title: 'Khóa học React',
      description: 'Học React từ cơ bản đến nâng cao',
      position: 'Trang chủ',
      status: 'Đang hiển thị',
      statusType: 'active',
      createdDate: '20/04/2024'
    },
    {
      id: 'BN002',
      image: '/nodejs-course.jpg',
      title: 'Lập trình Web',
      description: 'Xây dựng ứng dụng web hiện đại',
      position: 'Khóa học',
      statusType: 'active',
      status: 'Đang hiển thị',
      createdDate: '11/04/2024'
    },
    {
      id: 'BN003',
      image: '/mongodb-course.jpg',
      title: 'Digital Marketing',
      description: 'Chiến lược marketing số hiệu quả',
      position: 'Trang chủ',
      status: 'Đang hiển thị',
      statusType: 'active',
      createdDate: '13/04/2024'
    },
    {
      id: 'BN004',
      image: '/cpp-course.jpg',
      title: 'Tất cả khóa học',
      description: 'Chương trình học toàn diện',
      position: 'Khuyến mãi',
      status: 'Đã ẩn',
      statusType: 'inactive',
      createdDate: '25/03/2024'
    }
  ];

  const totalBanners = banners.length;
  const activeBanners = banners.filter(banner => banner.statusType === 'active').length;

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         banner.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tất cả vị trí' || banner.position === statusFilter;
    const matchesSort = sortFilter === 'Tất cả trạng thái' || banner.status === sortFilter;
    
    return matchesSearch && matchesStatus && matchesSort;
  });

  const handleAddBanner = () => {
    router.push('/admin/banner/addbanner');
  };

  const handleEdit = (bannerId) => {
    alert(`Chỉnh sửa banner ${bannerId}`);
  };

  const handleDelete = async (bannerId) => {
    const banner = banners.find(b => b.id === bannerId);
    const result = await Swal.fire({
      title: 'Xóa banner?',
      text: `Bạn có chắc chắn muốn xóa banner "${banner?.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: 'Đã xóa!',
        text: 'Banner đã được xóa thành công.',
        icon: 'success'
      });
    }
  };

  const handleView = (bannerId) => {
    router.push(`/admin/banner/chitietbanner?id=${bannerId}`);
  };

  return (
    <AdminLayout 
      title="Quản lý nội dung & banner"
      description="Quản lý các banner quảng cáo và nội dung hiển thị trên website"
    >
      {/* Header */}
      <div className="content-header">
        <div className="header-left">
          <button className="btn-add-banner" onClick={handleAddBanner}>
            ➕ Thêm banner mới
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-container">
        <div className="stat-card total">
          <div className="stat-number">{totalBanners}</div>
          <div className="stat-label">Tổng số banner</div>
        </div>
        <div className="stat-card active">
          <div className="stat-number">{activeBanners}</div>
          <div className="stat-label">Đang hiển thị</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
          <div className="filters">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option>Tất cả vị trí</option>
              <option>Trang chủ</option>
              <option>Khóa học</option>
              <option>Khuyến mãi</option>
            </select>
            <select 
              value={sortFilter} 
              onChange={(e) => setSortFilter(e.target.value)}
              className="filter-select"
            >
              <option>Tất cả trạng thái</option>
              <option>Đang hiển thị</option>
              <option>Đã ẩn</option>
            </select>
          </div>
        </div>

        {/* Banner Table */}
        <div className="table-container">
          <div className="table-header">
            <h3>Danh sách banner ({filteredBanners.length})</h3>
          </div>
          
          <table className="banner-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tiêu đề</th>
                <th>Vị trí</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.map((banner) => (
                <tr key={banner.id}>
                  <td className="banner-id">{banner.id}</td>
                  <td className="banner-image">
                    <img src={banner.image} alt={banner.title} />
                  </td>
                  <td className="banner-title">
                    <div className="title-content">
                      <h4>{banner.title}</h4>
                      <p>{banner.description}</p>
                    </div>
                  </td>
                  <td className="banner-position">
                    <span className={`position-badge ${banner.position.toLowerCase().replace(' ', '-')}`}>
                      {banner.position}
                    </span>
                  </td>
                  <td className="banner-status">
                    <span className={`status-badge ${banner.statusType}`}>
                      {banner.status}
                    </span>
                  </td>
                  <td className="banner-date">{banner.createdDate}</td>
                  <td className="banner-actions">
                    <div className="action-buttons">
                      <button 
                        className="btn btn-icon btn-view"
                        onClick={() => handleView(banner.id)}
                        title="Xem chi tiết"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </button>
                      <button 
                        className="btn btn-icon btn-edit"
                        onClick={() => handleEdit(banner.id)}
                        title="Chỉnh sửa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                      <button 
                        className="btn btn-icon btn-delete"
                        onClick={() => handleDelete(banner.id)}
                        title="Xóa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminLayout>
    );
  }