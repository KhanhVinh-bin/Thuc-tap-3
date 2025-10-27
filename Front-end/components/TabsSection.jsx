"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

export default function TabsSection() {
  return (
    <section className="mt-8">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100 p-2 rounded-xl flex justify-center mb-6">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
        </TabsList>

        {/* Tổng quan */}
        <TabsContent value="overview">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold mb-3">Giới thiệu khóa học</h3>
            <p>
              Khóa học React từ cơ bản đến nâng cao, giúp bạn nắm vững các kiến thức và kỹ năng cần thiết
              để trở thành một React Developer chuyên nghiệp.
            </p>
          </div>
        </TabsContent>

        {/* Nội dung */}
        <TabsContent value="content">
          <div className="grid gap-4">
            <div className="p-4 border rounded-lg shadow-sm bg-white">
              <h4 className="font-semibold mb-2">Giới thiệu React</h4>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>React là gì?</li>
                <li>JSX và Component</li>
                <li>Props và State</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg shadow-sm bg-white">
              <h4 className="font-semibold mb-2">React nâng cao</h4>
              <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
                <li>useEffect, useMemo, useCallback</li>
                <li>React Hooks nâng cao</li>
                <li>Quản lý hiệu suất</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Giảng viên */}
        <TabsContent value="instructor">
          <div className="flex flex-col sm:flex-row gap-4 p-6 bg-white border rounded-lg shadow-sm items-center">
            <img
              src="/teacher.png"
              alt="Giảng viên"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h4 className="text-xl font-semibold">Nguyễn Hải Trường</h4>
              <p className="text-gray-600 mt-1">
                Senior Frontend Developer với hơn 800+ năm kinh nghiệm và đã đào tạo hơn 500.000 học viên.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Đánh giá */}
        <TabsContent value="reviews">
          <div className="bg-white border rounded-lg shadow-sm p-6 text-gray-700">
            <p>⭐ 4.8/5 — 2,300 lượt đánh giá từ học viên.</p>
            <p className="mt-2 text-sm text-gray-500">
              “Khóa học rất chi tiết, giúp mình hiểu rõ về React từ cơ bản đến nâng cao!” — Học viên A.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
