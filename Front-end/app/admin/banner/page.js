'use client';

import React, { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import './banner.css';
import { Plus, Search, SlidersHorizontal, Eye, FilePenLine, Trash2 } from 'lucide-react';

export default function BannerPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả vị trí');
  const [sortFilter, setSortFilter] = useState('Tất cả trạng thái');

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

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mapBanner = (b) => ({
    id: b.bannerId ?? b.id,
    image: b.imageUrl ?? b.image,
    title: b.title ?? '',
    description: b.linkUrl ?? b.description ?? '',
    position: b.position ?? 'Trang chủ',
    status: b.status ?? (b.isActive ? 'Đang hiển thị' : 'Đã ẩn'),
    statusType: b.statusType ?? (b.isActive ? 'active' : 'inactive'),
    createdDate: b.createdDate ?? (b.startDate ? new Date(b.startDate).toLocaleDateString('vi-VN') : '')
  });

  const fetchBanners = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (sortFilter === 'Đang hiển thị') params.set('isActive', 'true');
      if (sortFilter === 'Đã ẩn') params.set('isActive', 'false');

      const res = await fetch(`${API_BASE}/admin/banners?${params.toString()}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${getToken() || ''}`
        }
      });
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      setBanners(Array.isArray(data) ? data.map(mapBanner) : []);
    } catch (e) {
      console.error(e);
      setError('Không thể tải danh sách banner.');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortFilter]);

  const totalBanners = banners.length;
  const activeBanners = banners.filter(banner => banner.statusType === 'active').length;

  const filteredBanners = banners.filter(banner => {
    const matchesSearch = banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (banner.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'Tất cả vị trí' || banner.position === statusFilter;
    const matchesSort = sortFilter === 'Tất cả trạng thái' || banner.status === sortFilter;
    return matchesSearch && matchesStatus && matchesSort;
  });

  const handleAddBanner = () => {
    router.push('/admin/banner/addbanner');
  };

  const handleEdit = (bannerId) => {
    router.push(`/admin/banner/edit?id=${bannerId}`);
  };

  const handleDelete = async (bannerId) => {
    const Swal = (await import('sweetalert2')).default;
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
      try {
        const res = await fetch(`${API_BASE}/admin/banners/${bannerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${getToken() || ''}` }
        });
        if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
        await Swal.fire({ title: 'Đã xóa!', text: 'Banner đã được xóa thành công.', icon: 'success' });
        fetchBanners();
      } catch (e) {
        console.error(e);
        await Swal.fire({ title: 'Lỗi', text: 'Xóa banner thất bại.', icon: 'error' });
      }
    }
  };

  const handleView = (bannerId) => {
    router.push(`/admin/banner/chitietbanner?id=${bannerId}`);
  };

  return (
    <>
      {/* Header */}
      <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="header-left">
          <h1>Quản lý nội dung & banner</h1>
          <p>Quản lý các banner quảng cáo và nội dung hiển thị trên website</p>
        </div>
        <div className="header-right">
          <button className="btn-add-banner" onClick={handleAddBanner}>
            <Plus size={16} className="mr-2" /> Thêm banner mới
          </button>
        </div>
      </div>
      {/* Optional: hiển thị lỗi/tải */}
      {error && <div style={{ color: '#b91c1c', fontWeight: 600, marginBottom: 12 }}>{error}</div>}
      {loading && <div style={{ color: '#64748b', marginBottom: 12 }}>Đang tải...</div>}

      {/* Statistics Cards */}
      <div className="stats-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
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
      <div className="search-filters flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="search-bar w-full md:w-1/2 relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Tìm kiếm theo tiêu đề, mô tả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" />
        </div>
    
        <div className="filters">
          {/* Sửa: chỉ giữ một className */}
          <select
            className="filter-select w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>Tất cả vị trí</option>
            <option>Trang chủ</option>
            <option>Khóa học</option>
            <option>Khuyến mãi</option>
          </select>
          <SlidersHorizontal className="dropdown-arrow" />
    
          {/* Sửa: chỉ giữ một className */}
          <select
            className="filter-select w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ml-0 md:ml-4 mt-4 md:mt-0"
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option>Tất cả trạng thái</option>
            <option>Đang hiển thị</option>
            <option>Đã ẩn</option>
          </select>
          <SlidersHorizontal className="dropdown-arrow" />
        </div>
      </div>
    
      {/* Banner Table */}
      <div className="table-container overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
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
                      <Eye size={18} />
                    </button>
                    <button 
                      className="btn btn-icon btn-edit"
                      onClick={() => handleEdit(banner.id)}
                      title="Chỉnh sửa"
                    >
                      <FilePenLine size={18} />
                    </button>
                    <button 
                      className="btn btn-icon btn-delete"
                      onClick={() => handleDelete(banner.id)}
                      title="Xóa"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}