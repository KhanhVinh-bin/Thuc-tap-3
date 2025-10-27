"use client"
import { useState } from "react"
import { Lock, Trash2 } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Sidebar from "@/components/sideBar"

export default function CaiDatPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!")
      return
    }
    alert("Đổi mật khẩu thành công (demo)")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Cài đặt tài khoản</h1>

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
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Đổi mật khẩu
            </button>
          </form>

          <div className="mt-12 border border-red-200 bg-red-50 rounded-lg p-6">
            <Trash2 className="text-red-500 w-6 h-6 mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Xóa tài khoản</h3>
            <p className="text-gray-600 mb-4">
              Xóa tài khoản và tất cả dữ liệu. Hành động này không thể hoàn tác.
            </p>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              Xóa tài khoản
            </button>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
