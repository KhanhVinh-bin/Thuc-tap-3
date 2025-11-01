"use client"

import { useState, useEffect } from "react"
import { Award, Calendar, Download, Share2, BookOpen } from "lucide-react"
import Link from "next/link"

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)

  const API_URL = "https://localhost:7025/api"

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        const userString = localStorage.getItem("currentUser")
        if (!userString) throw new Error("Chưa đăng nhập")

        const user = JSON.parse(userString)
        const userId = user.userId || user.id
        const token = localStorage.getItem("authToken")

        const headers = {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        }

        const res = await fetch(`${API_URL}/Certificates/ByUser/${userId}`, { headers })
        if (res.ok) {
          setCertificates(await res.json())
        }
      } catch (err) {
        console.error("Lỗi khi tải chứng chỉ:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const handleDownload = (certificate) => {
    alert(`Đang tải xuống chứng chỉ: ${certificate.title}`)
  }

  const handleShare = (certificate) => {
    alert(`Chia sẻ chứng chỉ: ${certificate.title}`)
  }

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>

  return (
    <>
      <div className="max-w-6xl">
        <h1 className="text-3xl font-bold mb-2">Chứng chỉ</h1>
        <p className="text-gray-600 mb-8">Các chứng chỉ bạn đã đạt được</p>

        {/* Certificates */}
        {certificates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border rounded-lg overflow-hidden hover:shadow transition"
                  >
                    {/* Certificate header */}
                    <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Award className="w-16 h-16 mx-auto mb-3 opacity-90" />
                        <h3 className="text-lg font-semibold">{c.title}</h3>
                        <p className="text-sm opacity-80">Chứng chỉ hoàn thành</p>
                      </div>
                    </div>

                    {/* Certificate body */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-2">{c.courseName}</h4>
                      <p className="text-sm text-gray-600 mb-1">Giảng viên: {c.instructor}</p>

                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>Hoàn thành: {c.completedDate}</span>
                      </div>

                      <p className="text-xs text-gray-400 mb-4">ID: {c.certificateId}</p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(c)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                        >
                          <Download className="w-4 h-4" /> Tải xuống
                        </button>
                        <button
                          onClick={() => handleShare(c)}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center"
                        >
                          <Share2 className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="bg-white border rounded-lg p-12 text-center">
                <Award className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  Chưa có chứng chỉ nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Hoàn thành khóa học để nhận chứng chỉ và thể hiện thành tích học tập của bạn
                </p>
                <Link
                  href="/khoa-hoc-cua-toi"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition"
                >
                  <BookOpen className="w-4 h-4" />
                  Quay lại khóa học
                </Link>
              </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Về chứng chỉ
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>• Chứng chỉ được cấp khi bạn hoàn thành 100% nội dung khóa học</p>
            <p>• Chứng chỉ có thể được tải xuống dưới dạng PDF</p>
            <p>• Bạn có thể chia sẻ chứng chỉ trên các mạng xã hội chuyên nghiệp</p>
            <p>• Mỗi chứng chỉ có mã số duy nhất để xác thực tính hợp lệ</p>
          </div>
        </div>
      </div>
    </>
  )
}
