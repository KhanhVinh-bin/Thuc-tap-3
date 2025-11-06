"use client"

import CourseCard from "@/components/course-card"

export default function FeaturedCourses() {
  const courses = [
    {
      id: 1,
      title: "Học C++",
      instructor: "Nguyễn Hải Trường",
      image: "/hinhC++.webp",
      price: "1.100.000đ",
      oldPrice: "3.300.000đ",
      rating: 4.8,
      students: "2,500",
      duration: "40h",
      level: "Cơ bản"
    },
    {
      id: 2,
      title: "Python nâng cao",
      instructor: "Nguyễn Hải Trường",
      image: "/advanced-c---development.jpg",
      price: "900.000đ",
      oldPrice: "1.200.000đ",
      rating: 4.9,
      students: "1,800",
      duration: "35h",
      level: "Nâng cao"
    },
    {
      id: 3,
      title: "SQL cơ bản",
      instructor: "Nguyễn Hải Trường",
      image: "/c---for-beginners.jpg",
      price: "900.000đ",
      oldPrice: "1.200.000đ",
      rating: 4.7,
      students: "3,200",
      duration: "25h",
      level: "Cơ bản"
    },
    {
      id: 4,
      title: "CSS VIP PRO MAX",
      instructor: "Phan Ngọc Bích Như",
      image: "/advanced-c---development.jpg",
      price: "450.000đ",
      oldPrice: "950.000đ",
      rating: 4.6,
      students: "1,500",
      duration: "30h",
      level: "Trung cấp"
    },
    {
      id: 5,
      title: "React.js Toàn Tập",
      instructor: "Trần Văn Nam",
      image: "/react-course.png",
      price: "1.200.000đ",
      oldPrice: "2.000.000đ",
      rating: 4.9,
      students: "2,800",
      duration: "45h",
      level: "Nâng cao"
    },
    {
      id: 6,
      title: "Node.js & MongoDB",
      instructor: "Lê Thị Hoa",
      image: "/nodejs-course.jpg",
      price: "1.000.000đ",
      oldPrice: "1.500.000đ",
      rating: 4.8,
      students: "2,100",
      duration: "38h",
      level: "Trung cấp"
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Khóa học nổi bật</h2>
          <p className="text-gray-600 text-lg">Khám phá các khóa học được yêu thích nhất</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="transition-transform hover:scale-105">
              <CourseCard course={course} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
