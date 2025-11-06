"use client"

import { useState } from "react"
import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { getAllCourses } from "../Data/mockCourses"
import { Star, ListFilter, LayoutGrid, ChevronDown } from "lucide-react"

const CourseCard = ({ course, layout }) => {
  if (layout === 'list') {
    return (
      <Link href={`/courses/${course.slug}`}>
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 flex flex-col sm:flex-row">
          <div className="relative sm:w-1/3">
            <img src={course.image} alt={course.title} className="w-full h-48 sm:h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
          <div className="p-5 flex flex-col flex-grow sm:w-2/3">
            <p className="text-sm font-semibold text-indigo-600 mb-1">{course.category}</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">{course.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">{course.description}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full" />
              <span>{course.instructor.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm mb-4">
              <span className="font-bold text-amber-500">{course.rating}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(course.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}
              </div>
              <span className="text-gray-500">({course.reviews})</span>
            </div>
            <div className="mt-auto flex justify-between items-center">
              <p className="text-xl font-extrabold text-gray-900">{course.price}</p>
              {course.oldPrice && <p className="text-gray-500 line-through">{course.oldPrice}</p>}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 h-full flex flex-col">
        <div className="relative">
          <img src={course.image} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
          {course.discount && (
            <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">-{course.discount}%</div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <p className="text-sm font-semibold text-indigo-600 mb-1">{course.category}</p>
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex-grow group-hover:text-indigo-700 transition-colors">{course.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full" />
            <span>{course.instructor.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mb-4">
            <span className="font-bold text-amber-500">{course.rating}</span>
            <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < Math.round(course.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />)}</div>
            <span className="text-gray-500">({course.reviews})</span>
          </div>
          <div className="mt-auto flex justify-between items-center">
            <p className="text-xl font-extrabold text-gray-900">{course.price}</p>
            {course.oldPrice && <p className="text-gray-500 line-through">{course.oldPrice}</p>}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default function CoursesPage() {
  const courses = getAllCourses();
  const [layout, setLayout] = useState("grid"); // 'grid' or 'list'

  const categories = [...new Set(courses.map(c => c.category))];

  return (
    <div className="bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Tất cả khóa học</h1>
          <p className="mt-2 text-lg text-gray-600">Khám phá các khóa học chất lượng cao để nâng cao kỹ năng của bạn.</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <ListFilter size={20} />
                Bộ lọc
              </h2>

              {/* Category Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Danh mục</h3>
                <ul className="space-y-2">
                  {categories.map(cat => (
                    <li key={cat}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-gray-700">{cat}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Đánh giá</h3>
                <ul className="space-y-2">
                  {[5, 4, 3].map(rating => (
                    <li key={rating}>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => ( <Star key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                          ))} 
                          <span className="ml-2 text-sm text-gray-600">từ {rating} sao</span>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-semibold mb-3">Giá</h3>
                <ul className="space-y-2">
                  <li>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="price" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-gray-700">Tất cả</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="price" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-gray-700">Miễn phí</span>
                    </label>
                  </li>
                  <li>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="price" className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-gray-700">Có phí</span>
                    </label>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <p className="text-gray-600 mb-2 sm:mb-0">Hiển thị {courses.length} khóa học</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sắp xếp theo:</span>
                  <div className="relative">
                    <select className="pl-3 pr-8 py-2 text-sm bg-white border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      <option>Mới nhất</option>
                      <option>Phổ biến nhất</option>
                      <option>Đánh giá cao</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
                  </div>
                </div>
                <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-lg">
                  <button onClick={() => setLayout('grid')} className={`p-2 rounded-md ${layout === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
                    <LayoutGrid size={20} />
                  </button>
                  <button onClick={() => setLayout('list')} className={`p-2 rounded-md ${layout === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
                    <ListFilter size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className={layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-6"}>
              {courses.map(course => (
                <CourseCard key={course.id} course={course} layout={layout} />
              ))}
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  )
}

```

### 2. Nâng cấp Trang Chi tiết Khóa học (`app/(Home)/courses/[id]/page.jsx`)

Tôi sẽ tinh chỉnh lại giao diện trang chi tiết khóa học bạn đã có để nó trông gọn gàng, chuyên nghiệp và tập trung hơn vào việc cung cấp thông tin giá trị cho người dùng.

*   **Hero Section:** Thêm thông tin "Cập nhật lần cuối" và "Ngôn ngữ".
*   **Thẻ Sticky bên phải:** Thiết kế lại để trông cao cấp hơn, với các nút "Thêm vào giỏ hàng" và "Mua ngay" rõ ràng. Phần "Khóa học này bao gồm" được làm nổi bật hơn.
*   **Nội dung khóa học:** Accordion được tinh chỉnh với giao diện sạch sẽ, dễ theo dõi hơn.
*   **Thông tin giảng viên:** Bố cục được cải thiện để làm nổi bật thông tin và chuyên môn của giảng viên.

```diff