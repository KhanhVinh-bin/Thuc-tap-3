'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

  const API_BASE = 'https://localhost:7166';
  const getToken = () => (
    typeof window !== 'undefined'
      ? (
          localStorage.getItem('admin_token') ||
          sessionStorage.getItem('admin_token') ||
          localStorage.getItem('token') ||
          sessionStorage.getItem('token') ||
          localStorage.getItem('auth_token') ||
          ''
        )
      : null
  );

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

    if (!formData.title || !formData.imageFile) {
      await Swal.fire({
        title: 'Lỗi!',
        text: 'Vui lòng nhập tiêu đề và chọn tệp ảnh từ máy tính.',
        icon: 'error'
      });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Xác nhận tạo banner',
      text: 'Bạn có chắc chắn muốn tạo banner mới?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Tạo banner',
      cancelButtonText: 'Hủy'
    });
    if (!confirm.isConfirmed) return;

    try {
      // Upload file để lấy imageUrl (lưu trong wwwroot/image/banner)
      const fd = new FormData();
      fd.append('file', formData.imageFile);

      const uploadRes = await fetch(`${API_BASE}/admin/banners/upload-file`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken() || ''}` },
        body: fd
      });
      if (!uploadRes.ok) {
        let msg = `HTTP ${uploadRes.status}`;
        try { const j = await uploadRes.json(); msg = j?.message || msg; } catch {}
        throw new Error(`Upload ảnh thất bại: ${msg}`);
      }
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData?.imageUrl;
      if (!imageUrl) throw new Error('Upload trả về thiếu imageUrl');

      // Tạo banner với imageUrl vừa có
      const payload = {
        title: formData.title.trim(),
        imageUrl,
        linkUrl: null,
        sortOrder: 0,
        isActive: formData.status === 'Đang hiển thị',
        startDate: new Date().toISOString(),
        endDate: null
      };

      const res = await fetch(`${API_BASE}/admin/banners`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken() || ''}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const j = await res.json(); msg = j?.message || msg; } catch { const t = await res.text().catch(() => ''); if (t) msg = t; }
        throw new Error(msg);
      }

      await Swal.fire({ title: 'Thành công!', text: 'Banner đã được tạo thành công.', icon: 'success' });
      router.push('/admin/banner');
    } catch (error) {
      console.error(error);
      await Swal.fire({ title: 'Lỗi!', text: `Có lỗi xảy ra khi tạo banner: ${error.message || 'Không rõ nguyên nhân'}`, icon: 'error' });
    }
  };

  const handleCancel = () => {
    router.push('/admin/banner');
  };

  return (
    <>
      {/* Modal Overlay + Container */}
      <div className="add-banner-overlay">
        <div className="add-banner-modal">
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title-section">
              <h2 className="modal-title">Thêm banner mới</h2>
              <p className="modal-subtitle">Tạo banner quảng cáo mới cho website</p>
            </div>
            <button className="close-btn" onClick={handleCancel}>×</button>
          </div>

          {/* Form */}
          <form className="banner-form" onSubmit={handleSubmit}>
            {/* Tiêu đề */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Tiêu đề <span className="required">*</span>
              </label>
              <input
                className="form-input"
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề banner"
                required
              />
            </div>

            {/* Mô tả */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Mô tả <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Nhập mô tả chi tiết về bannner"
                rows={3}
                required
              />
            </div>

            {/* Hình ảnh banner - chỉ upload từ máy tính, bỏ nhập URL */}
            <div className="form-group">
              <label className="form-label">Hình ảnh banner <span className="required">*</span></label>
              <div className="image-upload-section">
                <div className="upload-area">
                  <label htmlFor="imageFile" className="upload-btn">
                    <span className="upload-icon">⭳</span>
                    Upload từ máy tính
                  </label>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    className="file-input"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Đã bỏ phần nhập URL và divider */}
                {imagePreview && (
                  <div className="image-preview">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Vị trí & Trạng thái */}
            <div className="form-row">
              <div className="form-group half-width">
                <label className="form-label" htmlFor="position">
                  Vị trí hiển thị <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                >
                  <option value="Trang chủ">Trang chủ</option>
                  <option value="Khóa học">Khóa học</option>
                  <option value="Khuyến mãi">Khuyến mãi</option>
                </select>
              </div>

              <div className="form-group half-width">
                <label className="form-label" htmlFor="status">
                  Trạng thái <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="Đang hiển thị">Đang hiển thị</option>
                  <option value="Bị ẩn">Bị ẩn</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Đóng
              </button>
              <button type="submit" className="submit-btn">
                Tạo banner
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}