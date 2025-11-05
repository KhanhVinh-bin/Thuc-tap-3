"use client"
import { useState, useEffect, useRef } from "react"
import { Lock, Trash2, Upload, Image as ImageIcon, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Image from "next/image"

const API_URL = "https://localhost:7025/api"

export default function CaiDatPage() {
  const { user, token, logout, login } = useAuth()
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  const buildHeaders = (extra = {}) => {
    const headers = { ...extra }
    if (!extra['Content-Type']) headers['Content-Type'] = 'application/json'
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  const getUserId = () => user?.userId ?? user?.id ?? null

  // Load avatar từ user
  useEffect(() => {
    if (user) {
      // Lấy avatar từ user object hoặc localStorage
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem("currentUser") : null
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          const userAvatar = parsedUser.avatarUrl || user.avatarUrl || user.AvatarUrl
          if (userAvatar) {
            setAvatarUrl(userAvatar)
            setAvatarPreview(userAvatar)
          }
        } catch (e) {
          console.error("Error parsing user:", e)
        }
      }
    }
  }, [user])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!user) { alert("Vui lòng đăng nhập để thay đổi mật khẩu!"); return }
    if (!currentPassword || !newPassword || !confirmPassword) { 
      alert("Vui lòng điền đầy đủ thông tin mật khẩu!"); 
      return 
    }
    if (newPassword !== confirmPassword) { 
      alert("Mật khẩu xác nhận không khớp!"); 
      return 
    }
    if (newPassword.length < 6) { 
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!"); 
      return 
    }

    setSaving(true)
    try {
      const userId = getUserId()
      if (!userId) {
        throw new Error("Không tìm thấy ID người dùng!")
      }

      const res = await fetch(`${API_URL}/Users/${userId}/ChangePassword`, {
        method: 'POST',
        headers: buildHeaders(),
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let errorMessage = `Lỗi API (${res.status}) ${text}`
        try {
          const errorData = JSON.parse(text)
          errorMessage = errorData.message || errorData.Message || errorMessage
        } catch (e) {
          // Giữ nguyên errorMessage nếu không parse được
        }
        throw new Error(errorMessage)
      }

      alert("✅ Đổi mật khẩu thành công!")
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      console.error("Lỗi khi đổi mật khẩu:", err)
      alert("❌ Lỗi khi đổi mật khẩu: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Kiểm tra đuôi file (chỉ png, jpg, jpeg)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const allowedExtensions = ['png', 'jpg', 'jpeg']
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert("⚠️ Chỉ chấp nhận file ảnh có đuôi .png, .jpg hoặc .jpeg")
      return
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert("⚠️ File ảnh không được vượt quá 5MB")
      return
    }

    // Đọc file và convert sang base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      setAvatarPreview(base64String)
      // Lưu base64 vào state để upload
      setAvatarUrl(base64String)
    }
    reader.onerror = () => {
      alert("❌ Lỗi khi đọc file ảnh")
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async () => {
    if (!avatarPreview || !avatarUrl) {
      alert("⚠️ Vui lòng chọn ảnh đại diện!")
      return
    }

    if (!user) {
      alert("⚠️ Vui lòng đăng nhập!")
      return
    }

    const userId = getUserId()
    if (!userId) {
      alert("⚠️ Không tìm thấy ID người dùng!")
      return
    }

    setUploadingAvatar(true)
    try {
      // Lấy thông tin user hiện tại trước
      const getUserRes = await fetch(`${API_URL}/Users/${userId}`, {
        headers: buildHeaders()
      })

      if (!getUserRes.ok) {
        throw new Error("Không thể lấy thông tin người dùng")
      }

      const currentUserData = await getUserRes.json()

      // Update avatar URL
      const updateRes = await fetch(`${API_URL}/Users/${userId}`, {
        method: 'PUT',
        headers: buildHeaders(),
        body: JSON.stringify({
          fullName: currentUserData.fullName || currentUserData.FullName || user.name || "",
          phoneNumber: currentUserData.phoneNumber || currentUserData.PhoneNumber || "",
          address: currentUserData.address || currentUserData.Address || "",
          avatarUrl: avatarUrl, // Base64 data URL
          dateOfBirth: currentUserData.dateOfBirth || currentUserData.DateOfBirth || null,
          gender: currentUserData.gender || currentUserData.Gender || "",
          bio: currentUserData.bio || currentUserData.Bio || "",
          status: currentUserData.status || currentUserData.Status || "active"
        })
      })

      if (!updateRes.ok) {
        const text = await updateRes.text().catch(() => '')
        throw new Error(`Lỗi API (${updateRes.status}) ${text}`)
      }

      // Cập nhật user trong localStorage và context
      const updatedUser = {
        ...user,
        avatarUrl: avatarUrl
      }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      if (login) {
        login(updatedUser, token)
      }

      alert("✅ Cập nhật ảnh đại diện thành công!")
      
      // Giữ preview để người dùng thấy ngay
      // Không reset preview
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      console.error("Lỗi khi upload avatar:", err)
      alert("❌ Lỗi khi upload avatar: " + err.message)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setAvatarUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  if (error) return <p className="text-red-500 p-6">Lỗi: {error}</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cài đặt tài khoản</h1>

      {/* Đổi mật khẩu */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-indigo-600" />
          Đổi mật khẩu
        </h2>

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
      </div>

      {/* Xóa tài khoản */}
      <div className="bg-white rounded-lg shadow-sm border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-4">
          <Trash2 className="text-red-500 w-6 h-6 flex-shrink-0 mt-1" />
          <div className="flex-1">
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
        </div>
      </div>
    </div>
  )
}
