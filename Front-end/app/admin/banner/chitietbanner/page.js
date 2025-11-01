'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import './chitietbanner.css';
import Swal from 'sweetalert2';

export default function BannerDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerId = searchParams.get('id');

  // Sample banner data - in real app, this would come from API
  const [bannerData, setBannerData] = useState({
    id: 'BN001',
    title: 'Khóa học thiết kế',
    description: 'Học React từ cơ bản đến nâng cao với giảng viên 10+ năm kinh nghiệm. Ưu đãi đặc biệt chỉ trong tháng này!',
    image: '/sample-banner.svg',
    createdDate: '20/04/2024',
    position: 'Trang chủ',
    status: 'Đang hiển thị',
    priority: 1
  });

  const handleGoBack = () => {
    router.push('/admin/banner');
  };

  const handleEdit = () => {
    // Navigate to edit page or open edit modal
    Swal.fire({
      title: 'Chỉnh sửa banner',
      text: 'Chức năng chỉnh sửa sẽ được triển khai sau',
      icon: 'info'
    });
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Xóa banner',
      text: `Bạn có chắc chắn muốn xóa banner "${bannerData.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      // Delete logic here
      await Swal.fire({
        title: 'Đã xóa!',
        text: 'Banner đã được xóa thành công.',
        icon: 'success'
      });
      router.push('/admin/banner');
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = bannerData.status === 'Đang hiển thị' ? 'Đã ẩn' : 'Đang hiển thị';
    
    const result = await Swal.fire({
      title: `${newStatus === 'Đang hiển thị' ? 'Hiển thị' : 'Ẩn'} banner`,
      text: `Bạn có chắc chắn muốn ${newStatus === 'Đang hiển thị' ? 'hiển thị' : 'ẩn'} banner này?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Đang hiển thị' ? '#16a34a' : '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: newStatus === 'Đang hiển thị' ? 'Hiển thị' : 'Ẩn',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      setBannerData(prev => ({
        ...prev,
        status: newStatus
      }));

      await Swal.fire({
        title: 'Thành công!',
        text: `Banner đã được ${newStatus === 'Đang hiển thị' ? 'hiển thị' : 'ẩn'}.`,
        icon: 'success'
      });
    }
  };

  return (
    <AdminLayout 
      title="Chi tiết banner"
      description="Thông tin chi tiết về banner quảng cáo"
    >
      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={handleGoBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Quay lại</span>
        </button>
      </div>

      <div className="banner-detail-container">
        {/* Banner Image Section */}
        <div className="banner-image-section">
          <h3>Hình ảnh banner</h3>
          <div className="banner-image-container">
            <img 
              src={bannerData.image} 
              alt={bannerData.title}
              className="banner-image"
            />
          </div>
        </div>

        {/* Banner Information Sections */}
        <div className="banner-info-sections">
          {/* Basic Information */}
          <div className="info-section">
            <h3>Thông tin cơ bản</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>ID banner</label>
                <span>{bannerData.id}</span>
              </div>
              <div className="info-item">
                <label>Ngày tạo</label>
                <span>{bannerData.createdDate}</span>
              </div>
              <div className="info-item full-width">
                <label>Tiêu đề</label>
                <span>{bannerData.title}</span>
              </div>
              <div className="info-item full-width">
                <label>Mô tả</label>
                <span>{bannerData.description}</span>
              </div>
            </div>
          </div>

          {/* Display Configuration */}
          <div className="info-section">
            <h3>Cấu hình hiển thị</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Vị trí hiển thị</label>
                <span className="position-badge">{bannerData.position}</span>
              </div>
              <div className="info-item">
                <label>Trạng thái</label>
                <span className={`status-badge ${bannerData.status === 'Đang hiển thị' ? 'active' : 'inactive'}`}>
                  {bannerData.status}
                </span>
              </div>
              <div className="info-item">
                <label>Thứ tự ưu tiên</label>
                <span className="priority-badge">{bannerData.priority}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons-container">
        <button className="btn-secondary" onClick={handleEdit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Chỉnh sửa
        </button>
        
        <button 
          className={`btn-toggle ${bannerData.status === 'Đang hiển thị' ? 'hide' : 'show'}`}
          onClick={handleToggleStatus}
        >
          {bannerData.status === 'Đang hiển thị' ? 'Ẩn banner' : 'Hiển thị banner'}
        </button>
        
        <button className="btn-danger" onClick={handleDelete}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Xóa banner
        </button>
      </div>
    </AdminLayout>
  );
}