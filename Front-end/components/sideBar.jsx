// components/Sidebar.jsx
"use client"
import Link from "next/link"
import { BookOpen, Award, Settings } from "lucide-react"
import { usePathname } from "next/navigation"

export default function sideBar() {
  const pathname = usePathname()

  const menuItems = [
    { label: "Khóa học của tôi", href: "/khoa-hoc-cua-toi", icon: BookOpen },
    { label: "Chứng chỉ", href: "/khoa-hoc-cua-toi/chung-chi", icon: Award },
    { label: "Cài đặt", href: "/khoa-hoc-cua-toi/cai-dat", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-64px)] sticky top-16">
      <nav className="p-4 space-y-2">
        {menuItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-600 font-semibold" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
