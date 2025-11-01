'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import './addbanner.css';
import Swal from 'sweetalert2';

export default function AddBanner() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageFile: null,
    imageUrl: '',
    position: 'Trang chủ',
    status: 'Đang hiển thị'
  });

  const [imagePreview, setImagePreview] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file
      }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || (!formData.imageFile && !formData.imageUrl)) {
      await Swal.fire({
        title: 'Lỗi!',
        text: 'Vui lòng điền đầy đủ thông tin và chọn hình ảnh.',
        icon: 'error'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Xác nhận tạo banner',
      text: 'Bạn có chắc chắn muốn tạo banner mới?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tạo banner',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await Swal.fire({
          title: 'Thành công!',
          text: 'Banner đã được tạo thành công.',
          icon: 'success'
        });
        
        router.push('/admin/banner');
      } catch (error) {
        await Swal.fire({
          title: 'Lỗi!',
          text: 'Có lỗi xảy ra khi tạo banner.',
          icon: 'error'
        });
      }
    }
  };

  const handleCancel = () => {
    router.push('/admin/banner');
  };

  return (
    <AdminLayout 
      title="Thêm banner mới"
      description="Tạo banner quảng cáo mới cho website"
    >
      {/* Back button */}
      <div className="top-navigation">
        <button className="back-button" onClick={handleCancel}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Quay lại danh sách
        </button>
      </div>

      {/* Form */}
      <div className="add-banner-form">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="title">Tiêu đề banner *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề banner"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả banner"
                rows="3"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Vị trí hiển thị</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
              >
                <option value="Trang chủ">Trang chủ</option>
                <option value="Khóa học">Khóa học</option>
                <option value="Về chúng tôi">Về chúng tôi</option>
                <option value="Liên hệ">Liên hệ</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Đang hiển thị">Đang hiển thị</option>
                <option value="Ẩn">Ẩn</option>
              </select>
            </div>
          </div>

          {/* Image upload */}
          <div className="form-group full-width">
            <label>Hình ảnh banner *</label>
            <div className="image-upload-section">
              <div className="upload-options">
                <div className="upload-option">
                  <label htmlFor="imageFile" className="upload-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 8L12 3L7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Tải lên từ máy tính
                  </label>
                  <input
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </div>
                
                <div className="upload-divider">hoặc</div>
                
                <div className="upload-option">
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="Nhập URL hình ảnh"
                    className="url-input"
                  />
                </div>
              </div>

              {/* Image preview */}
              {(imagePreview || formData.imageUrl) && (
                <div className="image-preview">
                  <img 
                    src={imagePreview || formData.imageUrl} 
                    alt="Preview" 
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              Tạo banner
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}