"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function LoginPage() {
const router = useRouter();

const [userType, setUserType] = useState("student"); // student | instructor
const [formData, setFormData] = useState({ email: "", password: "" });
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState("");
const [shakeInput, setShakeInput] = useState(false);

// Hiệu ứng rung khi nhập sai
const triggerShake = (msg) => {
setError(msg);
setShakeInput(true);
setTimeout(() => setShakeInput(false), 500);
setIsLoading(false);
};

const handleSubmit = async (e) => {
e.preventDefault();
setIsLoading(true);
setError("");

const apiUrl =
  userType === "student"
    ? "https://localhost:7025/api/Users/Login"
    : "https://localhost:3001/api/Auth/Post/login/Dang_Nhap";

try {
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  if (!res.ok) throw new Error("Đăng nhập thất bại");

  const result = await res.json();
  console.log("Kết quả:", result);

  // Giả sử có roleId hoặc roleName để phân quyền
  if (userType === "instructor" || result.role === "Giảng viên") {
    router.push("/giangvien/tongquan");
  } else {
    router.push("/");
  }
} catch (err) {
  console.error("Lỗi đăng nhập:", err);
  triggerShake("Sai email hoặc mật khẩu!");
}


};

const benefits =
userType === "student"
? [
"Truy cập hàng ngàn khóa học chất lượng",
"Học tập theo tiến độ riêng",
"Nhận chứng chỉ sau khi hoàn thành",
"Tương tác trực tiếp với giảng viên",
"Theo dõi tiến độ học tập chi tiết",
]
: [
"Tạo và quản lý khóa học không giới hạn",
"Theo dõi tiến độ học viên",
"Tạo bài tập và nội dung giảng dạy",
"Nhận doanh thu từ khóa học",
"Phân tích thống kê học viên chi tiết",
];

return (
<>
<Header />
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
<div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
{/* LEFT */}
<div className="hidden lg:block">
<div className="flex items-center gap-3 mb-8">
<div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
<svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
</svg>
</div>
<div>
<h1 className="text-3xl font-bold text-gray-900">EduLearn</h1>
<p className="text-sm text-gray-600">
Nền tảng học trực tuyến hàng đầu
</p>
</div>
</div>

        <h2 className="text-3xl font-bold mb-3 text-gray-900">
          {userType === "student" ? "Nâng cao kỹ năng" : "Chia sẻ kiến thức"}
        </h2>
        <p className="text-gray-600 mb-8">
          {userType === "student"
            ? "Học từ các chuyên gia hàng đầu và phát triển sự nghiệp."
            : "Trở thành giảng viên và chia sẻ kiến thức cùng học viên."}
        </p>

        <div className="space-y-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{b}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 zoom-in">
        <h2 className="text-2xl font-bold mb-2 text-center">Đăng nhập</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Chọn vai trò và đăng nhập
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-full">
          <button
            type="button"
            onClick={() => setUserType("student")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
              userType === "student"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-600"
            }`}
          >
            Học viên
          </button>
          <button
            type="button"
            onClick={() => setUserType("instructor")}
            className={`flex-1 py-2.5 px-4 rounded-full text-sm font-semibold transition-all ${
              userType === "instructor"
                ? "bg-white text-gray-900 shadow-md"
                : "text-gray-600"
            }`}
          >
            Giảng viên
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
              className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                shakeInput ? "shake" : ""
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Mật khẩu *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="••••••••"
              className={`w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-500 ${
                shakeInput ? "shake" : ""
              }`}
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          <p className="text-center text-sm text-gray-600 pt-2">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Đăng ký ngay
            </Link>
          </p>
        </form>
      </div>
    </div>

    <style jsx>{`
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .shake { animation: shake 0.5s ease-in-out; }
      .zoom-in { animation: zoomIn 0.3s ease-out; }
      @keyframes zoomIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
    `}</style>
  </div>
  <Footer />
</>
);
}