"use client"

import { CourseProvider } from "./context/CourseContext"

export default function KhoaHocLayout({ children }) {
  return <CourseProvider>{children}</CourseProvider>
}

