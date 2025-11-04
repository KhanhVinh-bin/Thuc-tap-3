"use client"

import { useState } from "react"
import Link from "next/link"
import { Award, BookOpen, Settings } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function MyCoursesLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const menu = [
    { id: "khoa-hoc-cua-toi", label: "Khóa học của tôi", icon: BookOpen, href: "/khoa-hoc-cua-toi" },
    // Tạm thời ẩn trang Chứng chỉ
    // { id: "chung-chi", label: "Chứng chỉ", icon: Award, href: "/khoa-hoc-cua-toi/chung-chi" },
    { id: "oders", label: "Lịch sử giao dịch", icon: Award, href: "/khoa-hoc-cua-toi/oders" },
    { id: "cai-dat", label: "Cài đặt", icon: Settings, href: "/khoa-hoc-cua-toi/cai-dat" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarCollapsed ? "w-20" : "w-64"
          } bg-white border-r border-gray-200 transition-all duration-300 sticky top-16 h-[calc(100vh-64px)] p-4`}
        >
          <nav className="space-y-2">
            {menu.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
      <Footer />
    </div>
  )
}
