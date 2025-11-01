"use client"
import { useState, useEffect } from "react"
import { Lock, Trash2, User, Mail, Phone, MapPin, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const API_URL = "https://localhost:7025/api"

export default function CaiDatPage() {
  const { user, token, logout } = useAuth()
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    bio: ''
  });

  const buildHeaders = (extra = {}) => {
    const headers = { 'Content-Type': 'application/json', ...extra }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  const getUserId = () => user?.userId ?? user?.id ?? null

  useEffect(() => {
    let mounted = true
    const studentId = getUserId()
    if (!studentId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(`${API_URL}/Students/${studentId}`, {
          headers: buildHeaders()
        })

        if (!res.ok) {
          const text = await res.text().catch(() => '')
          throw new Error(`Lỗi API (${res.status}) ${text}`)
        }

        const data = await res.json()

        if (!mounted) return
        setProfile(data)
        setFormData({
          fullName: data.fullName ?? '',
          email: data.email ?? '',
          phoneNumber: data.phoneNumber ?? '',
          address: data.address ?? '',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          gender: data.gender ?? '',
          bio: data.bio ?? ''
        })
      } catch (err) {
        console.error("Lỗi khi tải thông tin học viên:", err)
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProfile()
    return () => { mounted = false }
  }, [user, token])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    if (!user) { alert("Vui lòng đăng nhập để cập nhật thông tin!"); return }

    const studentId = getUserId()
    if (!studentId) { alert("Không tìm thấy ID học viên!"); return }

    setSaving(true)
    try {
      const updateData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        bio: formData.bio,
        status: profile?.status ?? 'active',
        enrollmentCount: profile?.enrollmentCount ?? 0,
        completedCourses: profile?.completedCourses ?? 0,
        totalCertificates: profile?.totalCertificates ?? 0,
        lastActive: new Date().toISOString()
      }

      const res = await fetch(`${API_URL}/Students/${studentId}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify(updateData)
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Lỗi API (${res.status}) ${text}`)
      }

      alert("Cập nhật thông tin thành công!")
      const newProfileRes = await fetch(`${API_URL}/Students/${studentId}`, { headers: buildHeaders() })
      if (newProfileRes.ok) {
        const newProfileData = await newProfileRes.json()
        setProfile(newProfileData)
        setFormData(prev => ({ ...prev, fullName: newProfileData.fullName ?? prev.fullName }))
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật thông tin:", err)
      alert("Lỗi khi cập nhật thông tin: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!user) { alert("Vui lòng đăng nhập để thay đổi mật khẩu!"); return }
    if (!currentPassword || !newPassword || !confirmPassword) { alert("Vui lòng điền đầy đủ thông tin mật khẩu!"); return }
    if (newPassword !== confirmPassword) { alert("Mật khẩu xác nhận không khớp!"); return }
    if (newPassword.length < 6) { alert("Mật khẩu mới phải có ít nhất 6 ký tự!"); return }

    setSaving(true)
    try {
      const userId = getUserId()
      const res = await fetch(`${API_URL}/Users/${userId}/ChangePassword`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Lỗi API (${res.status}) ${text}`)
      }

      alert("Đổi mật khẩu thành công!")
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err)
      alert("Lỗi khi đổi mật khẩu: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) { alert("Vui lòng đăng nhập để thực hiện thao tác này!"); return }
    const studentId = getUserId()
    if (!studentId) { alert("Không tìm thấy ID học viên!"); return }

    if (!confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu của bạn!")) return

    try {
      const res = await fetch(`${API_URL}/Students/${studentId}`, {
        method: 'DELETE',
        headers: buildHeaders()
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`Lỗi API (${res.status}) ${text}`)
      }

      localStorage.removeItem('currentUser')
      if (logout) logout()
      window.location.href = '/'
    } catch (err) {
      console.error("Lỗi khi xóa tài khoản:", err)
      alert("Lỗi khi xóa tài khoản: " + err.message)
    }
  }

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>
  if (error) return <p className="text-red-500 p-6">Lỗi: {error}</p>

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h1>

              <form onSubmit={handleProfileUpdate} className="max-w-2xl mb-12 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                  </div>

                  {/* Email (disabled) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-100"
                        value={formData.email}
                        readOnly
                        disabled
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Nhập địa chỉ"
                      />
                    </div>
                  </div>

                  {/* Date of birth */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
                    <select
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu bản thân</label>
                  <textarea
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Viết một vài điều về bản thân..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {saving ? "Đang lưu..." : "Cập nhật thông tin"}
                </button>
              </form>

              <h2 className="text-2xl font-bold text-gray-900 mb-6">Đổi mật khẩu</h2>

              <form onSubmit={handlePasswordChange} className="max-w-lg space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Nhập mật khẩu mới"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      type="password"
                      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Xác nhận mật khẩu mới"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  {saving ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
              </form>

              <div className="mt-12 border border-red-200 bg-red-50 rounded-lg p-6">
                <Trash2 className="text-red-500 w-6 h-6 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Xóa tài khoản</h3>
                <p className="text-gray-600 mb-4">
                  Xóa tài khoản và tất cả dữ liệu. Hành động này không thể hoàn tác.
                </p>
                <button 
                  onClick={handleDeleteAccount}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa tài khoản
                </button>
              </div>
    </>
  )
}
