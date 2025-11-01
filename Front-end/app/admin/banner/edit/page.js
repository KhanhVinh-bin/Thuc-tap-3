'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './edit.css';
import Swal from 'sweetalert2';

export default function EditBanner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bannerId = searchParams.get('id');

  const fileInputRef = useRef(null);

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // FE-only, không gửi BE
  const [position, setPosition] = useState('Trang chủ');
  const [status, setStatus] = useState('Đang hiển thị');
  const [imageUrl, setImageUrl] = useState('');       // Ảnh hiện có từ BE
  const [imageFile, setImageFile] = useState(null);   // Ảnh chọn mới từ máy
  const [imagePreview, setImagePreview] = useState(''); // dataURL ảnh mới

  const mapPositionToLink = (pos) => {
    switch (pos) {
      case 'Khóa học':
        return '/courses';
      case 'Khuyến mãi':
        return '/promo';
      default:
        return '/';
    }
  };

  const mapLinkToPosition = (linkUrl) => {
    if (!linkUrl) return 'Trang chủ';
    const url = String(linkUrl).toLowerCase();
    if (url.includes('promo') || url.includes('sale') || url.includes('khuyen')) return 'Khuyến mãi';
    if (url.includes('course')) return 'Khóa học';
    return 'Trang chủ';
  };

  useEffect(() => {
    const loadDetail = async () => {
      if (!bannerId) {
        setError('Thiếu tham số id của banner.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/admin/banners/${bannerId}`, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${getToken() || ''}`
          }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        setTitle(data.title || '');
        setDescription(''); // Không có trên BE, để trống theo UI
        setPosition(mapLinkToPosition(data.linkUrl));
        setStatus(data.isActive ? 'Đang hiển thị' : 'Bị ẩn'); // Theo ảnh UI
        setImageUrl(data.imageUrl || '');
        setImagePreview(''); // Chỉ hiển thị preview nếu chọn ảnh mới
      } catch (e) {
        console.error(e);
        setError('Không thể tải dữ liệu banner.');
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bannerId]);

  const handleChangeImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    // Nếu muốn buộc đổi ảnh, ta cũng clear ảnh cũ:
    setImageUrl('');
  };

  const handleClose = () => {
    router.push('/admin/banner');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      await Swal.fire({ title: 'Lỗi', text: 'Vui lòng nhập tiêu đề.', icon: 'error' });
      return;
    }
    // Nếu đã xóa ảnh cũ và chưa chọn ảnh mới -> báo lỗi
    if (!imageUrl && !imageFile) {
      await Swal.fire({ title: 'Lỗi', text: 'Vui lòng chọn ảnh banner từ máy tính.', icon: 'error' });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Lưu thay đổi?',
      text: 'Bạn có chắc chắn muốn cập nhật banner này?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Hủy'
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    try {
      let finalImageUrl = imageUrl;

      // Nếu có chọn ảnh mới thì upload trước
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const up = await fetch(`${API_BASE}/admin/banners/upload-file`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${getToken() || ''}` },
          body: fd
        });
        if (!up.ok) {
          let msg = `HTTP ${up.status}`;
          try { const j = await up.json(); msg = j?.message || msg; } catch {}
          throw new Error(`Upload ảnh thất bại: ${msg}`);
        }
        const upData = await up.json();
        finalImageUrl = upData?.imageUrl || '';
      }

      const payload = {
        title: title.trim(),
        imageUrl: finalImageUrl || undefined,
        linkUrl: mapPositionToLink(position),
        isActive: status === 'Đang hiển thị'
      };

      const res = await fetch(`${API_BASE}/admin/banners/${bannerId}`, {
        method: 'PUT',
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

      await Swal.fire({ title: 'Thành công', text: 'Cập nhật banner thành công.', icon: 'success' });
      router.push('/admin/banner');
    } catch (e) {
      console.error(e);
      await Swal.fire({ title: 'Lỗi', text: e.message || 'Không thể lưu thay đổi.', icon: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="edit-loading">Đang tải dữ liệu...</div>;
  }
  if (error) {
    return (
      <div className="edit-error">
        {error}
        <button className="edit-btn-secondary" onClick={handleClose}>Quay lại</button>
      </div>
    );
  }

  return (
    <div className="edit-overlay">
      <div className="edit-modal">
        <div className="edit-header">
          <div>
            <h2 className="edit-title">Sửa nội dung banner</h2>
            <p className="edit-subtitle">Cập nhật thông tin banner</p>
          </div>
          <button className="edit-close" onClick={handleClose}>×</button>
        </div>

        <div className="edit-form">
          {/* Tiêu đề */}
          <div className="edit-group">
            <label className="edit-label">Tiêu đề <span className="req">*</span></label>
            <input
              className="edit-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Khóa học React 2024 - Giảm giá 50%"
            />
          </div>

          {/* Mô tả (FE-only) */}
          <div className="edit-group">
            <label className="edit-label">Mô tả <span className="req">*</span></label>
            <textarea
              className="edit-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Học React từ cơ bản đến nâng cao với giảng viên 10+ năm kinh nghiệm."
              rows={3}
            />
          </div>

          {/* Ảnh banner */}
          <div className="edit-group">
            <label className="edit-label">Hình ảnh banner <span className="req">*</span></label>

            {(imagePreview || imageUrl) && (
              <div className="edit-image-preview">
                <img src={imagePreview || imageUrl} alt="Banner" />
                <button className="edit-image-remove" onClick={handleRemoveImage}>×</button>
              </div>
            )}

            <div className="edit-upload">
              <button type="button" className="edit-upload-btn" onClick={handleChangeImageClick}>
                <span className="edit-upload-icon">📤</span>
                Thay đổi ảnh
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Vị trí & Trạng thái */}
          <div className="edit-row">
            <div className="edit-col">
              <label className="edit-label">Vị trí hiển thị <span className="req">*</span></label>
              <select className="edit-select" value={position} onChange={(e) => setPosition(e.target.value)}>
                <option value="Trang chủ">Trang chủ</option>
                <option value="Khóa học">Khóa học</option>
                <option value="Khuyến mãi">Khuyến mãi</option>
              </select>
            </div>
            <div className="edit-col">
              <label className="edit-label">Trạng thái <span className="req">*</span></label>
              <select className="edit-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Đang hiển thị">Đang hiển thị</option>
                <option value="Bị ẩn">Bị ẩn</option>
              </select>
            </div>
          </div>

          {/* Action */}
          <div className="edit-actions">
            <button type="button" className="edit-btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
            <button type="button" className="edit-btn-secondary" onClick={handleClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}