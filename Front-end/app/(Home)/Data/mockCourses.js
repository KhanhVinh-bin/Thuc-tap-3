// Mock data cho các khóa học


const mockCourses = [
  {
    id: "hoc-c-co-ban",
    title: "Học C++ Cơ Bản",
    slug: "hoc-c-co-ban",
    category: "Lập trình",
    description: "Khóa học C++ từ cơ bản đến nâng cao, bao gồm tất cả kiến thức cần thiết để trở thành một C++ Developer chuyên nghiệp.",
    image: "/hinhC++.webp",
    price: "600.000đ",
    oldPrice: "900.000đ",
    discount: 33,
    rating: 4.8,
    reviews: "1,200",
    students: "85k",
    duration: "40 giờ",
    instructor: {
      name: "Nguyễn Hải Trường",
      title: "Senior C++ Developer",
      bio: "Senior C++ Developer với 10+ năm kinh nghiệm. Đã đào tạo hơn 50,000 học viên.",
      fullBio: "Nguyễn Hải Trường là một Senior C++ Developer với hơn 10 năm kinh nghiệm trong việc phát triển phần mềm và ứng dụng desktop. Anh đã làm việc tại nhiều công ty công nghệ hàng đầu và có kinh nghiệm giảng dạy phong phú.",
      avatar: "/haitruong.jpg",
      totalStudents: "50,000+",
      rating: 4.9,
      totalCourses: 15
    },
    learningOutcomes: [
      "Nắm vững cú pháp và cấu trúc cơ bản của C++",
      "Hiểu về lập trình hướng đối tượng (OOP)",
      "Xây dựng các ứng dụng console đơn giản",
      "Quản lý bộ nhớ và con trỏ hiệu quả",
      "Sử dụng STL (Standard Template Library)",
      "Debug và tối ưu hóa code C++"
    ],
    requirements: [
      "Kiến thức cơ bản về máy tính và hệ điều hành",
      "Không cần kinh nghiệm lập trình trước đó",
      "Máy tính có thể cài đặt IDE (Code::Blocks, Visual Studio)",
      "Tinh thần học hỏi và kiên trì"
    ],
    curriculum: [
      {
        title: "Giới thiệu C++",
        meta: { lessons: "5 bài học", duration: "8 giờ" },
        items: [
          { title: "Lịch sử và đặc điểm của C++", time: "1 giờ" },
          { title: "Cài đặt môi trường phát triển", time: "1.5 giờ" },
          { title: "Chương trình Hello World đầu tiên", time: "2 giờ" },
          { title: "Cú pháp cơ bản và biến", time: "2 giờ" },
          { title: "Kiểu dữ liệu và toán tử", time: "1.5 giờ" }
        ]
      },
      {
        title: "Cấu trúc điều khiển",
        meta: { lessons: "6 bài học", duration: "12 giờ" },
        items: [
          { title: "Câu lệnh if-else", time: "2 giờ" },
          { title: "Vòng lặp for và while", time: "3 giờ" },
          { title: "Switch-case statement", time: "2 giờ" },
          { title: "Break và continue", time: "1.5 giờ" },
          { title: "Nested loops", time: "2 giờ" },
          { title: "Bài tập thực hành", time: "1.5 giờ" }
        ]
      },
      {
        title: "Hàm và mảng",
        meta: { lessons: "8 bài học", duration: "20 giờ" },
        items: [
          { title: "Định nghĩa và gọi hàm", time: "3 giờ" },
          { title: "Tham số và giá trị trả về", time: "2.5 giờ" },
          { title: "Overloading functions", time: "2 giờ" },
          { title: "Mảng một chiều", time: "3 giờ" },
          { title: "Mảng đa chiều", time: "3 giờ" },
          { title: "Con trỏ cơ bản", time: "4 giờ" },
          { title: "Mảng và con trỏ", time: "2 giờ" },
          { title: "Dự án thực hành", time: "0.5 giờ" }
        ]
      }
    ]
  },
  {
    id: "hoc-c-nang-cao",
    title: "Học C++ Nâng Cao",
    slug: "hoc-c-nang-cao",
    category: "Lập trình",
    description: "Khóa học C++ nâng cao dành cho những ai đã có kiến thức cơ bản, tập trung vào OOP, STL, và các kỹ thuật lập trình chuyên sâu.",
    image: "/advanced-c---development.jpg",
    price: "800.000đ",
    oldPrice: "1.200.000đ",
    discount: 33,
    rating: 4.9,
    reviews: "890",
    students: "42k",
    duration: "60 giờ",
    instructor: {
      name: "Nguyễn Hải Trường",
      title: "Senior C++ Developer",
      bio: "Senior C++ Developer với 10+ năm kinh nghiệm. Chuyên gia về OOP và Design Patterns.",
      fullBio: "Nguyễn Hải Trường có hơn 10 năm kinh nghiệm phát triển phần mềm với C++. Anh đã tham gia nhiều dự án lớn và có chuyên môn sâu về lập trình hướng đối tượng, design patterns và tối ưu hóa hiệu suất.",
      avatar: "/haitruong.jpg",
      totalStudents: "50,000+",
      rating: 4.9,
      totalCourses: 15
    },
    learningOutcomes: [
      "Thành thạo lập trình hướng đối tượng với C++",
      "Sử dụng thành thạo STL và các containers",
      "Hiểu và áp dụng Design Patterns",
      "Quản lý bộ nhớ động và smart pointers",
      "Lập trình đa luồng (multithreading)",
      "Tối ưu hóa hiệu suất ứng dụng"
    ],
    requirements: [
      "Đã hoàn thành khóa C++ cơ bản hoặc có kiến thức tương đương",
      "Hiểu về cú pháp cơ bản của C++",
      "Có kinh nghiệm với functions và arrays",
      "Máy tính có cài đặt Visual Studio hoặc IDE tương tự"
    ],
    curriculum: [
      {
        title: "Lập trình hướng đối tượng",
        meta: { lessons: "8 bài học", duration: "20 giờ" },
        items: [
          { title: "Classes và Objects", time: "3 giờ" },
          { title: "Constructors và Destructors", time: "2.5 giờ" },
          { title: "Inheritance (Kế thừa)", time: "3 giờ" },
          { title: "Polymorphism (Đa hình)", time: "3.5 giờ" },
          { title: "Encapsulation (Đóng gói)", time: "2 giờ" },
          { title: "Abstract classes", time: "2.5 giờ" },
          { title: "Virtual functions", time: "2.5 giờ" },
          { title: "Bài tập OOP", time: "1 giờ" }
        ]
      },
      {
        title: "STL và Templates",
        meta: { lessons: "10 bài học", duration: "25 giờ" },
        items: [
          { title: "Giới thiệu STL", time: "2 giờ" },
          { title: "Vectors và Arrays", time: "3 giờ" },
          { title: "Lists và Deques", time: "2.5 giờ" },
          { title: "Maps và Sets", time: "3 giờ" },
          { title: "Algorithms trong STL", time: "3.5 giờ" },
          { title: "Iterators", time: "2.5 giờ" },
          { title: "Function Templates", time: "3 giờ" },
          { title: "Class Templates", time: "3 giờ" },
          { title: "Template Specialization", time: "2 giờ" },
          { title: "Dự án STL", time: "0.5 giờ" }
        ]
      },
      {
        title: "Chủ đề nâng cao",
        meta: { lessons: "6 bài học", duration: "15 giờ" },
        items: [
          { title: "Smart Pointers", time: "3 giờ" },
          { title: "Exception Handling", time: "2.5 giờ" },
          { title: "File I/O Operations", time: "2 giờ" },
          { title: "Multithreading cơ bản", time: "4 giờ" },
          { title: "Design Patterns", time: "3 giờ" },
          { title: "Dự án cuối khóa", time: "0.5 giờ" }
        ]
      }
    ]
  },
  {
    id: "thuat-toan-cpp",
    title: "Thuật Toán C++",
    slug: "thuat-toan-cpp",
    category: "Thuật toán",
    description: "Khóa học chuyên sâu về thuật toán và cấu trúc dữ liệu sử dụng ngôn ngữ C++, chuẩn bị cho các kỳ thi lập trình và phỏng vấn.",
    image: "/c---for-beginners.jpg",
    price: "750.000đ",
    oldPrice: "1.000.000đ",
    discount: 25,
    rating: 4.7,
    reviews: "650",
    students: "28k",
    duration: "50 giờ",
    instructor: {
      name: "Trần Minh Đức",
      title: "Algorithm Specialist",
      bio: "Chuyên gia thuật toán với 8+ năm kinh nghiệm. Từng đạt giải cao tại ACM-ICPC.",
      fullBio: "Trần Minh Đức là chuyên gia về thuật toán và cấu trúc dữ liệu với hơn 8 năm kinh nghiệm. Anh từng tham gia và đạt giải cao tại nhiều cuộc thi lập trình quốc tế như ACM-ICPC, và hiện đang làm việc tại một công ty công nghệ hàng đầu.",
      avatar: "/instructor-teaching.jpg",
      totalStudents: "35,000+",
      rating: 4.8,
      totalCourses: 8
    },
    learningOutcomes: [
      "Nắm vững các thuật toán sắp xếp và tìm kiếm",
      "Hiểu và cài đặt các cấu trúc dữ liệu cơ bản",
      "Phân tích độ phức tạp thuật toán (Big O)",
      "Giải quyết các bài toán lập trình thi đấu",
      "Áp dụng thuật toán vào các bài toán thực tế",
      "Tối ưu hóa hiệu suất thuật toán"
    ],
    requirements: [
      "Có kiến thức C++ cơ bản đến trung cấp",
      "Hiểu về functions, arrays và pointers",
      "Kiến thức toán học cấp 3",
      "Tư duy logic tốt"
    ],
    curriculum: [
      {
        title: "Cấu trúc dữ liệu cơ bản",
        meta: { lessons: "7 bài học", duration: "18 giờ" },
        items: [
          { title: "Arrays và Linked Lists", time: "3 giờ" },
          { title: "Stacks và Queues", time: "2.5 giờ" },
          { title: "Trees và Binary Trees", time: "3.5 giờ" },
          { title: "Binary Search Trees", time: "3 giờ" },
          { title: "Heaps và Priority Queues", time: "2.5 giờ" },
          { title: "Hash Tables", time: "2.5 giờ" },
          { title: "Graphs cơ bản", time: "1 giờ" }
        ]
      },
      {
        title: "Thuật toán sắp xếp và tìm kiếm",
        meta: { lessons: "6 bài học", duration: "15 giờ" },
        items: [
          { title: "Bubble Sort, Selection Sort", time: "2 giờ" },
          { title: "Insertion Sort, Shell Sort", time: "2 giờ" },
          { title: "Merge Sort", time: "2.5 giờ" },
          { title: "Quick Sort", time: "3 giờ" },
          { title: "Heap Sort, Radix Sort", time: "2.5 giờ" },
          { title: "Binary Search và biến thể", time: "3 giờ" }
        ]
      },
      {
        title: "Thuật toán nâng cao",
        meta: { lessons: "8 bài học", duration: "17 giờ" },
        items: [
          { title: "Dynamic Programming", time: "3 giờ" },
          { title: "Greedy Algorithms", time: "2 giờ" },
          { title: "Graph Traversal (DFS, BFS)", time: "2.5 giờ" },
          { title: "Shortest Path Algorithms", time: "2.5 giờ" },
          { title: "Minimum Spanning Tree", time: "2 giờ" },
          { title: "String Algorithms", time: "2 giờ" },
          { title: "Backtracking", time: "2 giờ" },
          { title: "Contests và bài tập", time: "1 giờ" }
        ]
      }
    ]
  },
  {
    id: "react-co-ban",
    title: "Khóa học phát triển React",
    slug: "react-co-ban",
    category: "Lập trình",
    description: "Khóa học React từ cơ bản đến nâng cao, bao gồm tất cả kiến thức cần thiết để trở thành một React Developer chuyên nghiệp.",
    image: "/react-course-preview.jpg",
    price: "900.000đ",
    oldPrice: "4.000.000đ",
    discount: 78,
    rating: 4.6,
    reviews: "2,300",
    students: "104k",
    duration: "45 giờ",
    instructor: {
      name: "Hoàng Phúc",
      title: "Senior Frontend Developer",
      bio: "Senior Frontend Developer với 8+ năm kinh nghiệm. Đã đào tạo hơn 500,000 học viên.",
      fullBio: "Hoàng Phúc là một Senior Frontend Developer với hơn 8 năm kinh nghiệm trong việc phát triển ứng dụng web hiện đại. Anh có chuyên môn sâu về React, JavaScript và các công nghệ frontend tiên tiến.",
      avatar: "/instructor-teaching.jpg",
      totalStudents: "500,000+",
      rating: 4.9,
      totalCourses: 25
    },
    learningOutcomes: [
      "Nắm vững các khái niệm cơ bản về React",
      "Xây dựng ứng dụng web hiện đại với React Hooks",
      "Quản lý state với Context API và Redux",
      "Tích hợp API và xử lý bất đồng bộ",
      "Tối ưu hóa performance và best practices",
      "Deploy ứng dụng lên production"
    ],
    requirements: [
      "Kiến thức cơ bản về HTML, CSS, JavaScript",
      "Máy tính có thể cài đặt Node.js",
      "Hiểu biết về ES6+ features"
    ],
    curriculum: [
      {
        title: "Giới thiệu React",
        meta: { lessons: "4 bài học", duration: "10 giờ" },
        items: [
          { title: "JSX cơ bản", time: "45 phút" },
          { title: "Cấu trúc ứng dụng", time: "2 giờ 15 phút" },
          { title: "JSX và Components", time: "2 giờ 15 phút" },
          { title: "Props và State", time: "5 giờ" }
        ]
      },
      {
        title: "React nâng cao",
        meta: { lessons: "8 bài học", duration: "35 giờ" },
        items: [
          { title: "Hiểu sâu về Hooks", time: "10 giờ" },
          { title: "useEffect nâng cao & tối ưu Performance", time: "15 giờ" },
          { title: "useMemo và useCallback", time: "10 giờ" }
        ]
      }
    ]
  }
];

// Hàm lấy khóa học theo ID
export const getCourseById = (id) => {
  return mockCourses.find(course => course.id === id || course.slug === id);
};

// Hàm lấy tất cả khóa học
export const getAllCourses = () => {
  return mockCourses;
};

// Hàm lấy khóa học theo category
export const getCoursesByCategory = (category) => {
  return mockCourses.filter(course => course.category.toLowerCase() === category.toLowerCase());
};

export default mockCourses;